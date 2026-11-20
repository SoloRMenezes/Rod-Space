const assert = require("node:assert/strict");

const {
  createYouTubeAvailabilityCache,
  getViewerCountry,
  isVideoMetadataPlayable,
  removeUnplayableVideoFromActiveState
} = require("../nextup/youtube-availability.js");

function memoryStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value)
  };
}

assert.equal(getViewerCountry("pt-PT"), "PT");
assert.equal(getViewerCountry("en"), "");

assert.deepEqual(isVideoMetadataPlayable({ status: { embeddable: false } }, "PT"), {
  playable: false,
  reason: "not-embeddable"
});
assert.deepEqual(isVideoMetadataPlayable({
  status: { embeddable: true },
  contentDetails: { regionRestriction: { blocked: ["PT", "ES"] } }
}, "PT"), { playable: false, reason: "region-blocked" });
assert.deepEqual(isVideoMetadataPlayable({
  status: { embeddable: true },
  contentDetails: { regionRestriction: { allowed: ["US"] } }
}, "PT"), { playable: false, reason: "region-blocked" });
assert.deepEqual(isVideoMetadataPlayable({ status: { embeddable: true } }, "PT"), {
  playable: true,
  reason: "metadata-eligible"
});

let now = 1_000_000;
const cache = createYouTubeAvailabilityCache({ storage: memoryStorage(), now: () => now });
cache.recordMetadata("metadata-ok", { playable: true, reason: "metadata-eligible" });
assert.equal(cache.isKnownUnplayable("metadata-ok"), false);

cache.recordMetadata("blocked", { playable: false, reason: "not-embeddable" });
assert.equal(cache.isKnownUnplayable("blocked"), true);

cache.recordPlaybackFailure("iframe-denied", 101);
assert.equal(cache.isKnownUnplayable("iframe-denied"), true);

cache.recordPlaybackFailure("client-identity", 153);
assert.equal(cache.isKnownUnplayable("client-identity"), false);

cache.recordPlaybackFailure("html5-failure", 5);
assert.equal(cache.isKnownUnplayable("html5-failure"), true);
now += 60 * 60 * 1000 + 1;
assert.equal(cache.isKnownUnplayable("html5-failure"), false);

const appState = {
  activeSession: {
    queue: [
      { id: "failed-song", videoId: "failed-video" },
      { id: "good-song", videoId: "good-video", status: "upcoming" }
    ],
    currentSongId: "failed-song",
    completedIds: ["failed-song"]
  },
  recentSongs: [
    { videoId: "failed-video" },
    { videoId: "good-video" }
  ],
  playlists: [{
    songs: [
      { id: "saved-failure", videoId: "failed-video" },
      { id: "saved-good", videoId: "good-video" }
    ]
  }]
};
removeUnplayableVideoFromActiveState(appState, "failed-video");
assert.deepEqual(appState.activeSession.queue.map((song) => song.id), ["good-song"]);
assert.equal(appState.activeSession.currentSongId, null);
assert.deepEqual(appState.activeSession.completedIds, []);
assert.deepEqual(appState.recentSongs.map((song) => song.videoId), ["good-video"]);
assert.deepEqual(appState.playlists[0].songs.map((song) => song.id), ["saved-failure", "saved-good"]);

console.log("NextUp YouTube availability tests passed.");
