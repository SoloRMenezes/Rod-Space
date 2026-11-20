const assert = require("node:assert/strict");

const {
  createYouTubeAvailabilityCache,
  getViewerCountry,
  isVideoMetadataPlayable
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

console.log("NextUp YouTube availability tests passed.");
