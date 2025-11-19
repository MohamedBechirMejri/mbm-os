import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Download,
  Sliders,
  Maximize2,
  Package,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  X,
  RotateCw,
  FlipHorizontal2,
  FlipVertical2,
  Sparkles,
  Crop,
  ScanEye,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useImageEditor } from "../hooks/use-image-editor";
import type { FilterOptions, ResizeOptions, ExportFormat, PresetName } from "../types";
import { PRESETS } from "../lib/presets";
import { CropTool } from "./tools/crop-tool";
import { ComparisonSlider } from "./tools/comparison-slider";
import { Histogram } from "./tools/histogram";
import { useKeyboardShortcuts } from "../hooks/use-keyboard-shortcuts";
import { cn } from "@/lib/utils";
import { saveAs } from "file-saver";

interface EditorProps {
  file: File;
  onClose: () => void;
}

export function Editor({ file, onClose }: EditorProps) {
  const editor = useImageEditor(file);
  const [activeTool, setActiveTool] = useState<"adjust" | "resize" | "export" | "presets" | "crop" | "compare" | "histogram" | null>(null);
  const [zoom, setZoom] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("png");
  const [exportQuality, setExportQuality] = useState(0.9);
  const [comparisonMode, setComparisonMode] = useState<"overlay" | "sideBySide">("overlay");
  const [originalImageUrl, setOriginalImageUrl] = useState("");
  const [showCropTool, setShowCropTool] = useState(false);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onUndo: editor.undo,
    onRedo: editor.redo,
    onRotate: () => editor.rotate("cw"),
    onRotateCounter: () => editor.rotate("ccw"),
    onFlipH: () => editor.flip("h"),
    onFlipV: () => editor.flip("v"),
    onCrop: () => setShowCropTool(true),
    onExport: () => setActiveTool("export"),
    onReset: editor.reset,
    enabled: !showCropTool, // Disable shortcuts when crop tool is active
  });

  const handleResizeWidth = (val: number) => {
    if (editor.resize.maintainAspect) {
      const ratio = editor.originalSize.width / editor.originalSize.height;
      editor.setResize({ width: val, height: Math.round(val / ratio) });
    } else {
      editor.setResize({ width: val });
    }
  };

  const handleResizeHeight = (val: number) => {
    if (editor.resize.maintainAspect) {
      const ratio = editor.originalSize.width / editor.originalSize.height;
      editor.setResize({ height: val, width: Math.round(val * ratio) });
    } else {
      editor.setResize({ height: val });
    }
  };

  const handleExport = async () => {
    setIsProcessing(true);
    const blob = await editor.exportImage(exportFormat, exportQuality);
    if (blob) {
      saveAs(blob, `${file.name.split(".")[0]}_edited.${exportFormat}`);
    }
    setIsProcessing(false);
  };

  const handleFaviconExport = async () => {
    setIsProcessing(true);
    const blob = await editor.exportFavicons();
    if (blob) {
      saveAs(blob, "favicons.zip");
    }
    setIsProcessing(false);
  };

  const handleAppIconsExport = async () => {
    setIsProcessing(true);
    const blob = await editor.exportAppIcons();
    if (blob) {
      saveAs(blob, "app-icons.zip");
    }
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
                <span className="text-[10px] text-white/40 font-mono">{editor.originalSize.width}×{editor.originalSize.height}</span>
            </div>
        </div>

        {/* Transform & History Controls */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Undo/Redo */}
          <div className="flex items-center gap-1 bg-black/40 backdrop-blur-xl p-1 rounded-full border border-white/10 mr-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={editor.undo}
              disabled={!editor.canUndo}
              className="h-8 w-8 rounded-full text-white/60 hover:text-white disabled:opacity-30"
            >
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={editor.redo}
              disabled={!editor.canRedo}
              className="h-8 w-8 rounded-full text-white/60 hover:text-white disabled:opacity-30"
            >
              <Redo2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Transform Controls */}
          <div className="flex items-center gap-1 bg-black/40 backdrop-blur-xl p-1 rounded-full border border-white/10 mr-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => editor.rotate("cw")}
              className="h-8 w-8 rounded-full text-white/60 hover:text-white"
              title="Rotate clockwise"
            >
              <RotateCw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => editor.flip("h")}
              className="h-8 w-8 rounded-full text-white/60 hover:text-white"
              title="Flip horizontal"
            >
              <FlipHorizontal2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => editor.flip("v")}
              className="h-8 w-8 rounded-full text-white/60 hover:text-white"
              title="Flip vertical"
            >
              <FlipVertical2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-xl p-1 rounded-full border border-white/10">
            <Button variant="ghost" size="icon" onClick={() => setZoom(Math.max(0.1, zoom - 0.1))} className="h-8 w-8 rounded-full text-white/60 hover:text-white">
                <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs w-10 text-center font-mono text-white/60">{Math.round(zoom * 100)}%</span>
            <Button variant="ghost" size="icon" onClick={() => setZoom(Math.min(3, zoom + 0.1))} className="h-8 w-8 rounded-full text-white/60 hover:text-white">
                <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center" onClick={() => setActiveTool(null)}>
        <div className="absolute inset-0 z-0 opacity-50 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent" />

        <motion.div
            className="relative shadow-2xl shadow-black/80 ring-1 ring-white/10"
            style={{ width: editor.resize.width * zoom, height: editor.resize.height * zoom }}
            layout
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
            {editor.previewUrl && (
                <img
                    src={editor.previewUrl}
                    alt="Preview"
                    className="w-full h-full object-contain pointer-events-none select-none"
                />
            )}
        </motion.div>
      </div>

      {/* Crop Tool Overlay */}
      {showCropTool && editor.isLoaded && (
        <CropTool
          imageDimensions={editor.resize}
          onApply={(crop) => {
            editor.setCrop(crop);
            setShowCropTool(false);
          }}
          onCancel={() => setShowCropTool(false)}
        />
      )}

      {/* Floating Dock */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-2 p-2 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50">
            <DockButton
                icon={Sparkles}
                label="Presets"
                isActive={activeTool === "presets"}
                onClick={() => setActiveTool(activeTool === "presets" ? null : "presets")}
            />
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
            <DockButton
                icon={Crop}
                label="Crop"
                isActive={showCropTool}
                onClick={() => setShowCropTool(!showCropTool)}
            />
            <DockButton
                icon={ScanEye}
                label="Compare"
                isActive={activeTool === "compare"}
                onClick={() => {
                  if (!originalImageUrl) {
                    // Capture original image once
                    setOriginalImageUrl(editor.previewUrl);
                  }
                  setActiveTool(activeTool === "compare" ? null : "compare");
                }}
            />
            <DockButton
                icon={BarChart3}
                label="Histogram"
                isActive={activeTool === "histogram"}
                onClick={() => setActiveTool(activeTool === "histogram" ? null : "histogram")}
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
        {activeTool === "presets" && (
            <FloatingPanel title="Presets" onClose={() => setActiveTool(null)}>
                <div className="grid grid-cols-2 gap-3">
                    {(Object.keys(PRESETS) as PresetName[]).map((preset) => (
                        <Button
                            key={preset}
                            variant="outline"
                            onClick={() => {
                                editor.applyPreset(preset);
                                setActiveTool(null);
                            }}
                            className="h-auto flex flex-col items-start p-3 border-white/10 bg-white/5 hover:bg-white/10 text-white"
                        >
                            <span className="font-medium capitalize">{preset}</span>
                            <span className="text-[10px] text-white/40 mt-1">
                                {preset === "enhance" && "Boost colors & contrast"}
                                {preset === "vintage" && "Warm retro look"}
                                {preset === "bw" && "Black & white"}
                                {preset === "sharpen" && "Increase definition"}
                                {preset === "soft" && "Gentle & dreamy"}
                                {preset === "vibrant" && "Pop of color"}
                            </span>
                        </Button>
                    ))}
                </div>
            </FloatingPanel>
        )}

        {activeTool === "adjust" && (
            <FloatingPanel title="Adjustments" onClose={() => setActiveTool(null)}>
                <div className="space-y-6">
                    <AdjustmentSlider label="Brightness" value={editor.adjustments.brightness} onChange={(v) => editor.setAdjustments({ brightness: v })} min={-100} max={100} />
                    <AdjustmentSlider label="Contrast" value={editor.adjustments.contrast} onChange={(v) => editor.setAdjustments({ contrast: v })} min={-100} max={100} />
                    <AdjustmentSlider label="Saturation" value={editor.adjustments.saturation} onChange={(v) => editor.setAdjustments({ saturation: v })} min={-100} max={100} />
                    <AdjustmentSlider label="Blur" value={editor.adjustments.blur} onChange={(v) => editor.setAdjustments({ blur: v })} min={0} max={20} step={0.5} />

                    <div className="border-t border-white/10 pt-4 mt-4">
                        <p className="text-xs text-white/40 mb-4">Advanced</p>
                        <div className="space-y-6">
                            <AdjustmentSlider label="Temperature" value={editor.adjustments.temperature} onChange={(v) => editor.setAdjustments({ temperature: v })} min={-100} max={100} />
                            <AdjustmentSlider label="Tint" value={editor.adjustments.tint} onChange={(v) => editor.setAdjustments({ tint: v })} min={-100} max={100} />
                            <AdjustmentSlider label="Exposure" value={editor.adjustments.exposure} onChange={(v) => editor.setAdjustments({ exposure: v })} min={-100} max={100} />
                            <AdjustmentSlider label="Highlights" value={editor.adjustments.highlights} onChange={(v) => editor.setAdjustments({ highlights: v })} min={-100} max={100} />
                            <AdjustmentSlider label="Shadows" value={editor.adjustments.shadows} onChange={(v) => editor.setAdjustments({ shadows: v })} min={-100} max={100} />
                            <AdjustmentSlider label="Vignette" value={editor.adjustments.vignette} onChange={(v) => editor.setAdjustments({ vignette: v })} min={0} max={100} />
                            <AdjustmentSlider label="Grain" value={editor.adjustments.grain} onChange={(v) => editor.setAdjustments({ grain: v })} min={0} max={100} />
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2 border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                        onClick={editor.reset}
                    >
                        <Undo2 className="h-3 w-3 mr-2" /> Reset All
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
                            checked={editor.resize.maintainAspect}
                            onCheckedChange={(c) => editor.setResize({ maintainAspect: c })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs text-white/50">Width</Label>
                            <Input
                                type="number"
                                value={editor.resize.width}
                                onChange={(e) => handleResizeWidth(Number(e.target.value))}
                                className="bg-white/5 border-white/10 text-white focus:border-white/30"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs text-white/50">Height</Label>
                            <Input
                                type="number"
                                value={editor.resize.height}
                                onChange={(e) => handleResizeHeight(Number(e.target.value))}
                                className="bg-white/5 border-white/10 text-white focus:border-white/30"
                            />
                        </div>
                    </div>
                    <div className="text-xs text-white/30 text-center font-mono">
                        Original: {editor.originalSize.width} × {editor.originalSize.height}
                    </div>
                </div>
            </FloatingPanel>
        )}

        {activeTool === "export" && (
            <FloatingPanel title="Export" onClose={() => setActiveTool(null)}>
                <div className="space-y-6">
                    <div className="space-y-3">
                        <Label className="text-white/70">Format</Label>
                        <Select value={exportFormat} onValueChange={(v) => setExportFormat(v as ExportFormat)}>
                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                                <SelectItem value="png">PNG (Lossless)</SelectItem>
                                <SelectItem value="jpeg">JPEG (Compact)</SelectItem>
                                <SelectItem value="webp">WebP (Modern)</SelectItem>
                                <SelectItem value="avif">AVIF (Efficient)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {exportFormat !== "png" && (
                        <div className="space-y-3">
                            <div className="flex justify-between text-xs">
                                <Label className="text-white/70">Quality</Label>
                                <span className="text-white/40 font-mono">{Math.round(exportQuality * 100)}%</span>
                            </div>
                            <Slider
                                min={0.1}
                                max={1}
                                step={0.05}
                                value={exportQuality}
                                onChange={setExportQuality}
                                className="py-1"
                            />
                        </div>
                    )}

                    <Button onClick={handleExport} disabled={isProcessing} className="w-full bg-white text-black hover:bg-white/90">
                        {isProcessing ? "Processing..." : "Download Image"}
                    </Button>

                    <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10"></span></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#1a1a1a] px-2 text-white/30">Generate Sets</span></div>
                    </div>

                    <Button variant="secondary" onClick={handleFaviconExport} disabled={isProcessing} className="w-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 text-white border border-white/10">
                        <Package className="h-4 w-4 mr-2" /> Favicons
                    </Button>

                    <Button variant="secondary" onClick={handleAppIconsExport} disabled={isProcessing} className="w-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 text-white border border-white/10">
                        <Package className="h-4 w-4 mr-2" /> App Icons (iOS + Android + PWA)
                    </Button>
                </div>
            </FloatingPanel>
        )}

        {activeTool === "compare" && originalImageUrl && (
            <FloatingPanel title="Compare" onClose={() => setActiveTool(null)}>
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant={comparisonMode === "overlay" ? "default" : "outline"}
                            onClick={() => setComparisonMode("overlay")}
                            className="flex-1"
                        >
                            Overlay
                        </Button>
                        <Button
                            size="sm"
                            variant={comparisonMode === "sideBySide" ? "default" : "outline"}
                            onClick={() => setComparisonMode("sideBySide")}
                            className="flex-1"
                        >
                            Side-by-Side
                        </Button>
                    </div>
                    <div className="w-full h-64 rounded-lg overflow-hidden">
                        <ComparisonSlider
                            beforeUrl={originalImageUrl}
                            afterUrl={editor.previewUrl}
                            mode={comparisonMode}
                        />
                    </div>
                </div>
            </FloatingPanel>
        )}

        {activeTool === "histogram" && (
            <FloatingPanel title="Histogram" onClose={() => setActiveTool(null)}>
                <Histogram imageUrl={editor.previewUrl} width={300} height={150} />
            </FloatingPanel>
        )}
      </AnimatePresence>

    </div>
  );
}

function DockButton({ icon: Icon, label, isActive, onClick }: { icon: typeof Download, label: string, isActive: boolean, onClick: () => void }) {
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
