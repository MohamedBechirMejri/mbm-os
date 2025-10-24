"use client";

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
      <div className="flex h-full w-67 flex-col border-l border-white/8 bg-[#1a1a1a]" />
    );
  }

  const file = isFile(node) ? (node as FSFile) : null;
  const canPreview = file && (file.kind === "image" || file.kind === "video");
  const defaultKindLabel =
    node.type === "folder"
      ? "Folder"
      : ({
          image: "Image",
          video: "Video",
          audio: "Audio",
          text: "Plain Text",
          pdf: "PDF Document",
          other: "Application",
        }[file?.kind ?? "other"] ?? "File");
  const kindLabel = node.kindLabel ?? defaultKindLabel;
  const sizeLabel = node.sizeLabel
    ? node.sizeLabel
    : file?.size
      ? formatBytes(file.size)
      : "--";
  const modifiedLabel = node.modified ?? "--";

  return (
    <div className="flex h-full w-67 flex-col border-l border-white/8 bg-[#1a1a1a]">
      {/* Preview Area */}
      <div className="flex h-[220px] items-center justify-center bg-[#0d0d0d] border-b border-white/8">
        {canPreview && file ? (
          <div className="relative h-[180px] w-[180px]">
            {file.kind === "image" ? (
              <Image
                src={file.path}
                alt={file.name}
                fill
                sizes="180px"
                className="object-contain"
              />
            ) : (
              <video
                src={file.path}
                className="h-full w-full object-contain"
                aria-label={`Video preview: ${file.name}`}
              >
                <track kind="captions" label="No captions available" />
              </video>
            )}
          </div>
        ) : (
          <FileIcon node={node} size={120} />
        )}
      </div>

      {/* Info Section */}
      <div className="flex flex-col gap-3 px-4 py-5">
        {/* File name with icon */}
        <div className="flex items-start gap-2.5">
          <FileIcon node={node} size={32} />
          <div className="flex-1 min-w-0">
            <h3 className="text-[0.8125rem] leading-tight font-medium text-white/90 wrap-break-word">
              {node.name}
            </h3>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/6 -mx-4" />

        {/* Info rows */}
        <div className="flex flex-col gap-2.5 text-[0.6875rem]">
          <div className="flex justify-between items-baseline">
            <span className="text-white/50">Kind:</span>
            <span className="text-white/80 text-right">{kindLabel}</span>
          </div>

          <div className="flex justify-between items-baseline">
            <span className="text-white/50">Size:</span>
            <span className="text-white/80">{sizeLabel}</span>
          </div>

          <div className="flex justify-between items-baseline">
            <span className="text-white/50">Modified:</span>
            <span className="text-white/80">{modifiedLabel}</span>
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
