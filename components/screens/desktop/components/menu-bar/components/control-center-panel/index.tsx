"use client";

import Display from "./display";

type ControlCenterPanelProps = {
  onClose: () => void;
};

export function ControlCenterPanel(_props: ControlCenterPanelProps) {
  return (
    <section className="w-[20rem] space-y-4 text-white">
      <div className="grid grid-cols-2 gap-4">
        <Display />
      </div>
    </section>
  );
}
