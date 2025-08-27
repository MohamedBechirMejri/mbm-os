import Image from "next/image";
import { Dock, DockIcon } from "./components/dock";

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
      <div></div>
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
