import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Download,
  Image as ImageIcon,
  Sliders,
  Maximize2,
  Package,
  Undo2,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Check,
  ChevronDown,
  Lock,
  Unlock,
  X,
  Settings2,
  Monitor,
  Smartphone,
  Type
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageProcessor, type ImageAdjustments, type ResizeOptions } from "./image-processor";
import { cn } from "@/lib/utils";
import { saveAs } from "file-saver";
import JSZip from "jszip";

interface EditorProps {
  file: File;
  onClose: () => void;
}

const DEFAULT_ADJUSTMENTS: ImageAdjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  blur: 0,
};

export function Editor({ file, onClose }: EditorProps) {
  const [processor] = useState(() => new ImageProcessor());
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [adjustments, setAdjustments] = useState<ImageAdjustments>(DEFAULT_ADJUSTMENTS);
  const [originalSize, setOriginalSize] = useState({ width: 0, height: 0 });
  const [resize, setResize] = useState<ResizeOptions>({ width: 0, height: 0, maintainAspect: true });
  const [activeTool, setActiveTool] = useState<"adjust" | "resize" | "export" | null>(null);
  const [zoom, setZoom] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [exportFormat, setExportFormat] = useState<"png" | "jpeg" | "webp">("png");

  // Load image on mount
  useEffect(() => {
    const load = async () => {
      try {
        const img = await processor.loadImage(file);
        setOriginalSize({ width: img.width, height: img.height });
        setResize({ width: img.width, height: img.height, maintainAspect: true });
        updatePreview();
      } catch (e) {
        console.error("Failed to load image", e);
      }
    };
    load();
  }, [file]);

  // Update preview when adjustments/resize change
  useEffect(() => {
    if (originalSize.width > 0) {
        updatePreview();
    }
  }, [adjustments, resize.width, resize.height]);

  const updatePreview = () => {
    const url = processor.process(adjustments, resize);
    setPreviewUrl(url);
  };

  const handleResizeWidth = (val: number) => {
    if (resize.maintainAspect) {
      const ratio = originalSize.width / originalSize.height;
      setResize({ ...resize, width: val, height: Math.round(val / ratio) });
    } else {
      setResize({ ...resize, width: val });
    }
  };

  const handleResizeHeight = (val: number) => {
    if (resize.maintainAspect) {
      const ratio = originalSize.width / originalSize.height;
      setResize({ ...resize, height: val, width: Math.round(val * ratio) });
    } else {
      setResize({ ...resize, height: val });
    }
  };

  const handleExport = async () => {
    setIsProcessing(true);
    const blob = await processor.getBlob(exportFormat);
    if (blob) {
      saveAs(blob, `${file.name.split(".")[0]}_edited.${exportFormat}`);
    }
    setIsProcessing(false);
  };

  const handleFaviconExport = async () => {
    setIsProcessing(true);
    const zip = new JSZip();
    const configs = [
      { name: "favicon-16x16.png", size: 16 },
      { name: "favicon-32x32.png", size: 32 },
      { name: "apple-touch-icon.png", size: 180 },
      { name: "android-chrome-192x192.png", size: 192 },
      { name: "android-chrome-512x512.png", size: 512 },
    ];

    // Generate PNGs
    for (const config of configs) {
        // Temporarily resize processor for this icon
        processor.process(adjustments, { width: config.size, height: config.size, maintainAspect: false });
        const blob = await processor.getBlob("png");
        if (blob) zip.file(config.name, blob);
    }

    // Generate Real ICO
    // We pass adjustments because generateIco will re-process the original image at 32x32
    const icoBlob = await processor.generateIco(adjustments);
    if (icoBlob) zip.file("favicon.ico", icoBlob);

    // Reset preview to user's current state
    updatePreview();

    const html = `
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="manifest" href="/site.webmanifest">
    `.trim();
    zip.file("head-tags.html", html);

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "favicons.zip");
    setIsProcessing(false);
  };

  return (
    <div className="relative h-full w-full bg-black/90 text-white overflow-hidden flex flex-col">

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 h-16 flex items-center justify-between px-6 z-50 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-4">
            <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full w-10 h-10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white backdrop-blur-md transition-all"
            >
                <X className="h-5 w-5" />
            </Button>
            <div className="flex flex-col">
                <span className="text-sm font-medium text-white/90">{file.name}</span>
                <span className="text-[10px] text-white/40 font-mono">{originalSize.width}×{originalSize.height}</span>
            </div>
        </div>

        <div className="pointer-events-auto flex items-center gap-2 bg-black/40 backdrop-blur-xl p-1 rounded-full border border-white/10">
             <Button variant="ghost" size="icon" onClick={() => setZoom(Math.max(0.1, zoom - 0.1))} className="h-8 w-8 rounded-full text-white/60 hover:text-white">
                <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs w-10 text-center font-mono text-white/60">{Math.round(zoom * 100)}%</span>
            <Button variant="ghost" size="icon" onClick={() => setZoom(Math.min(3, zoom + 0.1))} className="h-8 w-8 rounded-full text-white/60 hover:text-white">
                <ZoomIn className="h-4 w-4" />
            </Button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center" onClick={() => setActiveTool(null)}>
        <div className="absolute inset-0 z-0 opacity-50 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent" />

        <motion.div
            className="relative shadow-2xl shadow-black/80 ring-1 ring-white/10"
            style={{ width: resize.width * zoom, height: resize.height * zoom }}
            layout
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
            {previewUrl && (
                <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-contain pointer-events-none select-none"
                />
            )}
        </motion.div>
      </div>

      {/* Floating Dock */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-2 p-2 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50">
            <DockButton
                icon={Sliders}
                label="Adjust"
                isActive={activeTool === "adjust"}
                onClick={() => setActiveTool(activeTool === "adjust" ? null : "adjust")}
            />
            <DockButton
                icon={Maximize2}
                label="Resize"
                isActive={activeTool === "resize"}
                onClick={() => setActiveTool(activeTool === "resize" ? null : "resize")}
            />
            <div className="w-px h-8 bg-white/10 mx-1" />
            <DockButton
                icon={Download}
                label="Export"
                isActive={activeTool === "export"}
                onClick={() => setActiveTool(activeTool === "export" ? null : "export")}
            />
        </div>
      </div>

      {/* Floating Panels */}
      <AnimatePresence>
        {activeTool === "adjust" && (
            <FloatingPanel title="Adjustments" onClose={() => setActiveTool(null)}>
                <div className="space-y-6">
                    <AdjustmentSlider label="Brightness" value={adjustments.brightness} onChange={(v) => setAdjustments(p => ({...p, brightness: v}))} min={-100} max={100} />
                    <AdjustmentSlider label="Contrast" value={adjustments.contrast} onChange={(v) => setAdjustments(p => ({...p, contrast: v}))} min={-100} max={100} />
                    <AdjustmentSlider label="Saturation" value={adjustments.saturation} onChange={(v) => setAdjustments(p => ({...p, saturation: v}))} min={-100} max={100} />
                    <AdjustmentSlider label="Blur" value={adjustments.blur} onChange={(v) => setAdjustments(p => ({...p, blur: v}))} min={0} max={20} step={0.5} />

                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2 border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                        onClick={() => setAdjustments(DEFAULT_ADJUSTMENTS)}
                    >
                        <RotateCcw className="h-3 w-3 mr-2" /> Reset
                    </Button>
                </div>
            </FloatingPanel>
        )}

        {activeTool === "resize" && (
            <FloatingPanel title="Resize" onClose={() => setActiveTool(null)}>
                <div className="space-y-6">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                        <Label className="text-white/70">Lock Aspect Ratio</Label>
                        <Switch
                            checked={resize.maintainAspect}
                            onCheckedChange={(c) => setResize(p => ({ ...p, maintainAspect: c }))}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs text-white/50">Width</Label>
                            <Input
                                type="number"
                                value={resize.width}
                                onChange={(e) => handleResizeWidth(Number(e.target.value))}
                                className="bg-white/5 border-white/10 text-white focus:border-white/30"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs text-white/50">Height</Label>
                            <Input
                                type="number"
                                value={resize.height}
                                onChange={(e) => handleResizeHeight(Number(e.target.value))}
                                className="bg-white/5 border-white/10 text-white focus:border-white/30"
                            />
                        </div>
                    </div>
                    <div className="text-xs text-white/30 text-center font-mono">
                        Original: {originalSize.width} × {originalSize.height}
                    </div>
                </div>
            </FloatingPanel>
        )}

        {activeTool === "export" && (
            <FloatingPanel title="Export" onClose={() => setActiveTool(null)}>
                <div className="space-y-6">
                    <div className="space-y-3">
                        <Label className="text-white/70">Format</Label>
                        <Select value={exportFormat} onValueChange={(v: any) => setExportFormat(v)}>
                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                                <SelectItem value="png">PNG (Lossless)</SelectItem>
                                <SelectItem value="jpeg">JPEG (Compact)</SelectItem>
                                <SelectItem value="webp">WebP (Modern)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button onClick={handleExport} disabled={isProcessing} className="w-full bg-white text-black hover:bg-white/90">
                        {isProcessing ? "Processing..." : "Download Image"}
                    </Button>

                    <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10"></span></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#1a1a1a] px-2 text-white/30">Or</span></div>
                    </div>

                    <Button variant="secondary" onClick={handleFaviconExport} disabled={isProcessing} className="w-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 text-white border border-white/10">
                        <Package className="h-4 w-4 mr-2" /> Generate Favicons
                    </Button>
                </div>
            </FloatingPanel>
        )}
      </AnimatePresence>

    </div>
  );
}

