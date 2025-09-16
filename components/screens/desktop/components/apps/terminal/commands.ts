import type { CommandDictionary } from "./types";

function lines(...items: string[]) {
  return items.join("\n");
}

export function buildCommands(): CommandDictionary {
  return {
    help: () =>
      lines(
        "Available commands:",
        "  help        Show this help message",
        "  about       Learn about this macOS 26 terminal",
        "  projects    Highlight current work",
        "  socials     Contact information",
        "  date        Print the current date",
        "  echo        Echo back your input",
        "  clear       Clear the console",
      ),
    about: () =>
      "macOS 26 inspired terminal. This is a simulated shell built for the mbm-os desktop experience.",
    projects: () =>
      "Latest experiments live on mohamedbechirmejri.dev and the mbm-os project.",
    socials: () =>
      "Twitter/X: @mbm  •  GitHub: @mohamedbechirmejri  •  Email: hello@mohamedbechirmejri.dev",
    date: () => new Date().toLocaleString(),
    echo: (...args: string[]) => (args.length ? args.join(" ") : ""),
  } satisfies CommandDictionary;
}
