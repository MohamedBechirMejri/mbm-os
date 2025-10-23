import { useEffect } from "react";
import type { FSFile, FSNode } from "../fs";
import { isFile, isFolder } from "../fs";

interface UseFinderKeyboardProps {
  selected: string | null;
  selectedNode: FSNode | null;
  onOpenFolder: (id: string) => void;
  onGoUp: () => void;
  onDeselect: () => void;
  onQuickLook: (file: FSFile) => void;
}

export function useFinderKeyboard({
  selected,
  selectedNode,
  onOpenFolder,
  onGoUp,
  onDeselect,
  onQuickLook,
}: UseFinderKeyboardProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in search
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;

      // Space: Quick Look
      if (e.key === " " && selected) {
        e.preventDefault();
        const node = selectedNode;
        if (node && isFile(node)) {
          onQuickLook(node as FSFile);
        }
      }

      // Enter: Open folder or file
      if (e.key === "Enter" && selected) {
        const node = selectedNode;
        if (node && isFolder(node)) {
          onOpenFolder(node.id);
        } else if (node && isFile(node)) {
          onQuickLook(node as FSFile);
        }
      }

      // Backspace or Cmd+Up: Go up
      if (e.key === "Backspace" || (e.key === "ArrowUp" && e.metaKey)) {
        e.preventDefault();
        onGoUp();
      }

      // Escape: Deselect
      if (e.key === "Escape") {
        onDeselect();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selected, selectedNode, onOpenFolder, onGoUp, onDeselect, onQuickLook]);
}
