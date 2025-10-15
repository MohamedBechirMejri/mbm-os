import { Sun, SunDim } from "lucide-react";
import ElasticSlider from "@/components/ui/elastic-slider";
import GlassSurface from "@/components/ui/glass-surface";
import { useBrightnessStore } from "@/lib/brightness-store";

export default function Display() {
  const { brightness, setBrightness } = useBrightnessStore((state) => state);

  const MIN_BRIGHTNESS = 10; // Match the store's minimum

  return (
    <GlassSurface
      blur={1}
      borderRadius={24}
      className="!w-full !h-max col-span-2 !backdrop-blur-[8px]"
    >
      <div className="w-full p-2 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-white/80">
          Display
        </div>

        <ElasticSlider
          leftIcon={<SunDim className="w-4 h-4" />}
          rightIcon={<Sun className="w-4 h-4 " />}
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
    </GlassSurface>
  );
}
