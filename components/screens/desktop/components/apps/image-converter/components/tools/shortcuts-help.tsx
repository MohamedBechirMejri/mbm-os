import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SHORTCUTS, type ShortcutConfig } from "../../hooks/use-keyboard-shortcuts";

interface ShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShortcutsHelp({ isOpen, onClose }: ShortcutsHelpProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const shortcuts = Object.entries(SHORTCUTS);
  const filteredShortcuts = searchQuery
    ? shortcuts.filter(
        ([, config]: [string, ShortcutConfig]) =>
          config.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          config.key.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : shortcuts;

  const formatKey = (config: ShortcutConfig) => {
    const keys: string[] = [];
    const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;

    if (config.modifiers?.ctrl) keys.push(isMac ? "⌘" : "Ctrl");
    if (config.modifiers?.shift) keys.push("⇧");
    if (config.modifiers?.alt) keys.push(isMac ? "⌥" : "Alt");
    keys.push(config.key.toUpperCase());

    return keys.join(" + ");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl z-[101]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
              <div>
                <h2 className="text-xl font-semibold text-white">Keyboard Shortcuts</h2>
                <p className="text-sm text-white/50 mt-1">Master the image editor with these shortcuts</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 rounded-full hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Search */}
            <div className="p-6 border-b border-white/10">
              <input
                type="text"
                placeholder="Search shortcuts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>

            {/* Shortcuts List */}
            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="grid gap-3">
                {filteredShortcuts.map(([name, config]: [string, ShortcutConfig]) => (
                  <div
                    key={name}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <span className="text-sm text-white/90">{config.description}</span>
                    <kbd className="flex items-center gap-1 px-3 py-1.5 bg-black/40 border border-white/20 rounded-md text-xs font-mono text-white/90">
                      {formatKey(config)}
                    </kbd>
                  </div>
                ))}
              </div>

              {filteredShortcuts.length === 0 && (
                <div className="text-center py-8 text-white/40">
                  No shortcuts found matching "{searchQuery}"
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 bg-white/5 rounded-b-2xl">
              <p className="text-xs text-white/40 text-center">
                Press <kbd className="px-2 py-0.5 bg-black/40 border border-white/20 rounded text-white/90">?</kbd> anytime to toggle this help
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
