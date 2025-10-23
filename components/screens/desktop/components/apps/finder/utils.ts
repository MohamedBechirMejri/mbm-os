import type { FSFile, FSNode } from "./fs";
import { isFile, isFolder } from "./fs";

export function getSizeLabel(node: FSNode): string {
  if (node.sizeLabel) return node.sizeLabel;
  if (isFile(node) && node.size) {
    return formatBytes(node.size);
  }
  return "";
}

export function getKindLabel(node: FSNode): string {
  if (node.kindLabel) return node.kindLabel;
  if (isFolder(node)) return "Folder";

  if (!isFile(node)) return "File";

  const labels: Record<FSFile["kind"], string> = {
    image: "Image",
    video: "Video",
    audio: "Audio",
    text: "Plain Text",
    pdf: "PDF Document",
    other: "Application",
  };

  return labels[node.kind] ?? "File";
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = bytes / k ** i;
  return `${Math.round(size * 100) / 100} ${sizes[i]}`;
}

export const LIST_GRID_TEMPLATE =
  "grid grid-cols-[minmax(220px,1.6fr)_minmax(170px,1fr)_minmax(120px,0.8fr)_minmax(140px,0.9fr)]";
export const LIST_ROW_CLASSES = `${LIST_GRID_TEMPLATE} items-center gap-3 px-4 py-2`;
