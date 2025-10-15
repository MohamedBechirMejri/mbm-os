import { Sun } from "lucide-react";
import ElasticSlider from "@/components/ui/elastic-slider";
import GlassSurface from "@/components/ui/glass-surface";
import { Slider } from "@/components/ui/slider";
import { useBrightnessStore } from "@/lib/brightness-store";

export default function Display() {
  const { brightness, setBrightness } = useBrightnessStore((state) => state);

  const MIN_BRIGHTNESS = 10; // Match the store's minimum

  return (
    <GlassSurface
      blur={2}
      borderRadius={24}
      className="!w-full !h-max !bg-black/40 col-span-2"
    >
      <div className="w-full p-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-white/80">
          Display
        </div>
        <div className="mt-4 grid gap-3">
          <div className="flex items-center gap-3">
            <ElasticSlider
              leftIcon={<Sun className="w-4 h-4 text-white/60" />}
              rightIcon={<Sun className="w-4 h-4 text-white/60" />}
              startingValue={MIN_BRIGHTNESS}
              defaultValue={brightness}
              maxValue={100}
              onChange={setBrightness}
              className="w-full h-max items-center flex"
              sliderClassName="bg-white h-1"
              sliderBackgroundClassName="bg-black h-1"
              sliderKnobClassName=""
            />
          </div>
        </div>
      </div>
    </GlassSurface>
  );
}
