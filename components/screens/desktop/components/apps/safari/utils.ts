import { START_PAGE, type TabMode } from "./types";

const READER_PROXY_BASE = "https://r.jina.ai/http";

export function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return START_PAGE;
  try {
    const u = new URL(trimmed);
    return u.toString();
  } catch {
    const hasSpace = /\s/.test(trimmed);
    const hasDot = trimmed.includes(".");
    if (!hasSpace && hasDot) return `https://${trimmed}`;
    const q = encodeURIComponent(trimmed);
    return `https://google.com/?q=${q}`;
  }
}

export function faviconFromUrl(url: string): string | null {
  try {
    const { hostname } = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
  } catch {
    return null;
  }
}

export function frameUrlFor(url: string, mode: TabMode): string {
  if (mode === "reader") return readerProxyUrl(url);
  return url;
}

export function readerProxyUrl(url: string): string {
  const normalized = normalizeUrl(url);
  return `${READER_PROXY_BASE}/${normalized}`;
}
