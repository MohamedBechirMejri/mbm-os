"use client";

import { useMachine } from "@xstate/react";
import BootScreen from "@/components/screens/boot";
import { appMachine } from "@/lib/app-machine";

export default function AppShell() {
  const [state, send] = useMachine(appMachine);

  if (state.matches("boot"))
    return (
      <BootScreen
        onDone={() => {
          send({ type: "BOOT_FINISHED" });
          console.log("Boot finished");
        }}
      />
    );
  // if (state.matches("login"))
  // return <LoginScreen onSuccess={() => send({ type: "LOGIN_SUCCESS" })} />;
  // return <Desktop />;
}
