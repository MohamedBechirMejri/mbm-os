"use client";

import Image from "next/image";
import { AppRegistry } from "./components/apps/app-registry";
import { Dock, DockIcon } from "./components/dock";
import {
  DesktopAPI,
  useDesktop,
  WindowManagerRoot,
} from "./components/window-manager";

export default function Desktop() {
  const installed = useDesktop((s) => Object.values(s.apps));
  return (
    <div className="relative size-full grid grid-rows-[auto_minmax(0,_1fr)_auto]">
      <div></div>
      <div>
        <WindowManagerRoot />
        <AppRegistry />
      </div>
      <Dock className="mb-2 select-none w-max">
        {installed.map((app) => (
          <DockIcon
            key={app.id}
            size={64}
            magnification={2}
            distance={120}
            onClick={() => DesktopAPI.launch(app.id)}
          >
            <Image
              src={`/assets/icons/apps/${app.icon}.ico`}
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
