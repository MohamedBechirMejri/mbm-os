"use client";

import { useEffect, useMemo } from "react";
import { registerApps } from "../api";

export function __DevRegisterSampleApp() {
  const Demo = useMemo(
    () =>
      function Demo({ instanceId }: { instanceId: string }) {
        return (
          <div style={{ padding: 16, color: "white" }} className="">
            <p style={{ margin: 0, fontWeight: 600 }}>Demo App</p>
            <p style={{ marginTop: 6, opacity: 0.8 }}>Instance: {instanceId}</p>
            <p
              style={{ marginTop: 10, opacity: 0.7 }}
              className="bg-black text-white p-2 rounded"
            >
              Replace this with your actual apps. This component exists so you
              can see a window render before wiring your registry.
            </p>
          </div>
        );
      },
    [],
  );

  useEffect(() => {
    registerApps([{ id: "demo", title: "Demo", Component: Demo }]);
  }, [Demo]);

  return null;
}
