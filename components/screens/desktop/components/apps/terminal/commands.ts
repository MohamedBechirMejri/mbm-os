import React from "react";
import type { LiveAliasResult } from "./live-aliases";
import { liveAliasRegistry } from "./live-aliases";
import type { CommandDictionary } from "./types";

function lines(...items: string[]) {
  return items.join("\n");
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function wrapMultiline<T extends string | React.ReactNode>(
  value: T,
): T | React.ReactNode {
  if (typeof value === "string" && value.includes("\n")) {
    return React.createElement(
      "pre",
      {
        style: {
          margin: 0,
          font: "inherit",
          whiteSpace: "pre-wrap",
          background: "transparent",
        },
      },
      value,
    );
  }
  return value;
}

function formatLiveAliasHelp(): string[] {
  if (!liveAliasRegistry.length) return [];

  return liveAliasRegistry.map((alias) => {
    const paddedId = alias.aliasId.padEnd(14, " ");
    return `  ${paddedId} ${alias.description}`;
  });
}

function formatLiveAliasOutput(result: LiveAliasResult): React.ReactNode {
  const sectionTitleStyle: React.CSSProperties = {
    fontWeight: 600,
    letterSpacing: "0.02em",
    marginBottom: "0.25rem",
  };

  const monoBlockStyle: React.CSSProperties = {
    fontFamily: "inherit",
    whiteSpace: "pre-wrap",
    lineHeight: 1.5,
  };

  const header = React.createElement(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: "0.25rem" } },
    React.createElement(
      "span",
      { style: { fontWeight: 700, letterSpacing: "0.04em" } },
      result.headline,
    ),
    React.createElement("span", {
      "aria-hidden": "true",
      style: {
        width: "100%",
        height: "1px",
        background: "rgba(255,255,255,0.24)",
        display: "block",
      },
    }),
  );

  let metricsSection: React.ReactNode = null;
  if (result.metrics.length > 0) {
    const metricCells = result.metrics.map((metric) =>
      React.createElement(
        React.Fragment,
        { key: `${metric.label}-${metric.value}` },
        React.createElement("span", { style: { opacity: 0.7 } }, metric.label),
        React.createElement(
          "span",
          { style: { fontWeight: 500 } },
          metric.value,
        ),
      ),
    );

    metricsSection = React.createElement(
      "div",
      null,
      React.createElement("div", { style: sectionTitleStyle }, "Metrics"),
      React.createElement(
        "div",
        {
          style: {
            display: "grid",
            gridTemplateColumns: "max-content 1fr",
            rowGap: "0.35rem",
            columnGap: "1.25rem",
          },
        },
        metricCells,
      ),
    );
  }

  let highlightsSection: React.ReactNode = null;
  if (result.highlights && result.highlights.length > 0) {
    const highlightItems = result.highlights.map((highlight, index) =>
      React.createElement(
        "li",
        {
          key: `${highlight.prefix}-${index}`,
          style: { paddingLeft: "0.25rem" },
        },
        React.createElement(
          "div",
          { style: { fontWeight: 600, marginBottom: "0.25rem" } },
          highlight.prefix,
        ),
        React.createElement(
          "div",
          { style: { ...monoBlockStyle, opacity: 0.85 } },
          highlight.detail,
        ),
      ),
    );

    highlightsSection = React.createElement(
      "div",
      null,
      React.createElement("div", { style: sectionTitleStyle }, "Highlights"),
      React.createElement(
        "ol",
        {
          style: {
            listStyle: "decimal",
            paddingLeft: "1.5rem",
            margin: 0,
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          },
        },
        highlightItems,
      ),
    );
  }

  let footerSection: React.ReactNode = null;
  if (result.footer && result.footer.length > 0) {
    const footerItems = result.footer.map((line, index) =>
      React.createElement(
        "li",
        { key: `${line}-${index}`, style: monoBlockStyle },
        line,
      ),
    );

    footerSection = React.createElement(
      "div",
      null,
      React.createElement("div", { style: sectionTitleStyle }, "Links"),
      React.createElement(
        "ul",
        {
          style: {
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            flexDirection: "column",
            gap: "0.35rem",
          },
        },
        footerItems,
      ),
    );
  }

  return React.createElement(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        padding: "0.25rem 0",
        fontFamily: "inherit",
      },
    },
    header,
    metricsSection,
    highlightsSection,
    footerSection,
  );
}

