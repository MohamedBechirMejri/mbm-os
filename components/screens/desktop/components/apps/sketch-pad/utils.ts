import type { Layer, Point, Stroke } from "./types";

// Generate a unique layer ID
export const generateLayerId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

// Draw a smooth line between two points using quadratic curves
export const drawLine = (
  ctx: CanvasRenderingContext2D,
  from: Point,
  to: Point,
  size: number,
  color: string,
  isEraser: boolean
) => {
  ctx.save();

  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = size;

  if (isEraser) {
    ctx.globalCompositeOperation = "destination-out";
    ctx.strokeStyle = "rgba(0,0,0,1)";
  } else {
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = color;
  }

  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();

  ctx.restore();
};

// Draw a single dot (for click without drag)
export const drawDot = (
  ctx: CanvasRenderingContext2D,
  point: Point,
  size: number,
  color: string,
  isEraser: boolean
) => {
  ctx.save();

  if (isEraser) {
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "rgba(0,0,0,1)";
  } else {
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = color;
  }

  ctx.beginPath();
  ctx.arc(point.x, point.y, size / 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
};

// Draw a complete stroke
export const drawStroke = (ctx: CanvasRenderingContext2D, stroke: Stroke) => {
  if (stroke.points.length === 0) return;

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = stroke.size;
  ctx.strokeStyle = stroke.color;
  ctx.globalCompositeOperation = "source-over";

  if (stroke.points.length === 1) {
    // Single point - draw a dot
    ctx.fillStyle = stroke.color;
    ctx.beginPath();
    ctx.arc(
      stroke.points[0].x,
      stroke.points[0].y,
      stroke.size / 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
  } else {
    // Multiple points - draw lines
    ctx.beginPath();
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
    }
    ctx.stroke();
  }

  ctx.restore();
};

// Redraw all strokes for a layer
export const redrawLayerStrokes = (
  ctx: CanvasRenderingContext2D,
  strokes: Stroke[],
  layerId: string,
  width: number,
  height: number
) => {
  // Clear the canvas
  ctx.clearRect(0, 0, width, height);

  // Draw all strokes for this layer
  for (const stroke of strokes) {
    if (stroke.layerId === layerId) {
      drawStroke(ctx, stroke);
    }
  }
};

// Export all visible layers as a PNG
export const exportToPng = (
  canvasRefs: Map<string, HTMLCanvasElement>,
  layers: Layer[],
  width: number,
  height: number
): void => {
  // Create a temporary canvas to merge all layers
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = width;
  tempCanvas.height = height;
  const ctx = tempCanvas.getContext("2d");

  if (!ctx) return;

  // Fill with transparent background (or could be white/configurable)
  ctx.clearRect(0, 0, width, height);

  // Draw each visible layer from bottom to top
  const sortedLayers = [...layers].reverse();
  for (const layer of sortedLayers) {
    if (!layer.visible) continue;

    const layerCanvas = canvasRefs.get(layer.id);
    if (!layerCanvas) continue;

    ctx.globalAlpha = layer.opacity;
    ctx.drawImage(layerCanvas, 0, 0);
  }

  ctx.globalAlpha = 1;

  // Trigger download
  const link = document.createElement("a");
  link.download = `sketch-${Date.now()}.png`;
  link.href = tempCanvas.toDataURL("image/png");
  link.click();
};

// Clear a canvas completely
export const clearCanvas = (ctx: CanvasRenderingContext2D) => {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};
