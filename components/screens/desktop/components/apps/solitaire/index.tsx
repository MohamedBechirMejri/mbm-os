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

import * as React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { motion, AnimatePresence } from "motion/react";
import { RotateCcw, Undo2, Redo2, Trophy, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSolitaireStore } from "./store";
import { KlondikeLayout } from "./modes/klondike";
import { CustomDragLayer } from "./components/drag-layer";
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
      <div
        className="w-full h-full relative select-none overflow-hidden text-white font-sans"
        style={{
          background:
            "radial-gradient(circle at 50% 30%, #1a5f2a 0%, #0d3512 80%)",
        }}
      >
        {/* Noise overlay for texture */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            filter: "contrast(120%) brightness(100%)",
          }}
        />

        {/* Top Status Area */}
        <div className="absolute top-0 inset-x-0 h-16 pointer-events-none flex justify-between items-start p-4 z-40">
          {/* Left: Window Controls spacer (real controls are in window title bar) */}
          <div className="w-20" />

          {/* Right: Stats Pill */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center gap-4 px-4 py-2 bg-black/20 backdrop-blur-md rounded-full border border-white/10 shadow-lg pointer-events-auto"
          >
            <div className="flex items-center gap-2">
              <span className="text-white/50 text-xs font-bold uppercase tracking-wider">
                Moves
              </span>
              <span className="font-mono font-bold text-lg min-w-[2ch] text-center">
                {gameStats.moves}
              </span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="text-white/50 text-xs font-bold uppercase tracking-wider">
                Time
              </span>
              <TimeDisplay
                startTime={gameStats.startTime}
                endTime={gameStats.endTime}
              />
            </div>
          </motion.div>
        </div>

        {/* Auto-scaling Game Area */}
        <div className="absolute inset-0 top-16 bottom-20 flex items-center justify-center overflow-hidden">
          <AutoScaleWrapper
            renderDragLayer={scale => <CustomDragLayer scale={scale} />}
          >
            {mode === "klondike" && <KlondikeLayout />}
          </AutoScaleWrapper>
        </div>

        {/* Bottom Floating Dock */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center gap-2 p-2 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl ring-1 ring-white/5"
          >
            <div className="px-2 flex gap-1">
              <ModeButton mode="klondike" currentMode={mode} label="Klondike" />
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

            <div className="w-px h-8 bg-white/10 mx-1" />

            <div className="flex gap-1">
              <DockButton
                onClick={undo}
                disabled={!canUndo}
                icon={<Undo2 className="w-5 h-5" />}
                label="Undo"
              />
              <DockButton
                onClick={redo}
                disabled={!canRedo}
                icon={<Redo2 className="w-5 h-5" />}
                label="Redo"
              />
            </div>

            <div className="w-px h-8 bg-white/10 mx-1" />

            <DockButton
              onClick={() => newGame(mode)}
              icon={<RotateCcw className="w-5 h-5" />}
              label="New Game"
              primary
            />
          </motion.div>
        </div>

        {/* Win celebration overlay */}
        <AnimatePresence>
          {isWon && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center bg-black/60 z-50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-linear-to-br from-yellow-400 via-yellow-500 to-amber-600 rounded-3xl p-10 text-center shadow-[0_20px_60px_-10px_rgba(255,190,0,0.5)] border-4 border-yellow-300/50"
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: "spring", damping: 12 }}
              >
                <motion.div
                  initial={{ rotate: 0, scale: 0.5 }}
                  animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <Trophy className="w-20 h-20 text-yellow-900 mx-auto mb-6 drop-shadow-lg" />
                </motion.div>
                <h2 className="text-4xl font-black text-yellow-950 mb-2 tracking-tight">
                  VICTORY!
                </h2>
                <p className="text-yellow-900/80 font-medium mb-8 text-lg">
                  {gameStats.moves} moves •{" "}
                  <TimeDisplay
                    startTime={gameStats.startTime}
                    endTime={gameStats.endTime}
                  />
                </p>
                <Button
                  size="lg"
                  className="bg-yellow-950 hover:bg-yellow-900 text-yellow-100 rounded-xl px-8 h-12 font-bold shadow-lg"
                  onClick={() => newGame(mode)}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
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

// Helper components

function DockButton({
  onClick,
  disabled,
  icon,
  label,
  primary = false,
}: {
  onClick: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
  label: string;
  primary?: boolean;
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={`
        relative w-10 h-10 rounded-xl transition-all duration-200 group
        ${
          primary
            ? "bg-white/10 hover:bg-white/20 text-white"
            : "text-white/60 hover:text-white hover:bg-white/10"
        }
        ${disabled && "opacity-30 cursor-not-allowed hover:bg-transparent"}
      `}
      onClick={onClick}
      disabled={disabled}
    >
      {icon}
      {/* Tooltip */}
      <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur px-2 py-1 rounded text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
        {label}
      </span>
    </Button>
  );
}

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
    <button
      className={`
        px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200
        ${
          isActive
            ? "bg-white text-emerald-900 shadow-sm scale-105"
            : "text-emerald-100/60 hover:text-white hover:bg-white/10"
        }
        ${
          disabled &&
          "opacity-40 cursor-not-allowed hover:bg-transparent hover:text-emerald-100/60"
        }
      `}
      onClick={() => !disabled && newGame(mode)}
      disabled={disabled}
    >
      {label}
    </button>
  );
}

function TimeDisplay({
  startTime,
  endTime,
}: {
  startTime: number;
  endTime?: number;
}) {
  const [now, setNow] = React.useState(Date.now());

  React.useEffect(() => {
    if (endTime) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  const ms = (endTime || now) - startTime;
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <span className="font-mono">
      {minutes}:{secs.toString().padStart(2, "0")}
    </span>
  );
}

/**
 * Auto-scales children to fit the container while preserving aspect ratio.
 * Base design size: 900x650
 */
function AutoScaleWrapper({
  children,
  renderDragLayer,
}: {
  children: React.ReactNode;
  renderDragLayer?: (scale: number) => React.ReactNode;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = React.useState(1);

  // Base dimensions of the game board
  const BASE_WIDTH = 900;
  const BASE_HEIGHT = 650;

  React.useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const { width, height } = containerRef.current.getBoundingClientRect();

      // Calculate scale to fit with some padding
      const scaleX = width / BASE_WIDTH;
      const scaleY = height / BASE_HEIGHT;

      // Use the smaller scale to ensure it fits
      const newScale = Math.min(scaleX, scaleY) * 0.95; // 95% to leave margin
      setScale(Math.max(0.5, newScale)); // Min scale 0.5
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    if (containerRef.current) observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Drag layer rendered outside the scaled container */}
      {renderDragLayer?.(scale)}

      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center"
      >
        <div
          style={{
            width: BASE_WIDTH,
            height: BASE_HEIGHT,
            transform: `scale(${scale})`,
            transformOrigin: "center center",
          }}
          className="relative"
        >
          {children}
        </div>
      </div>
    </>
  );
}
