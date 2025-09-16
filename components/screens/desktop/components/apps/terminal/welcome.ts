"use client";

export function buildWelcomeMessage(): string {
  return [
    `Last login: ${new Date().toLocaleString()}`,
    "Type `help` to list available commands.",
  ].join("\n");
}