export function buildCommands(): CommandDictionary {
  const liveAliasHelp = formatLiveAliasHelp();

  const dict: CommandDictionary = {
    help: () =>
      lines(
        "Available commands:",
        "  help           Show this help message",
        // "  about          Learn about this macOS 26 terminal",
        // "  projects       Highlight current work",
        "  socials        Contact information",
        "  whoami         Display identity",
        "  skills         Key capabilities",
        // "  experience     Recent roles and impact",
        // "  education      Academic background",
        // "  ls             List portfolio files",
        // "  cat <file>     View a file (try README.md)",
        // "  neofetch       System-style overview",
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
        ...(liveAliasHelp.length
          ? ["", "Live aliases:", ...liveAliasHelp]
          : []),
      ),
    // about: () =>
    //   lines(
    //     "macOS 26 • Tahoe • Liquid Glass UI",
    //     "This terminal is a simulated shell crafted for the mbm-os desktop.",
    //     "Optimized for showing off, tinkering, and the occasional humble flex.",
    //   ),
    // projects: () =>
    //   lines(
    //     "• mbm-os — macOS 26-style web desktop (you're in it).",
    //     "• Portfolio vNext — liquid glass, spatial transitions, kinetic type.",
    //     "• Design systems — Tahoe components, motion tokens, a11y patterns.",
    //     "• Experiments — 3D scenes, audio-reactive UI, WASM toys.",
    //     "Visit: mohamedbechirmejri.dev",
    //   ),
    socials: () =>
      "Twitter/X: @0x4D424D  •  GitHub: @MohamedBechirMejri  •  Email: bechir@mejri.dev",
    whoami: () => "mohamed bechir mejri (mbm) — creative engineer",
    skills: () =>
      lines(
        "Core skills:",
        "  • TypeScript, React/Next.js, WebGPU/Three.js",
        "  • Motion design, micro-interactions, a11y",
        "  • Design systems, performance tuning, DX",
      ),
    // experience: () =>
    //   lines(
    //     "Recent impact:",
    //     "  • Shipped immersive web experiences at startup speed",
    //     "  • Led design-system rollouts with themeable tokens",
    //     "  • Built tooling that cut iteration time by 40%",
    //   ),
    // education: () =>
    //   lines(
    //     "Education:",
    //     "  • B.S. Computer Science — focus on HCI & Graphics",
    //   ),
    // ls: () => lines("README.md  resume.txt  projects/  lab/  secrets/"),
    // cat: (...args: string[]) => {
    //   const target = (args[0] || "").toLowerCase();
    //   switch (target) {
    //     case "readme.md":
    //       return lines(
    //         "# mbm-os",
    //         "A playful macOS 26 terminal made for the portfolio.",
    //         "Type 'projects' or 'neofetch' to explore.",
    //       );
    //     case "resume.txt":
    //       return lines(
    //         "Mohamed Bechir Mejri — Creative Engineer",
    //         "Strengths: TypeScript, React, motion, systems thinking",
    //         "See full resume on mohamedbechirmejri.dev",
    //       );
    //     case "secrets/konami.txt":
    //       return "↑↑↓↓←→←→ B A — now try 'rick'";
    //     default:
    //       return target ? `cat: ${args[0]}: No such file` : "Usage: cat <file>";
    //   }
    // },
    // neofetch: () => {
    //   const logo = [
    //     "        __  __  __  ",
    //     "  /\\  / / / / / / ",
    //     " /  \\ / /_/ / / /  ",
    //     "/_/\\_\\___,_/ /_/   ",
    //   ].join("\n");
    //   const info = [
    //     "mbm-os",
    //     "──────────────",
    //     "OS: macOS 26 Tahoe (web)",
    //     "Shell: faux-sh (TypeScript)",
    //     "Theme: Liquid Glass",
    //     "Site: mohamedbechirmejri.dev",
    //   ]
    //     .map((l) => "  " + l)
    //     .join("\n");
    //   return logo + "\n\n" + info;
    // },
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

  for (const alias of liveAliasRegistry) {
    dict[alias.aliasId] = async () =>
      formatLiveAliasOutput(await alias.resolve());
  }

  // Automatically wrap any multiline string responses in <pre> so newlines render.
  const wrapped: CommandDictionary = {};
  for (const [key, value] of Object.entries(dict)) {
    if (typeof value === "string") {
      wrapped[key] = wrapMultiline(value);
    } else if (typeof value === "function") {
      wrapped[key] = (...args: string[]) => {
        const out = value(...args);
        if (typeof out === "string") return wrapMultiline(out);
        return out;
      };
    } else {
      wrapped[key] = value;
    }
  }

  return wrapped;
}
