import { useState } from "react";
import { motion } from "motion/react";
import { Upload, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropzoneProps {
  onFileSelect: (file: File) => void;
  accept?: Record<string, string[]>;
  label?: string;
}

export function Dropzone({ onFileSelect, accept, label = "Drop image here" }: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileSelect(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

  return (
    <motion.div
      className={cn(
        "group relative flex h-full min-h-[300px] w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-300",
        isDragging
          ? "border-blue-500/50 bg-blue-500/10"
          : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => document.getElementById("file-upload")?.click()}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <input
        id="file-upload"
        type="file"
        className="hidden"
        accept={accept ? Object.values(accept).flat().join(",") : "image/*"}
        onChange={handleChange}
      />

      <div className="relative flex flex-col items-center gap-6 p-8 text-center">
        <div className={cn(
          "relative flex h-20 w-20 items-center justify-center rounded-full transition-all duration-300",
          isDragging ? "bg-blue-500 text-white" : "bg-white/5 text-white/40 group-hover:bg-white/10 group-hover:text-white"
        )}>
          <Upload className="h-10 w-10" />
          {/* Pulse effect when dragging */}
          {isDragging && (
            <motion.div
              layoutId="pulse"
              className="absolute inset-0 rounded-full border-2 border-blue-500"
              initial={{ scale: 1, opacity: 1 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-medium text-white/90">{label}</h3>
          <p className="text-sm text-white/50">
            Supports JPG, PNG, SVG, WEBP
          </p>
        </div>
      </div>
    </motion.div>
  );
}
