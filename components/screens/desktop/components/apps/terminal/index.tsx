"use client";

import { useMemo } from "react";
import { ReactTerminal, TerminalContextProvider } from "react-terminal";
import { buildCommands } from "./commands";
import { MAC_TERMINAL_THEME, MAC_THEME_NAME } from "./theme";
import { buildWelcomeMessage } from "./welcome";

export function TerminalApp({ instanceId }: { instanceId: string }) {
  const welcomeMessage = useMemo(() => buildWelcomeMessage(), []);
  const commands = useMemo(() => buildCommands(), []);

  return (
    <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,rgba(84,125,255,0.24),transparent_62%)]">
      <div className="relative flex h-full w-full max-w-3xl flex-col overflow-hidden rounded-[22px] border border-white/10 bg-[linear-gradient(135deg,rgba(24,27,37,0.95),rgba(8,10,16,0.92))] shadow-[0_42px_90px_-35px_rgba(8,10,20,0.95)] backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-x-8 top-6 h-24 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex flex-1 flex-col overflow-hidden px-6 py-6">
          <div className="flex h-full overflow-hidden rounded-2xl border border-white/10 bg-black/70 shadow-inner">
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
                  background: "transparent",
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
