import type { ReactNode } from "react";

export type CommandOutput = string | ReactNode;

export type CommandHandler = (
  ...args: string[]
) => CommandOutput | Promise<CommandOutput>;

export type CommandValue = CommandOutput | CommandHandler;

export type CommandDictionary = Record<string, CommandValue>;
