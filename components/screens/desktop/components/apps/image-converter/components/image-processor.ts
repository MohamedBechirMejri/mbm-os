import type {
  FilterOptions,
  ResizeOptions,
  TransformOptions,
  CropOptions,
} from "../types";

export class ImageProcessor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private originalImage: HTMLImageElement | null = null;

  constructor() {
    if (typeof window === "undefined") {
      throw new Error("ImageProcessor can only be used in the browser");
    }
    this.canvas = document.createElement("canvas");
    const ctx = this.canvas.getContext("2d", { willReadFrequently: true, alpha: true });
    if (!ctx) throw new Error("Could not get canvas context");
    this.ctx = ctx;
  }

  /**
   * Loads an image from a File object.
   */
  async loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        this.originalImage = img;
        this.canvas.width = img.width;
        this.canvas.height = img.height;
        this.ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        resolve(img);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Failed to load image"));
      };

      img.src = url;
    });
  }

  /**
   * Applies all transformations and adjustments to the image, returning a data URL.
   */
  process(
    adjustments: FilterOptions,
    resize?: ResizeOptions,
    transform?: TransformOptions,
    crop?: CropOptions | null
  ): string {
    if (!this.originalImage) return "";

    // Start with original dimensions
    let srcWidth = this.originalImage.width;
    let srcHeight = this.originalImage.height;
    let srcX = 0;
    let srcY = 0;

    // Apply crop to source if specified
    if (crop) {
      srcX = crop.x;
      srcY = crop.y;
      srcWidth = crop.width;
      srcHeight = crop.height;
    }

    // Determine target dimensions (accounting for rotation)
    let targetWidth = resize?.width || srcWidth;
    let targetHeight = resize?.height || srcHeight;

    // Swap dimensions if rotated 90 or 270 degrees
    const rotation = transform?.rotation || 0;
    if (rotation === 90 || rotation === 270) {
      [targetWidth, targetHeight] = [targetHeight, targetWidth];
    }

    // Update canvas size
    if (this.canvas.width !== targetWidth || this.canvas.height !== targetHeight) {
      this.canvas.width = targetWidth;
      this.canvas.height = targetHeight;
    }

    // Prepare context
    this.ctx.clearRect(0, 0, targetWidth, targetHeight);
    this.ctx.save();

    // Apply transformations
    const centerX = targetWidth / 2;
    const centerY = targetHeight / 2;

    this.ctx.translate(centerX, centerY);

    // Apply rotation
    if (rotation) {
      this.ctx.rotate((rotation * Math.PI) / 180);
    }

    // Apply flips
    const flipH = transform?.flipH || false;
    const flipV = transform?.flipV || false;
    this.ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

    // Set smoothing
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = "high";

    // Build filter string
    const filters = this.buildFilterString(adjustments);
    this.ctx.filter = filters;

    // Draw the image (centered due to translation)
    const drawWidth = rotation === 90 || rotation === 270 ? targetHeight : targetWidth;
    const drawHeight = rotation === 90 || rotation === 270 ? targetWidth : targetHeight;

    this.ctx.drawImage(
      this.originalImage,
      srcX,
      srcY,
      srcWidth,
      srcHeight,
      -drawWidth / 2,
      -drawHeight / 2,
      drawWidth,
      drawHeight
    );

    this.ctx.restore();

    // Apply canvas-based effects that can't be done with CSS filters
    if (adjustments.vignette > 0) {
      this.applyVignette(adjustments.vignette);
    }

    if (adjustments.grain > 0) {
      this.applyGrain(adjustments.grain);
    }

    if (adjustments.highlights !== 0 || adjustments.shadows !== 0) {
      this.applyHighlightsShadows(adjustments.highlights, adjustments.shadows);
    }

    return this.canvas.toDataURL("image/png");
  }

  /**
   * Build CSS filter string from adjustments
   */
  private buildFilterString(adjustments: FilterOptions): string {
    const filters: string[] = [];

    // Basic adjustments
    if (adjustments.brightness !== 0) {
      filters.push(`brightness(${100 + adjustments.brightness}%)`);
    }
    if (adjustments.contrast !== 0) {
      filters.push(`contrast(${100 + adjustments.contrast}%)`);
    }
    if (adjustments.saturation !== 0) {
      filters.push(`saturate(${100 + adjustments.saturation}%)`);
    }
    if (adjustments.blur > 0) {
      filters.push(`blur(${adjustments.blur}px)`);
    }

    // Advanced filters
    if (adjustments.exposure !== 0) {
      // Exposure is similar to brightness but more subtle
      filters.push(`brightness(${100 + adjustments.exposure * 0.5}%)`);
    }

    // Temperature (warm/cool) - use sepia + hue-rotate approximation
    if (adjustments.temperature !== 0) {
      if (adjustments.temperature > 0) {
        // Warm: add sepia tone
        filters.push(`sepia(${adjustments.temperature * 0.3}%)`);
      } else {
        // Cool: shift hue toward blue
        filters.push(`hue-rotate(${adjustments.temperature * 0.5}deg)`);
      }
    }

    // Tint (green/magenta)
    if (adjustments.tint !== 0) {
      filters.push(`hue-rotate(${adjustments.tint}deg)`);
    }

    return filters.length > 0 ? filters.join(" ") : "none";
  }

  /**
   * Apply vignette effect (darkened edges)
   */
  private applyVignette(intensity: number): void {
    const { width, height } = this.canvas;
    const gradient = this.ctx.createRadialGradient(
      width / 2,
      height / 2,
      0,
      width / 2,
      height / 2,
      Math.max(width, height) * 0.7
    );

    const alpha = intensity / 100;
    gradient.addColorStop(0, `rgba(0, 0, 0, 0)`);
    gradient.addColorStop(1, `rgba(0, 0, 0, ${alpha})`);

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, width, height);
  }

  /**
   * Apply grain/noise effect
   */
  private applyGrain(intensity: number): void {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;
    const amount = intensity * 2.55; // Convert 0-100 to 0-255

    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * amount;
      data[i] += noise; // R
      data[i + 1] += noise; // G
      data[i + 2] += noise; // B
    }

    this.ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Apply highlights and shadows adjustment
   * Highlights affect bright pixels, shadows affect dark pixels
   */
  private applyHighlightsShadows(highlights: number, shadows: number): void {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;

    // Convert -100 to 100 range to adjustment factors
    const highlightFactor = 1 + (highlights / 100);
    const shadowFactor = 1 + (shadows / 100);

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Calculate luminance (perceived brightness)
      const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

      // Determine if pixel is highlight or shadow
      // Values > 128 are highlights, < 128 are shadows
      const isHighlight = luminance > 128;
      const weight = Math.abs(luminance - 128) / 128; // 0 to 1

      if (isHighlight && highlights !== 0) {
        // Apply highlight adjustment to bright pixels
        const factor = 1 + ((highlightFactor - 1) * weight);
        data[i] = Math.min(255, r * factor);
        data[i + 1] = Math.min(255, g * factor);
        data[i + 2] = Math.min(255, b * factor);
      } else if (!isHighlight && shadows !== 0) {
        // Apply shadow adjustment to dark pixels
        const factor = 1 + ((shadowFactor - 1) * weight);
        data[i] = Math.min(255, Math.max(0, r * factor));
        data[i + 1] = Math.min(255, Math.max(0, g * factor));
        data[i + 2] = Math.min(255, Math.max(0, b * factor));
      }
    }

    this.ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Returns the current canvas content as a Blob with quality control
   */
  async getBlob(
    format: "png" | "jpeg" | "webp" | "avif",
    quality = 0.9
  ): Promise<Blob | null> {
    return new Promise((resolve) => {
      const mimeType = `image/${format}`;

      // PNG doesn't support quality, others do
      const qualityParam = format === "png" ? undefined : quality;

      this.canvas.toBlob(
        (blob) => resolve(blob),
        mimeType,
        qualityParam
      );
    });
  }

  /**
   * Generates a standard .ico file containing a 32x32 version of the current image.
   */
  async generateIco(
    adjustments: FilterOptions,
    transform?: TransformOptions
  ): Promise<Blob | null> {
    if (!this.originalImage) return null;

    // Create a temp canvas for the 32x32 icon
    const icoCanvas = document.createElement("canvas");
    icoCanvas.width = 32;
    icoCanvas.height = 32;
    const ctx = icoCanvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Apply transformations
    ctx.save();
    ctx.translate(16, 16);

    const rotation = transform?.rotation || 0;
    if (rotation) {
      ctx.rotate((rotation * Math.PI) / 180);
    }

    const flipH = transform?.flipH || false;
    const flipV = transform?.flipV || false;
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

    // Apply filters
    const filters = this.buildFilterString(adjustments);
    ctx.filter = filters;

    // Draw resized
    ctx.drawImage(this.originalImage, -16, -16, 32, 32);
    ctx.restore();

    // Get PNG data
    const pngBlob = await new Promise<Blob | null>((r) =>
      icoCanvas.toBlob(r, "image/png")
    );
    if (!pngBlob) return null;

    const pngData = await pngBlob.arrayBuffer();
    return this.createIcoBlob(pngData);
  }

  /**
   * Wraps PNG data in an ICO container.
   */
  private createIcoBlob(pngData: ArrayBuffer): Blob {
    const pngBytes = new Uint8Array(pngData);
    const len = pngBytes.length;

    // ICO Header (6 bytes)
    const header = new Uint8Array([
      0, 0,       // Reserved
      1, 0,       // Type (1 = ICO)
      1, 0,       // Count (1 image)
    ]);

    // Directory Entry (16 bytes)
    const entry = new Uint8Array(16);
    const view = new DataView(entry.buffer);

    view.setUint8(0, 32); // Width
    view.setUint8(1, 32); // Height
    view.setUint8(2, 0); // Colors (0 = no palette)
    view.setUint8(3, 0); // Reserved
    view.setUint16(4, 1, true); // Planes
    view.setUint16(6, 32, true); // BPP
    view.setUint32(8, len, true); // Size
    view.setUint32(12, 22, true); // Offset (6 + 16)

    // Combine
    const icoBytes = new Uint8Array(6 + 16 + len);
    icoBytes.set(header, 0);
    icoBytes.set(entry, 6);
    icoBytes.set(pngBytes, 22);

    return new Blob([icoBytes], { type: "image/x-icon" });
  }

  /**
   * Get original image dimensions
   */
  getOriginalDimensions(): { width: number; height: number } {
    if (!this.originalImage) return { width: 0, height: 0 };
    return {
      width: this.originalImage.width,
      height: this.originalImage.height,
    };
  }
}
