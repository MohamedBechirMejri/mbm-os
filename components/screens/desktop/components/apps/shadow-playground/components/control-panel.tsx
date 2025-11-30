import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Settings2, Move } from "lucide-react";
import ElasticSlider from "@/components/ui/elastic-slider";
import { ShadowLayer } from "../types";

interface ControlPanelProps {
  activeLayer: ShadowLayer;
  onUpdateLayer: (updates: Partial<ShadowLayer>) => void;
}

export function ControlPanel({
  activeLayer,
  onUpdateLayer,
}: ControlPanelProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Position */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/40">
          <Move className="h-3 w-3" /> Position
        </div>
        <ControlGroup
          label="X Offset"
          value={activeLayer.x}
          min={-100}
          max={100}
          onChange={v => onUpdateLayer({ x: v })}
          unit="px"
        />
        <ControlGroup
          label="Y Offset"
          value={activeLayer.y}
          min={-100}
          max={100}
          onChange={v => onUpdateLayer({ y: v })}
          unit="px"
        />
      </div>

      {/* Appearance */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/40">
          <Settings2 className="h-3 w-3" /> Appearance
        </div>
        <ControlGroup
          label="Blur"
          value={activeLayer.blur}
          min={0}
          max={100}
          onChange={v => onUpdateLayer({ blur: v })}
          unit="px"
        />
        <ControlGroup
          label="Spread"
          value={activeLayer.spread}
          min={-50}
          max={50}
          onChange={v => onUpdateLayer({ spread: v })}
          unit="px"
        />
      </div>

      {/* Color & Style */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/40">
          <div className="h-3 w-3 rounded-full bg-current" /> Style
        </div>
        <ControlGroup
          label="Opacity"
          value={activeLayer.opacity}
          min={0}
          max={1}
          step={0.01}
          onChange={v => onUpdateLayer({ opacity: v })}
          unit="%"
          displayValue={Math.round(activeLayer.opacity * 100)}
        />

        <div className="flex items-center justify-between pt-2">
          <Label className="text-sm font-medium text-white/80">Color</Label>
          <div className="flex items-center gap-2 relative">
            <div
              className="h-6 w-6 rounded-full border border-white/20"
              style={{ backgroundColor: activeLayer.color }}
            />
            <Input
              type="color"
              value={activeLayer.color}
              onChange={e => onUpdateLayer({ color: e.target.value })}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
            />
            <span className="font-mono text-xs text-white/60 uppercase">
              {activeLayer.color}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <Label className="text-sm font-medium text-white/80">Inset</Label>
          <Switch
            checked={activeLayer.inset}
            onCheckedChange={v => onUpdateLayer({ inset: v })}
          />
        </div>
      </div>
    </div>
  );
}

function ControlGroup({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  unit,
  displayValue,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (val: number) => void;
  unit: string;
  displayValue?: number;
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs">
        <span className="text-white/60">{label}</span>
        <span className="font-mono text-white/40">
          {displayValue ?? value}
          {unit}
        </span>
      </div>
      <div className="px-2">
        <ElasticSlider
          defaultValue={value}
          startingValue={min}
          maxValue={max}
          stepSize={step}
          isStepped={true}
          onChange={onChange}
          className="w-full"
          leftIcon={null}
          rightIcon={null}
        />
      </div>
    </div>
  );
}
