import type { PoseLandmarker } from "@mediapipe/tasks-vision";
import type { TryOnGarment } from "@/features/catalog/types";

const MEDIAPIPE_VERSION = "1.0.1";
const WASM_BASE = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/wasm`;
const POSE_MODEL = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";

// MediaPipe pose landmark indices.
const LEFT_SHOULDER = 11;
const RIGHT_SHOULDER = 12;
const LEFT_HIP = 23;
const RIGHT_HIP = 24;

/** Clothes sit slightly outside the shoulder joints that MediaPipe reports. */
const SHOULDER_EASE = 1.12;
const SMOOTHING = 0.45;

export type OverlayStatus = "loading" | "tracking" | "searching" | "error";
export type OverlaySource = HTMLVideoElement | HTMLImageElement;

type Point = { x: number; y: number };
type BodyPoints = { shoulderL: Point; shoulderR: Point; hipL: Point | null; hipR: Point | null };

let landmarkerPromise: Promise<PoseLandmarker> | null = null;

function loadLandmarker() {
  landmarkerPromise ??= (async () => {
    const { FilesetResolver, PoseLandmarker } = await import("@mediapipe/tasks-vision");
    const fileset = await FilesetResolver.forVisionTasks(WASM_BASE);
    const options = { runningMode: "VIDEO" as const, numPoses: 1, minPoseDetectionConfidence: 0.5, minTrackingConfidence: 0.5 };
    try {
      return await PoseLandmarker.createFromOptions(fileset, { ...options, baseOptions: { modelAssetPath: POSE_MODEL, delegate: "GPU" } });
    } catch {
      return PoseLandmarker.createFromOptions(fileset, { ...options, baseOptions: { modelAssetPath: POSE_MODEL, delegate: "CPU" } });
    }
  })();
  landmarkerPromise.catch(() => { landmarkerPromise = null; });
  return landmarkerPromise;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Unable to load ${src}`));
    image.src = src;
  });
}

function sourceSize(source: OverlaySource) {
  return source instanceof HTMLVideoElement
    ? { width: source.videoWidth, height: source.videoHeight }
    : { width: source.naturalWidth, height: source.naturalHeight };
}

function smooth(from: Point | null | undefined, to: Point): Point {
  if (!from) return to;
  return { x: from.x + (to.x - from.x) * SMOOTHING, y: from.y + (to.y - from.y) * SMOOTHING };
}

function drawSource(context: CanvasRenderingContext2D, source: OverlaySource, width: number, height: number, mirrored: boolean) {
  context.save();
  if (mirrored) {
    context.translate(width, 0);
    context.scale(-1, 1);
  }
  context.drawImage(source, 0, 0, width, height);
  context.restore();
}

function drawGarment(context: CanvasRenderingContext2D, garment: TryOnGarment, image: HTMLImageElement, body: BodyPoints) {
  const gw = image.naturalWidth;
  const gh = image.naturalHeight;
  const a1 = { x: garment.leftShoulder[0] * gw, y: garment.leftShoulder[1] * gh };
  const a2 = { x: garment.rightShoulder[0] * gw, y: garment.rightShoulder[1] * gh };
  const anchorMid = { x: (a1.x + a2.x) / 2, y: (a1.y + a2.y) / 2 };
  const anchorWidth = Math.hypot(a2.x - a1.x, a2.y - a1.y);

  const { shoulderL, shoulderR, hipL, hipR } = body;
  const dx = shoulderR.x - shoulderL.x;
  const dy = shoulderR.y - shoulderL.y;
  const shoulderWidth = Math.hypot(dx, dy);
  if (shoulderWidth < 8 || anchorWidth < 1) return;

  const angle = Math.atan2(dy, dx) - Math.atan2(a2.y - a1.y, a2.x - a1.x);
  const scale = (shoulderWidth / anchorWidth) * SHOULDER_EASE;
  const bodyMid = { x: (shoulderL.x + shoulderR.x) / 2, y: (shoulderL.y + shoulderR.y) / 2 };

  let stretch = 1;
  if (hipL && hipR) {
    const hipMid = { x: (hipL.x + hipR.x) / 2, y: (hipL.y + hipR.y) / 2 };
    // Torso length measured perpendicular to the shoulder line.
    const torso = Math.abs((hipMid.x - bodyMid.x) * -dy + (hipMid.y - bodyMid.y) * dx) / shoulderWidth;
    const garmentTorso = (garment.hemY * gh - anchorMid.y) * scale;
    if (garmentTorso > 0) stretch = Math.min(1.35, Math.max(0.8, torso / garmentTorso));
  }

  context.save();
  context.translate(bodyMid.x, bodyMid.y);
  context.rotate(angle);
  context.scale(scale, scale * stretch);
  context.drawImage(image, -anchorMid.x, -anchorMid.y);
  context.restore();
}

