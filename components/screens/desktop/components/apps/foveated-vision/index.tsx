"use client";

import { Camera, Eye, Focus, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { motion } from "motion/react";
import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type TrackerStatus = "idle" | "requesting" | "warming" | "ready" | "error";

type GazePoint = {
  x: number;
  y: number;
  confidence: number;
};

const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task";
const WASM_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";

export function FoveatedVisionApp({ instanceId: _ }: { instanceId: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const overlayRef = useRef<HTMLCanvasElement | null>(null);
  const landmarkerRef = useRef<unknown>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>();
  const smoothedRef = useRef<GazePoint>({ x: 0.5, y: 0.5, confidence: 0 });
  const lastUiPushRef = useRef(0);
  const lastFrameTimeRef = useRef(performance.now());

  const [status, setStatus] = useState<TrackerStatus>("idle");
  const [statusDetail, setStatusDetail] = useState("Camera idle");
  const [gaze, setGaze] = useState<GazePoint>({
    x: 0.5,
    y: 0.5,
    confidence: 0,
  });
  const [fps, setFps] = useState(0);
  const [focusSize, setFocusSize] = useState(22);
  const [focusFeather, setFocusFeather] = useState(26);
  const [peripheralBlur, setPeripheralBlur] = useState(10);
  const [peripheralDim, setPeripheralDim] = useState(0.38);
  const [showOverlay, setShowOverlay] = useState(true);

  const stopPipeline = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    rafRef.current = undefined;
    if (landmarkerRef.current && "close" in (landmarkerRef.current as object)) {
      (landmarkerRef.current as { close: () => void }).close();
    }
    landmarkerRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    streamRef.current = null;
  }, []);

  const drawOverlay = useCallback(
    (point: GazePoint) => {
      const canvas = overlayRef.current;
      const video = videoRef.current;
      if (!canvas || !video) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const w = video.videoWidth || 1280;
      const h = video.videoHeight || 720;
      if (canvas.width !== w) canvas.width = w;
      if (canvas.height !== h) canvas.height = h;

      ctx.clearRect(0, 0, w, h);
      if (point.confidence < 0.1) return;

      const x = point.x * w;
      const y = point.y * h;
      ctx.save();
      ctx.strokeStyle = "rgba(102, 224, 255, 0.85)";
      ctx.fillStyle = "rgba(102, 224, 255, 0.15)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 54, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.arc(x, y, 94, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    },
    [overlayRef, videoRef],
  );

  const startPipeline = useCallback(async () => {
    if (typeof navigator === "undefined" || !videoRef.current) return;
    stopPipeline();
    setStatus("requesting");
    setStatusDetail("Requesting camera access");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      video.srcObject = stream;
      await video.play();
    } catch (error) {
      setStatus("error");
      setStatusDetail(
        "Camera unavailable. Enable webcam permissions to start tracking.",
      );
      return;
    }

    setStatus("warming");
    setStatusDetail("Loading face landmarker");

    try {
      const vision = await import("@mediapipe/tasks-vision");
      const { FaceLandmarker, FilesetResolver } = vision;
      const fileset = await FilesetResolver.forVisionTasks(WASM_URL);
      const landmarker = await FaceLandmarker.createFromOptions(fileset, {
        baseOptions: {
          modelAssetPath: MODEL_URL,
        },
        runningMode: "VIDEO",
        numFaces: 1,
        outputFaceBlendshapes: false,
        outputFacialTransformationMatrixes: false,
      });

      landmarkerRef.current = landmarker;
      setStatus("ready");
      setStatusDetail("Live eye focus locked");

      const loop = () => {
        const video = videoRef.current;
        if (!video || !landmarkerRef.current) return;

        const now = performance.now();
        const result = (landmarkerRef.current as {
          detectForVideo: (v: HTMLVideoElement, ts: number) => {
            faceLandmarks?: Array<Array<{ x: number; y: number }>>;
          };
        }).detectForVideo(video, now);

        if (result?.faceLandmarks?.[0]) {
          const focus = getFocusPoint(result.faceLandmarks[0]);
          const smoothed = smoothGaze(smoothedRef.current, focus);
          smoothedRef.current = smoothed;

          if (now - lastUiPushRef.current > 80) {
            setGaze(smoothed);
            setFps(calculateFps(now, lastFrameTimeRef));
            lastUiPushRef.current = now;
          }
          if (showOverlay) {
            drawOverlay(smoothed);
          }
        } else {
          const degraded = smoothGaze(smoothedRef.current, {
            x: 0.5,
            y: 0.5,
            confidence: 0,
          });
          smoothedRef.current = degraded;
          if (now - lastUiPushRef.current > 120) {
            setGaze(degraded);
            lastUiPushRef.current = now;
          }
          if (showOverlay) {
            drawOverlay(degraded);
          }
        }

        rafRef.current = requestAnimationFrame(loop);
      };

      rafRef.current = requestAnimationFrame(loop);
    } catch (error) {
      setStatus("error");
      setStatusDetail("Failed to load face model");
    }
  }, [drawOverlay, showOverlay, stopPipeline]);

  useEffect(() => {
    startPipeline();
    return () => {
      stopPipeline();
    };
  }, [startPipeline, stopPipeline]);

  const maskStyle = useMemo(() => {
    const inner = Math.max(focusSize, 8);
    const outer = inner + focusFeather;
    const gradient = `radial-gradient(circle at ${gaze.x * 100}% ${gaze.y * 100}%, rgba(0,0,0,1) 0%, rgba(0,0,0,1) ${inner}%, rgba(0,0,0,0) ${outer}%)`;
    return {
      WebkitMaskImage: gradient,
      maskImage: gradient,
    } as const;
  }, [focusFeather, focusSize, gaze.x, gaze.y]);

  return (
    <div className="flex h-full w-full flex-col bg-[#04060c] text-white">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[420px_1fr]">
        <div className="relative overflow-hidden border border-white/10 bg-white/[0.02] px-5 pb-5 pt-6 shadow-[0_10px_80px_rgba(0,0,0,0.35)]">
          <GradientRays />
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-400/30">
              <Eye className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-[0.2em] text-cyan-200/80">
                OLED Guardian
              </span>
              <h1 className="text-lg font-semibold text-white">
                Foveated Vision Lab
              </h1>
            </div>
          </div>

          <p className="relative z-10 mt-3 text-sm text-white/70">
            Camera-powered gaze tracking that keeps the scene razor sharp where
            you look while gently feathering the periphery. Built to flex on
            Twitter with real-time overlays and zero-burn zones.
          </p>

          <div className="relative z-10 mt-4 flex flex-wrap items-center gap-2">
            <StatusPill status={status} detail={statusDetail} />
            <Chip icon={<ShieldCheck className="size-3.5" />}>HDR-safe blend</Chip>
            <Chip icon={<Sparkles className="size-3.5" />}>VR-style falloff</Chip>
          </div>

          <div className="relative z-10 mt-6 space-y-3 rounded-2xl border border-white/10 bg-black/40 p-3 backdrop-blur-xl">
            <div className="relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-black/40">
              <video
                ref={videoRef}
                className="absolute inset-0 h-full w-full object-cover opacity-80"
                playsInline
                autoPlay
                muted
              />
              <canvas
                ref={overlayRef}
                className={cn(
                  "absolute inset-0 h-full w-full",
                  showOverlay ? "opacity-100" : "opacity-0",
                )}
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/80 via-black/20 to-transparent px-3 pb-2 pt-6 text-xs text-white/80">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 font-mono text-[11px] text-cyan-200">
                    <Camera className="size-3" />
                    {fps ? `${fps.toFixed(0)} fps` : "warming"}
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 font-mono text-[11px] text-lime-200">
                    <Focus className="size-3" />
                    {(gaze.confidence * 100).toFixed(0)}% lock
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={startPipeline}
                  className="h-7 rounded-full bg-white/10 px-3 text-[11px]"
                >
                  Restart pipeline
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <MeterCard
                label="Stability"
                value={Math.round(gaze.confidence * 100)}
                accent="from-cyan-400 to-emerald-400"
              />
              <MeterCard
                label="Peripheral guard"
                value={Math.round((1 - peripheralDim) * 100)}
                accent="from-purple-400 to-pink-400"
              />
            </div>
          </div>

          <div className="relative z-10 mt-4 space-y-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <div className="flex items-center justify-between gap-2 text-xs text-white/70">
              <span>Periphery blur</span>
              <span className="font-mono text-white/80">
                {peripheralBlur.toFixed(0)}px
              </span>
            </div>
            <Slider
              value={peripheralBlur}
              max={18}
              step={1}
              onChange={setPeripheralBlur}
            />

            <div className="flex items-center justify-between gap-2 text-xs text-white/70">
              <span>Focus diameter</span>
              <span className="font-mono text-white/80">
                {focusSize.toFixed(0)}%
              </span>
            </div>
            <Slider
              value={focusSize}
              max={42}
              min={12}
              step={1}
              onChange={setFocusSize}
            />

            <div className="flex items-center justify-between gap-2 text-xs text-white/70">
              <span>Feather radius</span>
              <span className="font-mono text-white/80">
                {focusFeather.toFixed(0)}%
              </span>
            </div>
            <Slider
              value={focusFeather}
              max={50}
              min={10}
              step={1}
              onChange={setFocusFeather}
            />

            <div className="flex items-center justify-between gap-2 text-xs text-white/70">
              <span>Periphery brightness</span>
              <span className="font-mono text-white/80">
                {Math.round(peripheralDim * 100)}%
              </span>
            </div>
            <Slider
              value={peripheralDim}
              max={0.65}
              min={0.2}
              step={0.01}
              onChange={setPeripheralDim}
            />

            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-cyan-300" />
                <span>Show guide overlay</span>
              </div>
              <Switch
                checked={showOverlay}
                onCheckedChange={setShowOverlay}
                className="data-[state=checked]:bg-cyan-500"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/80">
                Focus-preserving canvas
              </p>
              <h2 className="text-2xl font-semibold text-white">
                Real foveation, no headset required
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="h-9 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400 px-4 text-black shadow-lg shadow-cyan-500/30"
                onClick={() => startPipeline()}
              >
                <Zap className="size-4" />
                Prime the tracker
              </Button>
            </div>
          </div>

          <div className="relative flex min-h-[460px] flex-1 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#0b1221] via-[#050910] to-black shadow-[0_30px_120px_rgba(0,0,0,0.55)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,255,255,0.06),transparent_35%),radial-gradient(circle_at_80%_60%,rgba(255,102,178,0.08),transparent_40%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.02)_50%,rgba(255,255,255,0)_100%)] opacity-60" />

            <div
              className="absolute inset-0 blur-[12px]"
              style={{ opacity: peripheralDim }}
            >
              <FauxUi />
            </div>

            <div
              className="absolute inset-0 backdrop-blur-[2px]"
              style={{ opacity: peripheralDim, filter: `blur(${peripheralBlur}px)` }}
            >
              <FauxUi />
            </div>

            <div
              className="absolute inset-0 drop-shadow-[0_0_32px_rgba(0,255,255,0.25)]"
              style={maskStyle}
            >
              <FauxUi crisp />
            </div>

            <motion.div
              className="pointer-events-none absolute size-[180px] rounded-full border border-cyan-300/60 bg-gradient-to-tr from-cyan-400/20 to-white/10 shadow-[0_0_120px_rgba(34,211,238,0.25)]"
              style={{ transform: "translate(-50%, -50%)" }}
              initial={{ left: "50%", top: "50%" }}
              animate={{
                left: `${gaze.x * 100}%`,
                top: `${gaze.y * 100}%`,
              }}
              transition={{ type: "spring", damping: 22, stiffness: 180 }}
            />

            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(18,242,255,0.14),transparent_40%)]"
              style={
                {
                  "--x": `${gaze.x * 100}%`,
                  "--y": `${gaze.y * 100}%`,
                } as CSSProperties
              }
            />

            <div className="pointer-events-none absolute left-6 top-6 flex items-center gap-2 rounded-full bg-black/60 px-3 py-2 text-[12px] font-medium text-white/80 ring-1 ring-white/10">
              <Sparkles className="size-4 text-cyan-300" />
              Adaptive focus bubble follows your gaze
            </div>

            <div className="pointer-events-none absolute bottom-6 left-6 flex flex-col gap-1 rounded-xl bg-black/60 px-4 py-3 text-[12px] text-white/80 ring-1 ring-white/10">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-lime-300" />
                Burn-in guard keeps periphery dimmed
              </div>
              <div className="flex items-center gap-2">
                <Focus className="size-4 text-cyan-300" />
                Drop shadow + gradient mask for headset-grade clarity
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            <MiniCard
              title="Instant calibration"
              body="Auto-centers with soft easing. No manual markers, no friction."
            />
            <MiniCard
              title="Streamer-ready"
              body="Camera feed + overlay are exportable for the perfect 'I solved burn-in' clip."
            />
            <MiniCard
              title="VR-like falloff"
              body="Blend curve tuners let you dial retina sharpness vs. panel safety."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function getFocusPoint(
  landmarks: Array<{ x: number; y: number }>,
): GazePoint {
  if (!landmarks || landmarks.length < 10) {
    return { x: 0.5, y: 0.5, confidence: 0 };
  }

  const safe = (value: number | undefined, fallback: number) =>
    Number.isFinite(value) ? value : fallback;

  const leftEye = landmarks[33];
  const rightEye = landmarks[263];
  const nose = landmarks[1];

  const centerX = (safe(leftEye?.x, 0.5) + safe(rightEye?.x, 0.5)) / 2;
  const centerY =
    (safe(leftEye?.y, 0.5) + safe(rightEye?.y, 0.5) + safe(nose?.y, 0.5)) / 3;

  const clampedX = Math.min(Math.max(centerX, 0.08), 0.92);
  const clampedY = Math.min(Math.max(centerY, 0.08), 0.92);

  return {
    x: clampedX,
    y: clampedY,
    confidence: 0.9,
  };
}

