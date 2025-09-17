import type { CommandDictionary } from "./types";

function lines(...items: string[]) {
  return items.join("\n");
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function repeat(str: string, n: number) {
  return Array.from({ length: n }, () => str).join("");
}

function center(text: string, width = 48) {
  const pad = Math.max(0, Math.floor((width - text.length) / 2));
  return repeat(" ", pad) + text;
}

export function buildCommands(): CommandDictionary {
  return {
    help: () =>
      lines(
        "Available commands:",
        "  help           Show this help message",
        "  about          Learn about this macOS 26 terminal",
        "  projects       Highlight current work",
        "  socials        Contact information",
        "  whoami         Display identity",
        "  skills         Key capabilities",
        "  experience     Recent roles and impact",
        "  education      Academic background",
        "  ls             List portfolio files",
        "  cat <file>     View a file (try README.md)",
        "  neofetch       System-style overview",
        "  echo <text>    Echo back your input",
        "  date           Print the current date",
        "  clear          Clear the console",
        "",
        "Fun extras:",
        "  fortune        A tiny dose of wisdom",
        "  cowsay <text>  A cow delivers your message",
        "  matrix         Drippy green glyphs",
        "  rick           A very educational link",
        "  sudo <cmd>     Try 'sudo make me a sandwich'",
      ),
    about: () =>
      lines(
        "macOS 26 • Tahoe • Liquid Glass UI",
        "This terminal is a simulated shell crafted for the mbm-os desktop.",
        "Optimized for showing off, tinkering, and the occasional humble flex.",
      ),
    projects: () =>
      lines(
        "• mbm-os — macOS 26-style web desktop (you're in it).",
        "• Portfolio vNext — liquid glass, spatial transitions, kinetic type.",
        "• Design systems — Tahoe components, motion tokens, a11y patterns.",
        "• Experiments — 3D scenes, audio-reactive UI, WASM toys.",
        "Visit: mohamedbechirmejri.dev",
      ),
    socials: () =>
      "Twitter/X: @mbm  •  GitHub: @mohamedbechirmejri  •  Email: hello@mohamedbechirmejri.dev",
    whoami: () => "mohamed bechir mejri (mbm) — creative engineer",
    skills: () =>
      lines(
        "Core skills:",
        "  • TypeScript, React/Next.js, WebGL/Three.js",
        "  • Motion design, micro-interactions, a11y",
        "  • Design systems, performance tuning, DX",
      ),
    experience: () =>
      lines(
        "Recent impact:",
        "  • Shipped immersive web experiences at startup speed",
        "  • Led design-system rollouts with themeable tokens",
        "  • Built tooling that cut iteration time by 40%",
      ),
    education: () =>
      lines(
        "Education:",
        "  • B.S. Computer Science — focus on HCI & Graphics",
      ),
    ls: () => lines("README.md  resume.txt  projects/  lab/  secrets/"),
    cat: (...args: string[]) => {
      const target = (args[0] || "").toLowerCase();
      switch (target) {
        case "readme.md":
          return lines(
            "# mbm-os",
            "A playful macOS 26 terminal made for the portfolio.",
            "Type 'projects' or 'neofetch' to explore.",
          );
        case "resume.txt":
          return lines(
            "Mohamed Bechir Mejri — Creative Engineer",
            "Strengths: TypeScript, React, motion, systems thinking",
            "See full resume on mohamedbechirmejri.dev",
          );
        case "secrets/konami.txt":
          return "↑↑↓↓←→←→ B A — now try 'rick'";
        default:
          return target ? `cat: ${args[0]}: No such file` : "Usage: cat <file>";
      }
    },
    neofetch: () => {
      const logo = [
        "        __  __  __  ",
        "  /\\  / / / / / / ",
        " /  \\ / /_/ / / /  ",
        "/_/\\_\\___,_/ /_/   ",
      ].join("\n");
      const info = [
        "mbm-os",
        "──────────────",
        "OS: macOS 26 Tahoe (web)",
        "Shell: faux-sh (TypeScript)",
        "Theme: Liquid Glass",
        "Site: mohamedbechirmejri.dev",
      ]
        .map((l) => "  " + l)
        .join("\n");
      return logo + "\n\n" + info;
    },
    fortune: () =>
      randomChoice([
        "Simplicity scales.",
        "Details aren’t details; they make the design.",
        "Fast is a feature.",
        "Ship. Learn. Refine.",
      ]),
    cowsay: (...args: string[]) => {
      const msg = args.length ? args.join(" ") : "moo";
      return lines(
        `  ${"_".repeat(Math.max(2, msg.length))}`,
        ` < ${msg} >`,
        `  ${"-".repeat(Math.max(2, msg.length))}`,
        "        \\   ^__^",
        "         \\  (oo)\\_______",
        "            (__)\\       )\\/\\",
        "                ||----w |",
        "                ||     ||",
      );
    },
    matrix: () => {
      const rows = 12;
      const cols = 48;
      const glyphs = "01░▒▓".split("");
      const grid = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => randomChoice(glyphs)).join(""),
      ).join("\n");
      return grid;
    },
    rick: () =>
      lines(
        "Never gonna give you up: https://youtu.be/dQw4w9WgXcQ",
        "CTRL/CMD+Click to open (you’ve been warned).",
      ),
    sudo: (...args: string[]) => {
      const phrase = args.join(" ").toLowerCase().trim();
      if (phrase === "make me a sandwich")
        return "Okay. You are now a sandwich.";
      return "sudo: permission denied";
    },
    date: () => new Date().toLocaleString(),
    echo: (...args: string[]) => (args.length ? args.join(" ") : ""),
    clear: () => "",
  } satisfies CommandDictionary;
}