export type LiveOverlay = {
  setGarment(garment: TryOnGarment): void;
  /** Returns the current frame without the garment, as the shopper sees it. */
  captureClean(type?: string, quality?: number): string | null;
  stop(): void;
};

export function startLiveOverlay(options: {
  canvas: HTMLCanvasElement;
  source: OverlaySource;
  mirrored: boolean;
  garment: TryOnGarment;
  onStatus: (status: OverlayStatus) => void;
}): LiveOverlay {
  const { canvas, source, mirrored, onStatus } = options;
  const context = canvas.getContext("2d");
  let garment = options.garment;
  let garmentImage: HTMLImageElement | null = null;
  let landmarker: PoseLandmarker | null = null;
  let body: BodyPoints | null = null;
  let frame = 0;
  let lastTimestamp = 0;
  let lastStatus: OverlayStatus | null = null;
  let stopped = false;
  const isStill = source instanceof HTMLImageElement;
  let stillFrames = 0;

  const report = (status: OverlayStatus) => {
    if (status !== lastStatus) {
      lastStatus = status;
      onStatus(status);
    }
  };

  const loadGarment = (next: TryOnGarment) => {
    garment = next;
    void loadImage(next.image).then((image) => {
      if (garment === next) garmentImage = image;
    }).catch(() => report("error"));
  };

  const render = () => {
    if (stopped || !context) return;
    frame = requestAnimationFrame(render);
    const { width, height } = sourceSize(source);
    if (!width || !height) return;
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    drawSource(context, source, width, height, mirrored);
    if (!landmarker) return;
    if (isStill && stillFrames > 30) {
      if (body && garmentImage) drawGarment(context, garment, garmentImage, body);
      return;
    }

    const timestamp = Math.max(performance.now(), lastTimestamp + 1);
    lastTimestamp = timestamp;
    const landmarks = landmarker.detectForVideo(source, timestamp).landmarks[0];
    const visible = (index: number) => landmarks && (landmarks[index].visibility ?? 1) > 0.5;
    const toScreen = (index: number): Point => ({ x: (mirrored ? 1 - landmarks[index].x : landmarks[index].x) * width, y: landmarks[index].y * height });

    if (landmarks && visible(LEFT_SHOULDER) && visible(RIGHT_SHOULDER)) {
      // Screen-left shoulder is the wearer's left in a mirrored selfie view and the wearer's right in a normal photo.
      const [sl, sr, hl, hr] = mirrored ? [LEFT_SHOULDER, RIGHT_SHOULDER, LEFT_HIP, RIGHT_HIP] : [RIGHT_SHOULDER, LEFT_SHOULDER, RIGHT_HIP, LEFT_HIP];
      const hipsVisible = visible(hl) && visible(hr);
      body = {
        shoulderL: smooth(body?.shoulderL, toScreen(sl)),
        shoulderR: smooth(body?.shoulderR, toScreen(sr)),
        hipL: hipsVisible ? smooth(body?.hipL, toScreen(hl)) : null,
        hipR: hipsVisible ? smooth(body?.hipR, toScreen(hr)) : null,
      };
      stillFrames += 1;
      report("tracking");
    } else {
      body = null;
      stillFrames = 0;
      report("searching");
    }
    if (body && garmentImage) drawGarment(context, garment, garmentImage, body);
  };

  report("loading");
  loadGarment(garment);
  frame = requestAnimationFrame(render);
  loadLandmarker().then((instance) => {
    if (!stopped) landmarker = instance;
  }).catch(() => report("error"));

  return {
    setGarment: loadGarment,
    captureClean(type = "image/jpeg", quality = 0.9) {
      const { width, height } = sourceSize(source);
      if (!width || !height) return null;
      const capture = document.createElement("canvas");
      capture.width = width;
      capture.height = height;
      const captureContext = capture.getContext("2d");
      if (!captureContext) return null;
      drawSource(captureContext, source, width, height, mirrored);
      return capture.toDataURL(type, quality);
    },
    stop() {
      stopped = true;
      cancelAnimationFrame(frame);
    },
  };
}
