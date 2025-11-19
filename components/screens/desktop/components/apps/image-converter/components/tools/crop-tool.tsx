import { useState, useRef, useCallback } from "react";
import { motion } from "motion/react";
import { Check, X, Maximize2, Grid3x3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CropOptions } from "../../types";

interface CropToolProps {
  imageDimensions: { width: number; height: number };
  onApply: (crop: CropOptions) => void;
  onCancel: () => void;
}

const ASPECT_RATIOS = [
  { name: "Free", value: null },
  { name: "1:1", value: 1 },
  { name: "16:9", value: 16 / 9 },
  { name: "4:3", value: 4 / 3 },
  { name: "3:2", value: 3 / 2 },
] as const;

export function CropTool({ imageDimensions, onApply, onCancel }: CropToolProps) {
  const { width: imgWidth, height: imgHeight } = imageDimensions;

  // Initialize crop to 80% of image, centered
  const initialSize = Math.min(imgWidth, imgHeight) * 0.8;
  const [crop, setCrop] = useState<CropOptions>({
    x: (imgWidth - initialSize) / 2,
    y: (imgHeight - initialSize) / 2,
    width: initialSize,
    height: initialSize,
  });

  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0, cropX: 0, cropY: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent, handle?: string) => {
    e.preventDefault();

    if (handle) {
      setIsResizing(true);
      setResizeHandle(handle);
    } else {
      setIsDragging(true);
    }

    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      cropX: crop.x,
      cropY: crop.y,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - dragStartRef.current.x;
      const deltaY = moveEvent.clientY - dragStartRef.current.y;

      if (handle) {
        // Handle resizing
        handleResize(handle, deltaX, deltaY);
      } else {
        // Handle dragging
        const newX = Math.max(0, Math.min(imgWidth - crop.width, dragStartRef.current.cropX + deltaX));
        const newY = Math.max(0, Math.min(imgHeight - crop.height, dragStartRef.current.cropY + deltaY));

        setCrop(prev => ({ ...prev, x: newX, y: newY }));
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeHandle(null);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [crop, imgWidth, imgHeight]);

  const handleResize = (handle: string, deltaX: number, deltaY: number) => {
    setCrop(prev => {
      let newCrop = { ...prev };

      switch (handle) {
        case "nw":
          newCrop.x = dragStartRef.current.cropX + deltaX;
          newCrop.y = dragStartRef.current.cropY + deltaY;
          newCrop.width = prev.width - deltaX;
          newCrop.height = prev.height - deltaY;
          break;
        case "ne":
          newCrop.y = dragStartRef.current.cropY + deltaY;
          newCrop.width = prev.width + deltaX;
          newCrop.height = prev.height - deltaY;
          break;
        case "sw":
          newCrop.x = dragStartRef.current.cropX + deltaX;
          newCrop.width = prev.width - deltaX;
          newCrop.height = prev.height + deltaY;
          break;
        case "se":
          newCrop.width = prev.width + deltaX;
          newCrop.height = prev.height + deltaY;
          break;
        case "n":
          newCrop.y = dragStartRef.current.cropY + deltaY;
          newCrop.height = prev.height - deltaY;
          break;
        case "s":
          newCrop.height = prev.height + deltaY;
          break;
        case "w":
          newCrop.x = dragStartRef.current.cropX + deltaX;
          newCrop.width = prev.width - deltaX;
          break;
        case "e":
          newCrop.width = prev.width + deltaX;
          break;
      }

      // Apply aspect ratio constraint if set
      if (aspectRatio) {
        if (["nw", "ne", "sw", "se"].includes(handle)) {
          newCrop.height = newCrop.width / aspectRatio;
        }
      }

      // Clamp to image bounds
      newCrop.x = Math.max(0, Math.min(imgWidth - newCrop.width, newCrop.x));
      newCrop.y = Math.max(0, Math.min(imgHeight - newCrop.height, newCrop.y));
      newCrop.width = Math.max(50, Math.min(imgWidth - newCrop.x, newCrop.width));
      newCrop.height = Math.max(50, Math.min(imgHeight - newCrop.y, newCrop.height));

      return newCrop;
    });
  };

  const handleAspectRatioChange = (ratio: number | null) => {
    setAspectRatio(ratio);
    if (ratio) {
      // Adjust crop to match aspect ratio
      setCrop(prev => ({
        ...prev,
        height: prev.width / ratio,
      }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="absolute inset-4 flex flex-col gap-4">
        {/* Top Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-white">Crop Image</h3>
            <Button
              size="sm"
              variant={showGrid ? "default" : "outline"}
              onClick={() => setShowGrid(!showGrid)}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {ASPECT_RATIOS.map(ratio => (
              <Button
                key={ratio.name}
                size="sm"
                variant={aspectRatio === ratio.value ? "default" : "outline"}
                onClick={() => handleAspectRatioChange(ratio.value)}
              >
                {ratio.name}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button size="sm" onClick={() => onApply(crop)}>
              <Check className="h-4 w-4 mr-2" />
              Apply
            </Button>
          </div>
        </div>

        {/* Crop Area */}
        <div
          ref={containerRef}
          className="relative flex-1 overflow-hidden rounded-lg bg-black/20"
          style={{
            backgroundImage: 'repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%) 50% / 20px 20px'
          }}
        >
          {/* Dark overlay outside crop area */}
          <div className="absolute inset-0">
            <svg width="100%" height="100%" className="absolute inset-0">
              <defs>
                <mask id="crop-mask">
                  <rect width="100%" height="100%" fill="white" />
                  <rect
                    x={crop.x}
                    y={crop.y}
                    width={crop.width}
                    height={crop.height}
                    fill="black"
                  />
                </mask>
              </defs>
              <rect
                width="100%"
                height="100%"
                fill="black"
                opacity="0.5"
                mask="url(#crop-mask)"
              />
            </svg>
          </div>

          {/* Crop box */}
          <motion.div
            className="absolute border-2 border-white cursor-move"
            style={{
              left: crop.x,
              top: crop.y,
              width: crop.width,
              height: crop.height,
            }}
            onMouseDown={(e) => handleMouseDown(e)}
            animate={{
              boxShadow: isDragging ? "0 0 0 2px rgba(59, 130, 246, 0.5)" : "none",
            }}
          >
            {/* Grid overlay */}
            {showGrid && (
              <div className="absolute inset-0 pointer-events-none">
                {/* Rule of thirds */}
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-0">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="border border-white/30" />
                  ))}
                </div>
              </div>
            )}

            {/* Corner handles */}
            {["nw", "ne", "sw", "se"].map(handle => (
              <div
                key={handle}
                className="absolute w-3 h-3 bg-white border-2 border-blue-500 cursor-pointer hover:scale-150 transition-transform"
                style={{
                  [handle.includes("n") ? "top" : "bottom"]: -6,
                  [handle.includes("w") ? "left" : "right"]: -6,
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleMouseDown(e, handle);
                }}
              />
            ))}

            {/* Edge handles */}
            {["n", "s", "e", "w"].map(handle => (
              <div
                key={handle}
                className="absolute bg-white border-2 border-blue-500 cursor-pointer hover:scale-150 transition-transform"
                style={{
                  ...((handle === "n" || handle === "s") ? {
                    width: "20px",
                    height: "6px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    [handle === "n" ? "top" : "bottom"]: -3,
                  } : {
                    width: "6px",
                    height: "20px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    [handle === "w" ? "left" : "right"]: -3,
                  }),
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleMouseDown(e, handle);
                }}
              />
            ))}
          </motion.div>
        </div>

        {/* Info */}
        <div className="text-center text-sm text-white/70">
          {Math.round(crop.width)} × {Math.round(crop.height)} px
          {aspectRatio && ` • ${ASPECT_RATIOS.find(r => r.value === aspectRatio)?.name}`}
        </div>
      </div>
    </div>
  );
}
