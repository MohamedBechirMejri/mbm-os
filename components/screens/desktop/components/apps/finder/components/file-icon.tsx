"use client";

import { FileText, Folder, Music, Video } from "lucide-react";
import Image from "next/image";
import type { FSFile, FSNode } from "../fs";

interface FileIconProps {
  node: FSNode;
  size?: number;
}

export function FileIcon({ node, size = 32 }: FileIconProps) {
  const iconSize = size * 0.6;

  if (node.type === "folder") {
    return (
      <div
        className="flex items-center justify-center rounded-lg"
        style={{ width: size, height: size }}
      >
        <Folder
          className="text-blue-400"
          style={{ width: iconSize, height: iconSize }}
        />
      </div>
    );
  }

  const file = node as FSFile;

  // If it's an image, show thumbnail
  if (file.kind === "image") {
    return (
      <div
        className="relative overflow-hidden rounded-lg border border-white/10 bg-black/20"
        style={{ width: size, height: size }}
      >
        <Image
          src={file.path}
          alt={file.name}
          fill
          sizes={`${size}px`}
          className="object-cover"
        />
      </div>
    );
  }

  // Otherwise use kind-based icons
  const Icon = {
    video: Video,
    audio: Music,
    text: FileText,
    pdf: FileText,
    other: FileText,
  }[file.kind];

  const iconColor = {
    video: "text-purple-400",
    audio: "text-pink-400",
    text: "text-gray-400",
    pdf: "text-red-400",
    other: "text-gray-400",
  }[file.kind];

  return (
    <div
      className="flex items-center justify-center rounded-lg bg-white/5"
      style={{ width: size, height: size }}
    >
      <Icon
        className={iconColor}
        style={{ width: iconSize, height: iconSize }}
      />
    </div>
  );
}
