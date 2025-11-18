import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Dropzone } from "./components/dropzone";
import { Editor } from "./components/editor";

export function ImageConverterApp({ instanceId }: { instanceId: string }) {
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="h-full w-full relative overflow-hidden bg-black font-sans selection:bg-white/20">
      {/* Ambient Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/20 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/20 blur-[120px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '1s' }} />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 z-0 opacity-20 bg-[url('/assets/grid-pattern.svg')] bg-repeat" />

      <div className="relative z-10 h-full w-full flex flex-col">
        <AnimatePresence mode="wait">
          {!file ? (
            <motion.div
              key="dropzone"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98, filter: "blur(10px)" }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="h-full w-full flex items-center justify-center p-8"
            >
              <div className="max-w-xl w-full aspect-square max-h-[500px]">
                <Dropzone
                  onFileSelect={setFile}
                  label="Open Image"
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="editor"
              initial={{ opacity: 0, scale: 1.05, filter: "blur(20px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="h-full w-full"
            >
              <Editor file={file} onClose={() => setFile(null)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
