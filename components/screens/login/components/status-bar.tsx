import { Battery, Wifi } from "lucide-react";
import { APPLE_TEXT_FONT_STACK } from "../constants/fonts";

export default function StatusBar() {
  return (
    <div
      className="absolute top-3 right-4 flex items-center gap-3 text-white/85 text-sm"
      style={{ fontFamily: APPLE_TEXT_FONT_STACK }}
    >
      <Wifi size={18} className="opacity-90" />
      <Battery size={20} className="opacity-90" />
    </div>
  );
}
