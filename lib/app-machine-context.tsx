"use client";

import { useActorRef, useSelector } from "@xstate/react";
import { createContext, type ReactNode, useContext } from "react";
import type { ActorRefFrom, StateFrom } from "xstate";
import { appMachine } from "./app-machine";

const AppMachineContext = createContext<ActorRefFrom<typeof appMachine> | null>(
  null,
);

const identitySelector = (state: StateFrom<typeof appMachine>) => state;

type AppMachineProviderProps = {
  children: ReactNode;
};

export function AppMachineProvider({ children }: AppMachineProviderProps) {
  const appActor = useActorRef(appMachine);

  return (
    <AppMachineContext.Provider value={appActor}>
      {children}
    </AppMachineContext.Provider>
  );
}

export function useAppActor() {
  const actor = useContext(AppMachineContext);

  if (!actor) {
    throw new Error("useAppActor must be used within AppMachineProvider");
  }

  return actor;
}

export function useAppSelector<T>(
  selector: (state: StateFrom<typeof appMachine>) => T,
): T {
  const actor = useAppActor();
  return useSelector(actor, selector);
}

export function useAppSnapshot() {
  return useAppSelector(identitySelector);
}
