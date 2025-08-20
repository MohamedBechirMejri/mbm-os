import { createMachine } from "xstate";

export type AppScreen = "boot" | "login" | "desktop";

export const appMachine = createMachine({
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
    },
  },
});
