import type { ReactNode } from "react";

export type CommandValue =
  | string
  | ReactNode
  | ((...args: string[]) => string | ReactNode);

export type CommandDictionary = Record<string, CommandValue>;
