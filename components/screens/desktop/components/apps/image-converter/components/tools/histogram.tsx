import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface HistogramProps {
  imageUrl: string;
  width?: number;
  height?: number;
}

interface HistogramData {
  red: number[];
  green: number[];
  blue: number[];
}

export function Histogram({ imageUrl, width = 200, height = 100 }: HistogramProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [histogram, setHistogram] = useState<HistogramData | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (!imageUrl) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;

    img.onload = () => {
      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d");
      if (!tempCtx) return;

      // Sample at lower resolution for performance
      const sampleWidth = Math.min(img.width, 400);
      const sampleHeight = Math.min(img.height, 400);
      tempCanvas.width = sampleWidth;
      tempCanvas.height = sampleHeight;

      tempCtx.drawImage(img, 0, 0, sampleWidth, sampleHeight);
      const imageData = tempCtx.getImageData(0, 0, sampleWidth, sampleHeight);
      const data = imageData.data;

      // Initialize histogram bins
      const red = new Array(256).fill(0);
      const green = new Array(256).fill(0);
      const blue = new Array(256).fill(0);

      // Count pixel values
      for (let i = 0; i < data.length; i += 4) {
        red[data[i]]++;
        green[data[i + 1]]++;
        blue[data[i + 2]]++;
      }

      // Normalize to 0-1 range
      const totalPixels = sampleWidth * sampleHeight;
      const normalize = (arr: number[]) => arr.map(v => v / totalPixels);

      setHistogram({
        red: normalize(red),
        green: normalize(green),
        blue: normalize(blue),
      });
    };
  }, [imageUrl]);

  useEffect(() => {
    if (!histogram || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Find max value for scaling
    const maxValue = Math.max(
      ...histogram.red,
      ...histogram.green,
      ...histogram.blue
    );

    const drawChannel = (data: number[], color: string) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.6;
      ctx.beginPath();

      data.forEach((value, i) => {
        const x = (i / 256) * width;
        const y = height - (value / maxValue) * height;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();
    };

    // Draw each channel
    drawChannel(histogram.red, "#ef4444");
    drawChannel(histogram.green, "#22c55e");
    drawChannel(histogram.blue, "#3b82f6");

    ctx.globalAlpha = 1;
  }, [histogram, width, height]);

  return (
    <div className="rounded-lg overflow-hidden bg-black/20 backdrop-blur-sm border border-white/10">
      {/* Header */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full px-3 py-2 flex items-center justify-between text-sm font-medium text-white hover:bg-white/5 transition-colors"
      >
        <span>Histogram</span>
        {isCollapsed ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronUp className="h-4 w-4" />
        )}
      </button>

      {/* Canvas */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="overflow-hidden"
          >
            <div className="p-3">
              <canvas
                ref={canvasRef}
                width={width}
                height={height}
                className="w-full rounded bg-black/40"
              />

              {/* Legend */}
              <div className="flex items-center justify-center gap-4 mt-2 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-white/70">R</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-white/70">G</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-white/70">B</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
