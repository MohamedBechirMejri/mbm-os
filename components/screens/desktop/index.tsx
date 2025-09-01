import Image from "next/image";
import { Dock, DockIcon } from "./components/dock";
import { DesktopAPI, WindowManagerRoot } from "./components/window-manager";
import { __DevRegisterSampleApp } from "./components/window-manager/index";

const icons = [
  "file-manager",
  "safari",
  "softwarecenter",
  "calendar",
  "calc",
  "terminal",
  "google-chrome",
  "spotify-client",
  "badland",
  "chess",
  "doom-2016",
  "mindustry",
  "rimworld",
];

export default function Desktop() {
  return (
    <div className="relative size-full grid grid-rows-[auto_minmax(0,_1fr)_auto]">
      <div></div>
      <div>
        <WindowManagerRoot />
        <__DevRegisterSampleApp />
        <button
          type="button"
          style={{ position: "fixed", left: 12, bottom: 12, zIndex: 9999 }}
          onClick={() => DesktopAPI.launch("demo")}
        >
          Launch Demo
        </button>
      </div>
      <Dock className="mb-2 select-none w-max">
        {icons.map((icon) => (
          <DockIcon key={icon} size={64} magnification={2} distance={120}>
            <Image
              src={`/assets/icons/apps/${icon}.ico`}
              alt="Icon"
              width={64}
              height={64}
            />
          </DockIcon>
        ))}
      </Dock>
    </div>
  );
}
