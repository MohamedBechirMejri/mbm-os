import { createMachine } from "xstate";

export type AppScreen = "boot" | "login" | "desktop";

type AppEvent =
  | { type: "BOOT_FINISHED" }
  | { type: "LOGIN_SUCCESS" }
  | { type: "LOCK" }
  | { type: "LOGOUT" };

export const appMachine = createMachine({
  types: {
    events: {} as AppEvent,
  },
  id: "app",
  initial: "boot",
  states: {
    boot: {
      on: { BOOT_FINISHED: "login" },
    },
    login: {
      on: { LOGIN_SUCCESS: "desktop" },
    },
    desktop: {
      // TODO: add substates later (e.g., locked, sleep)
      type: "parallel",
      on: {
        LOCK: "login",
        LOGOUT: "login",
      },
    },
  },
});
