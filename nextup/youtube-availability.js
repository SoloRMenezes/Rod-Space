(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.NextUpYouTubeAvailability = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  const CACHE_KEY = "nextup-youtube-availability-v1";
  const METADATA_TTL = 6 * 60 * 60 * 1000;
  const DEFINITE_FAILURE_TTL = 7 * 24 * 60 * 60 * 1000;
  const HTML5_FAILURE_TTL = 60 * 60 * 1000;
  const MAX_ENTRIES = 200;

  function getViewerCountry(language) {
    const parts = String(language || "").split("-");
    const candidate = parts.at(-1) || "";
    return parts.length > 1 && /^[a-z]{2}$/i.test(candidate) ? candidate.toUpperCase() : "";
  }

  function isVideoMetadataPlayable(video, country = "") {
    if (video?.status?.embeddable === false) return { playable: false, reason: "not-embeddable" };
    if (video?.status?.privacyStatus && video.status.privacyStatus !== "public") {
      return { playable: false, reason: "not-public" };
    }
    if (video?.status?.uploadStatus && video.status.uploadStatus !== "processed") {
      return { playable: false, reason: "not-ready" };
    }

    const restriction = video?.contentDetails?.regionRestriction;
    if (Array.isArray(restriction?.allowed)) {
      if (!restriction.allowed.length || (country && !restriction.allowed.includes(country))) {
        return { playable: false, reason: "region-blocked" };
      }
    }
    if (country && Array.isArray(restriction?.blocked) && restriction.blocked.includes(country)) {
      return { playable: false, reason: "region-blocked" };
    }
    return { playable: true, reason: "metadata-eligible" };
  }

  function removeUnplayableVideoFromActiveState(state, videoId) {
    if (!state || !videoId) return;
    const session = state.activeSession;
    if (session) {
      const removedIds = new Set(
        (session.queue || []).filter((song) => song.videoId === videoId).map((song) => song.id)
      );
      session.queue = (session.queue || []).filter((song) => song.videoId !== videoId);
      session.completedIds = (session.completedIds || []).filter((songId) => !removedIds.has(songId));
      if (removedIds.has(session.currentSongId)) session.currentSongId = null;
    }
    state.recentSongs = (state.recentSongs || []).filter((song) => song.videoId !== videoId);
  }

  function createYouTubeAvailabilityCache({ storage, now = Date.now } = {}) {
    const backingStore = storage || (typeof localStorage !== "undefined" ? localStorage : null);

    function read() {
      if (!backingStore) return {};
      try {
        const parsed = JSON.parse(backingStore.getItem(CACHE_KEY) || "{}");
        return parsed && typeof parsed === "object" ? parsed : {};
      } catch {
        return {};
      }
    }

    function write(entries) {
      if (!backingStore) return;
      const currentTime = now();
      const kept = Object.entries(entries)
        .filter(([, entry]) => entry?.expiresAt > currentTime)
        .sort((a, b) => b[1].checkedAt - a[1].checkedAt)
        .slice(0, MAX_ENTRIES);
      try {
        backingStore.setItem(CACHE_KEY, JSON.stringify(Object.fromEntries(kept)));
      } catch {
        // Availability caching is an optimization; playback must still work without storage.
      }
    }

    function get(videoId) {
      const entries = read();
      const entry = entries[videoId];
      if (!entry || entry.expiresAt <= now()) return null;
      return entry;
    }

    function record(videoId, playable, reason, ttl) {
      if (!videoId) return;
      const entries = read();
      const checkedAt = now();
      entries[videoId] = { playable, reason, checkedAt, expiresAt: checkedAt + ttl };
      write(entries);
    }

    return {
      get,
      isKnownUnplayable(videoId) {
        return get(videoId)?.playable === false;
      },
      recordMetadata(videoId, result) {
        record(videoId, result.playable, result.reason, METADATA_TTL);
      },
      recordNotFound(videoId) {
        record(videoId, false, "not-found", METADATA_TTL);
      },
      recordPlaybackFailure(videoId, errorCode) {
        const code = Number(errorCode);
        if ([2, 100, 101, 150].includes(code)) {
          record(videoId, false, `iframe-${code}`, DEFINITE_FAILURE_TTL);
        } else if (code === 5) {
          record(videoId, false, "iframe-5", HTML5_FAILURE_TTL);
        }
      }
    };
  }

  return {
    createYouTubeAvailabilityCache,
    getViewerCountry,
    isVideoMetadataPlayable,
    removeUnplayableVideoFromActiveState
  };
});