function smoothGaze(current: GazePoint, target: GazePoint): GazePoint {
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  return {
    x: lerp(current.x, target.x, 0.22),
    y: lerp(current.y, target.y, 0.22),
    confidence: lerp(current.confidence, target.confidence, 0.2),
  };
}

function calculateFps(now: number, ref: { current: number }) {
  const delta = now - ref.current;
  ref.current = now;
  return Math.max(0, Math.min(120, Math.round(1000 / Math.max(delta, 16))));
}

function StatusPill({
  status,
  detail,
}: {
  status: TrackerStatus;
  detail: string;
}) {
  const palette: Record<
    TrackerStatus,
    { bg: string; text: string; dot: string; label: string }
  > = {
    idle: {
      bg: "bg-white/10",
      text: "text-white/80",
      dot: "bg-white/70",
      label: "Idle",
    },
    requesting: {
      bg: "bg-amber-500/20",
      text: "text-amber-100",
      dot: "bg-amber-300",
      label: "Requesting",
    },
    warming: {
      bg: "bg-cyan-500/20",
      text: "text-cyan-100",
      dot: "bg-cyan-300",
      label: "Warming up",
    },
    ready: {
      bg: "bg-emerald-500/20",
      text: "text-emerald-100",
      dot: "bg-emerald-300",
      label: "Live",
    },
    error: {
      bg: "bg-red-500/20",
      text: "text-red-100",
      dot: "bg-red-300",
      label: "Blocked",
    },
  };
  const paletteForState = palette[status];

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium backdrop-blur-xl ring-1 ring-white/10",
        paletteForState.bg,
        paletteForState.text,
      )}
    >
      <span
        className={cn("block size-2 rounded-full", paletteForState.dot)}
        aria-hidden
      />
      <span>{paletteForState.label}</span>
      <span className="text-white/60">•</span>
      <span className="text-white/70">{detail}</span>
    </div>
  );
}

