export interface ImageAdjustments {
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  saturation: number; // -100 to 100
  blur: number; // 0 to 20
}

export interface ResizeOptions {
  width: number;
  height: number;
  maintainAspect: boolean;
}

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
        URL.revokeObjectURL(url); // Clean up memory
        resolve(img);
      };

      img.onerror = (e) => {
        URL.revokeObjectURL(url);
        reject(new Error("Failed to load image"));
      };

      img.src = url;
    });
  }

  /**
   * Applies adjustments and resizing to the image, returning a data URL.
   */
  process(
    adjustments: ImageAdjustments,
    resize?: ResizeOptions
  ): string {
    if (!this.originalImage) return "";

    // 1. Determine Target Dimensions
    let targetWidth = this.originalImage.width;
    let targetHeight = this.originalImage.height;

    if (resize && resize.width > 0 && resize.height > 0) {
      targetWidth = resize.width;
      targetHeight = resize.height;
    }

    // 2. Update Canvas Size
    // Only update if changed to avoid flicker/reflow if possible, but for canvas it's usually fine
    if (this.canvas.width !== targetWidth || this.canvas.height !== targetHeight) {
        this.canvas.width = targetWidth;
        this.canvas.height = targetHeight;
    }

    // 3. Prepare Context
    this.ctx.clearRect(0, 0, targetWidth, targetHeight);
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = "high";

    // 4. Construct Filter String
    // Note: Order matters. Usually Brightness -> Contrast -> Saturation -> Blur is a good chain.
    const filters: string[] = [];
    if (adjustments.brightness !== 0) filters.push(`brightness(${100 + adjustments.brightness}%)`);
    if (adjustments.contrast !== 0) filters.push(`contrast(${100 + adjustments.contrast}%)`);
    if (adjustments.saturation !== 0) filters.push(`saturate(${100 + adjustments.saturation}%)`);
    if (adjustments.blur > 0) filters.push(`blur(${adjustments.blur}px)`);

    this.ctx.filter = filters.length > 0 ? filters.join(" ") : "none";

    // 5. Draw Image
    this.ctx.drawImage(this.originalImage, 0, 0, targetWidth, targetHeight);

    // 6. Reset Filter
    this.ctx.filter = "none";

    return this.canvas.toDataURL("image/png");
  }

  /**
   * Returns the current canvas content as a Blob.
   */
  async getBlob(format: "png" | "jpeg" | "webp", quality = 0.9): Promise<Blob | null> {
    return new Promise((resolve) => {
      this.canvas.toBlob(
        (blob) => resolve(blob),
        `image/${format}`,
        quality
      );
    });
  }

  /**
   * Generates a standard .ico file containing a 32x32 version of the current image.
   * Note: This assumes the caller has NOT already resized the canvas to 32x32.
   * We will create a temporary 32x32 version for the ICO.
   */
  async generateIco(adjustments: ImageAdjustments): Promise<Blob | null> {
    if (!this.originalImage) return null;

    // Create a temp canvas for the 32x32 icon
    const icoCanvas = document.createElement("canvas");
    icoCanvas.width = 32;
    icoCanvas.height = 32;
    const ctx = icoCanvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;

    // Apply same filters
    const filters: string[] = [];
    if (adjustments.brightness !== 0) filters.push(`brightness(${100 + adjustments.brightness}%)`);
    if (adjustments.contrast !== 0) filters.push(`contrast(${100 + adjustments.contrast}%)`);
    if (adjustments.saturation !== 0) filters.push(`saturate(${100 + adjustments.saturation}%)`);
    if (adjustments.blur > 0) filters.push(`blur(${adjustments.blur}px)`); // Blur on 32x32 might be too much, but keeping for consistency

    ctx.filter = filters.length > 0 ? filters.join(" ") : "none";
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Draw resized
    ctx.drawImage(this.originalImage, 0, 0, 32, 32);

    // Get PNG data
    const pngBlob = await new Promise<Blob | null>(r => icoCanvas.toBlob(r, "image/png"));
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
        0, 0,             // Reserved
        1, 0,             // Type (1 = ICO)
        1, 0              // Count (1 image)
    ]);

    // Directory Entry (16 bytes)
    const entry = new Uint8Array(16);
    const view = new DataView(entry.buffer);

    view.setUint8(0, 32);     // Width
    view.setUint8(1, 32);     // Height
    view.setUint8(2, 0);      // Colors (0 = no palette)
    view.setUint8(3, 0);      // Reserved
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
}
