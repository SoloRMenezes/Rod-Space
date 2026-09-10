export async function requestCameraAccess(
  media = navigator.mediaDevices,
  secure = isSecureContext,
) {
  if (!secure) throw Error("Open this app over HTTPS to allow camera access.");
  if (!media?.getUserMedia)
    throw Error("Camera access is unavailable. Try Safari or Chrome.");
  let stream;
  try {
    stream = await media.getUserMedia({
      audio: false,
      video: { facingMode: { ideal: "user" } },
    });
  } catch (error) {
    if (error.name === "NotAllowedError")
      throw Error(
        "Allow camera access in your browser’s website settings, then try again.",
      );
    if (error.name === "NotFoundError")
      throw Error("No camera found. Open this app on your phone.");
    throw Error("Tap Try again to allow camera access.");
  } finally {
    stream?.getTracks().forEach((track) => track.stop());
  }
}

export class CameraTracker {
  constructor(video, onSample, onError) {
    this.video = video;
    this.onSample = onSample;
    this.onError = onError;
    this.running = false;
    this.generation = 0;
  }
  async open() {
    if (!isSecureContext)
      throw Error(
        "Camera access needs HTTPS. Open the installed app or an HTTPS address in Safari. A plain HTTP address on another device will not work.",
      );
    if (
      !navigator.mediaDevices?.getUserMedia ||
      typeof WebAssembly === "undefined"
    )
      throw Error(
        "Camera tracking is unavailable in this browser. Try an up-to-date Safari or Chrome.",
      );
    const generation = ++this.generation;
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: "user" },
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 24, max: 30 },
        },
      });
      if (generation !== this.generation) {
        this.stream.getTracks().forEach((t) => t.stop());
        return;
      }
      this.video.srcObject = this.stream;
      await this.video.play();
      const { FaceDetector, FilesetResolver } = await import(
        "../vendor/vision_bundle.mjs"
      );
      const files = await FilesetResolver.forVisionTasks(
        new URL("../vendor/wasm", import.meta.url).href,
      );
      const detector = await FaceDetector.createFromOptions(files, {
        baseOptions: {
          modelAssetPath: new URL(
            "../vendor/blaze_face_short_range.tflite",
            import.meta.url,
          ).href,
          delegate: "CPU",
        },
        runningMode: "VIDEO",
        minDetectionConfidence: 0.7,
        minSuppressionThreshold: 0.3,
      });
      if (generation !== this.generation) {
        detector.close();
        return;
      }
      this.detector = detector;
      this.running = true;
      this.lastFrame = -1;
      this.lastRun = 0;
      this.stream.getVideoTracks()[0].addEventListener("ended", () => {
        if (this.running)
          this.onError(
            Error("The camera stopped. Your counted reps have been kept."),
          );
      });
      this.loop();
    } catch (error) {
      this.stop();
      if (error.name === "NotAllowedError")
        throw Error(
          "Camera permission was denied. Allow camera access for this website in Safari’s website settings, then try again.",
        );
      if (error.name === "NotFoundError")
        throw Error(
          "No camera was found. Open this app on a phone with a front camera.",
        );
      throw error;
    }
  }
  loop = () => {
    if (!this.running) return;
    const now = performance.now();
    if (
      this.video.readyState >= 2 &&
      this.video.currentTime !== this.lastFrame &&
      now - this.lastRun >= 65
    ) {
      this.lastRun = now;
      this.lastFrame = this.video.currentTime;
      try {
        const faces = this.detector.detectForVideo(this.video, now).detections;
        let sample = null;
        if (faces.length === 1) {
          const b = faces[0].boundingBox,
            w = this.video.videoWidth,
            h = this.video.videoHeight;
          const x = (b.originX + b.width / 2) / w,
            y = (b.originY + b.height / 2) / h;
          // Reject clipped faces and lateral entries rather than counting a jump.
          if (
            b.originX > 2 &&
            b.originY > 2 &&
            b.originX + b.width < w - 2 &&
            b.originY + b.height < h - 2 &&
            x > 0.15 &&
            x < 0.85 &&
            y > 0.12 &&
            y < 0.88
          )
            sample = {
              size: Math.sqrt(b.width * b.height) / Math.min(w, h),
              x,
              y,
            };
        }
        this.onSample(sample, now);
      } catch (error) {
        this.stop();
        this.onError(
          Error(
            "Camera tracking stopped. Your counted reps have been kept. " +
              error.message,
          ),
        );
        return;
      }
    }
    this.frame = requestAnimationFrame(this.loop);
  };
  stop() {
    this.generation++;
    this.running = false;
    cancelAnimationFrame(this.frame);
    this.stream?.getTracks().forEach((t) => t.stop());
    this.video.srcObject = null;
    this.detector?.close();
    this.detector = null;
  }
}