function Chip({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 backdrop-blur">
      {icon}
      {children}
    </div>
  );
}

function MeterCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/40 p-3">
      <div className="flex items-center justify-between text-[12px] text-white/70">
        <span>{label}</span>
        <span className="font-mono text-white/80">{value}%</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className={cn(
            "h-full rounded-full bg-gradient-to-r",
            accent,
          )}
          style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
        />
      </div>
    </div>
  );
}

function MiniCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
      <div className="text-sm font-semibold text-white">{title}</div>
      <div className="mt-1 text-xs text-white/70">{body}</div>
    </div>
  );
}

function FauxUi({ crisp }: { crisp?: boolean }) {
  return (
    <div
      className={cn(
        "grid h-full w-full grid-cols-3 gap-3 p-6 transition-all duration-500",
        crisp ? "saturate-125" : "saturate-75",
      )}
    >
      {[...Array(9)].map((_, i) => (
        <div
          key={i}
          className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-3"
        >
          <div className="flex items-center justify-between text-[11px] text-white/60">
            <span>Tile {i + 1}</span>
            <span className="rounded-full bg-white/10 px-2 py-0.5 font-mono text-[10px] text-cyan-200">
              {Math.round(12 + i * 2)} ms
            </span>
          </div>
          <div className="mt-3 space-y-1">
            <div className="h-6 rounded-lg bg-gradient-to-r from-cyan-400/30 to-blue-500/10" />
            <div className="h-6 rounded-lg bg-gradient-to-r from-purple-500/25 to-pink-500/10" />
            <div className="h-6 rounded-lg bg-gradient-to-r from-emerald-400/25 to-cyan-500/15" />
          </div>
        </div>
      ))}
    </div>
  );
}

function GradientRays() {
  return (
    <div className="absolute -right-10 -top-24 h-64 w-64 rotate-12 bg-[conic-gradient(from_90deg_at_50%_50%,rgba(59,130,246,0.0)_0deg,rgba(59,130,246,0.18)_120deg,rgba(110,231,183,0.2)_200deg,rgba(59,130,246,0.0)_320deg)] blur-3xl opacity-60" />
  );
}