function DockButton({ icon: Icon, label, isActive, onClick }: { icon: any, label: string, isActive: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all duration-200 group",
                isActive ? "bg-white/20 text-white" : "hover:bg-white/10 text-white/60 hover:text-white"
            )}
        >
            <Icon className="h-5 w-5 mb-1" />
            <span className="text-[10px] font-medium">{label}</span>
        </button>
    )
}

function FloatingPanel({ title, children, onClose }: { title: string, children: React.ReactNode, onClose: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-28 right-8 w-80 bg-[#1a1a1a]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-40"
        >
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                <span className="font-medium text-sm">{title}</span>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6 rounded-full hover:bg-white/10">
                    <X className="h-3 w-3" />
                </Button>
            </div>
            <div className="p-4">
                {children}
            </div>
        </motion.div>
    )
}

function AdjustmentSlider({ label, value, onChange, min, max, step = 1 }: { label: string, value: number, onChange: (v: number) => void, min: number, max: number, step?: number }) {
    return (
        <div className="space-y-3">
            <div className="flex justify-between text-xs">
                <Label className="text-white/70">{label}</Label>
                <span className="text-white/40 font-mono">{value}</span>
            </div>
            <Slider
                min={min} max={max} step={step}
                value={value}
                onChange={onChange}
                className="py-1"
            />
        </div>
    )
}
