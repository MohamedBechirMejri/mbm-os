"use client";

/**
 * Solitaire - Classic card games for mbm-os
 *
 * Features:
 * - Klondike (classic solitaire) - IMPLEMENTED
 * - Spider solitaire - TODO
 * - FreeCell - TODO
 *
 * Built with react-dnd for drag-and-drop and Zustand for state management.
 */

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { motion, AnimatePresence } from "motion/react";
import { RotateCcw, Undo2, Redo2, Trophy, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSolitaireStore } from "./store";
import { KlondikeLayout } from "./modes/klondike";
import type { GameMode } from "./types";

interface SolitaireAppProps {
  instanceId: string;
}

export function SolitaireApp({ instanceId }: SolitaireAppProps) {
  const { mode, newGame, undo, redo, history, historyIndex, isWon, gameStats } =
    useSolitaireStore();

  const canUndo = historyIndex >= 0;
  const canRedo = historyIndex < history.length - 1;

  // Format time for display
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="w-full h-full flex flex-col bg-[#1a5f2a] select-none overflow-hidden">
        {/* Menu bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-black/20 border-b border-white/10">
          <div className="flex items-center gap-2">
            {/* Game mode selector */}
            <div className="flex gap-1">
              <ModeButton mode="klondike" currentMode={mode} label="Klondike" />
              {/* TODO: Enable when implemented */}
              <ModeButton
                mode="spider"
                currentMode={mode}
                label="Spider"
                disabled
              />
              <ModeButton
                mode="freecell"
                currentMode={mode}
                label="FreeCell"
                disabled
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Stats display */}
            <div className="text-white/70 text-sm font-mono mr-4">
              Moves: {gameStats.moves}
            </div>

            {/* Undo */}
            <Button
              variant="ghost"
              size="sm"
              className="text-white/80 hover:text-white hover:bg-white/10 h-8 px-2"
              onClick={undo}
              disabled={!canUndo}
            >
              <Undo2 className="w-4 h-4" />
            </Button>

            {/* Redo */}
            <Button
              variant="ghost"
              size="sm"
              className="text-white/80 hover:text-white hover:bg-white/10 h-8 px-2"
              onClick={redo}
              disabled={!canRedo}
            >
              <Redo2 className="w-4 h-4" />
            </Button>

            {/* New game */}
            <Button
              variant="ghost"
              size="sm"
              className="text-white/80 hover:text-white hover:bg-white/10 h-8 gap-1.5"
              onClick={() => newGame(mode)}
            >
              <RotateCcw className="w-4 h-4" />
              <span className="text-sm">New Game</span>
            </Button>
          </div>
        </div>

        {/* Game area */}
        <div className="flex-1 overflow-auto">
          {mode === "klondike" && <KlondikeLayout />}
          {/* TODO: Add Spider and FreeCell layouts
          {mode === "spider" && <SpiderLayout />}
          {mode === "freecell" && <FreeCellLayout />}
          */}
        </div>

        {/* Win celebration overlay */}
        <AnimatePresence>
          {isWon && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center bg-black/60 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-linear-to-br from-yellow-400 via-yellow-500 to-amber-600 rounded-2xl p-8 text-center shadow-2xl"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 15 }}
              >
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <Trophy className="w-16 h-16 text-yellow-900 mx-auto mb-4" />
                </motion.div>
                <h2 className="text-3xl font-bold text-yellow-900 mb-2">
                  You Win!
                </h2>
                <p className="text-yellow-800 mb-4">
                  Completed in {gameStats.moves} moves
                  {gameStats.endTime &&
                    ` • ${formatTime(gameStats.endTime - gameStats.startTime)}`}
                </p>
                <Button
                  className="bg-yellow-900 hover:bg-yellow-950 text-yellow-100"
                  onClick={() => newGame(mode)}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Play Again
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DndProvider>
  );
}

/**
 * Game mode selector button
 */
function ModeButton({
  mode,
  currentMode,
  label,
  disabled = false,
}: {
  mode: GameMode;
  currentMode: GameMode;
  label: string;
  disabled?: boolean;
}) {
  const { newGame } = useSolitaireStore();
  const isActive = mode === currentMode;

  return (
    <Button
      variant="ghost"
      size="sm"
      className={`
        h-7 px-3 text-xs font-medium transition-colors
        ${
          isActive
            ? "bg-white/20 text-white"
            : "text-white/60 hover:text-white hover:bg-white/10"
        }
        ${disabled && "opacity-40 cursor-not-allowed"}
      `}
      onClick={() => !disabled && newGame(mode)}
      disabled={disabled}
    >
      {label}
      {disabled && <span className="ml-1 text-[10px] opacity-60">(soon)</span>}
    </Button>
  );
}
