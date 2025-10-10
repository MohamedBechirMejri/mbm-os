"use client";

import { Calendar, File, HardDrive } from "lucide-react";
import Image from "next/image";
import type { FSFile, FSNode } from "../fs";
import { isFile } from "../fs";
import { FileIcon } from "./file-icon";

interface PreviewPanelProps {
  node: FSNode | null;
}

export function PreviewPanel({ node }: PreviewPanelProps) {
  if (!node) {
    return (
      <div className="flex h-full w-80 flex-col items-center justify-center border-l border-white/10 bg-gradient-to-b from-white/5 to-transparent p-6 text-white/40 backdrop-blur-xl">
        <File className="mb-2 size-12 opacity-50" />
        <p className="text-sm">Select an item to preview</p>
      </div>
    );
  }

  const file = isFile(node) ? (node as FSFile) : null;
  const canPreview = file && (file.kind === "image" || file.kind === "video");

  return (
    <div className="flex h-full w-80 flex-col gap-4 border-l border-white/10 bg-gradient-to-b from-white/5 to-transparent p-6 backdrop-blur-xl animate-in fade-in duration-200">
      {/* Preview */}
      <div className="flex flex-col items-center gap-4">
        {canPreview && file ? (
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-white/20 bg-black/30 shadow-2xl shadow-black/50">
            {file.kind === "image" ? (
              <Image
                src={file.path}
                alt={file.name}
                fill
                sizes="320px"
                className="object-cover"
              />
            ) : (
              <video
                src={file.path}
                controls
                className="h-full w-full object-cover"
                aria-label={`Video preview: ${file.name}`}
              >
                <track kind="captions" label="No captions available" />
              </video>
            )}
          </div>
        ) : (
          <div className="flex aspect-square w-full items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 shadow-xl">
            <FileIcon node={node} size={96} />
          </div>
        )}
        <div className="w-full text-center">
          <h3 className="truncate text-sm font-medium text-white/90">
            {node.name}
          </h3>
          {file && (
            <p className="mt-1 text-xs text-white/50 capitalize">{file.kind}</p>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-xs">
        <div className="flex items-center gap-3">
          <File className="size-4 text-white/40" />
          <div className="flex-1">
            <div className="text-white/50">Kind</div>
            <div className="text-white/80 capitalize">
              {node.type === "folder" ? "Folder" : (node as FSFile).kind}
            </div>
          </div>
        </div>

        {file?.size && (
          <div className="flex items-center gap-3">
            <HardDrive className="size-4 text-white/40" />
            <div className="flex-1">
              <div className="text-white/50">Size</div>
              <div className="text-white/80">{formatBytes(file.size)}</div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <Calendar className="size-4 text-white/40" />
          <div className="flex-1">
            <div className="text-white/50">Modified</div>
            <div className="text-white/80">Today at 12:00 PM</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round((bytes / k ** i) * 100) / 100} ${sizes[i]}`;
}
