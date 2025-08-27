import { createMachine } from "xstate";

export type AppScreen = "boot" | "login" | "desktop";

export const appMachine = createMachine({
  id: "app",
  initial: "desktop", // TODO: set this to boot when done.
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
    },
  },
});
