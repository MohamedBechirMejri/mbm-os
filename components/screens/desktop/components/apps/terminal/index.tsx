"use client";

import { useMemo } from "react";
import { ReactTerminal, TerminalContextProvider } from "react-terminal";
import { buildCommands } from "./commands";
import { MAC_TERMINAL_THEME, MAC_THEME_NAME } from "./theme";
import { buildWelcomeMessage } from "./welcome";

export function TerminalApp({ instanceId }: { instanceId: string }) {
  const welcomeMessage = useMemo(() => {
    const raw = buildWelcomeMessage();
    if (raw.includes("\n")) {
      return (
        <pre
          style={{
            margin: 0,
            font: "inherit",
            whiteSpace: "pre-wrap",
            background: "transparent",
          }}
        >
          {raw}
        </pre>
      );
    }
    return raw;
  }, []);
  const commands = useMemo(() => buildCommands(), []);

  return (
    <div className="flex h-full w-full items-center justify-center bg-black/40 backdrop-blur-3xl">
      <div className="relative flex h-full w-full flex-col overflow-hidden backdrop-blur-xl">
        <div className="relative flex flex-1 flex-col overflow-hidden pt-8">
          <div className="flex h-full w-full overflow-hidden">
            <TerminalContextProvider key={instanceId}>
              <ReactTerminal
                prompt="mbm@macos-26 ~ %"
                welcomeMessage={welcomeMessage}
                commands={commands}
                defaultHandler={(command: string) =>
                  `Command not found: ${command}. Type 'help' to see what is available.`
                }
                showControlBar={false}
                showControlButtons={false}
                enableInput
                theme={MAC_THEME_NAME}
                themes={MAC_TERMINAL_THEME}
                style={{
                  width: "100%",
                  height: "100%",
                  padding: "1.5rem",
                  fontSize: "0.95rem",
                  lineHeight: "1.5",
                  fontFamily:
                    "SFMono-Regular, ui-monospace, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                  background: "transparent !important",
                  // Preserve newlines returned by command handlers (they were collapsing into spaces)
                  whiteSpace: "pre-wrap",
                }}
              />
            </TerminalContextProvider>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TerminalApp;
