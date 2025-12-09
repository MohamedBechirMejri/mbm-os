"use client";

/**
 * Modern Playing Card Component
 *
 * Design: Minimalist, Geometric, High-DPI
 * Tech: SVG Assets, Framer Motion, Tailwind V4
 */

import * as React from "react";
import { useDrag } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import { cn } from "@/lib/utils";
import {
  DND_ITEM_TYPES,
  RANK_LABELS,
  type Card as CardType,
  type CardDragItem,
  type Suit,
  type Rank,
} from "../types";

interface CardProps {
  card: CardType;
  pileId: string;
  dragCardIds: string[];
  onClick?: () => void;
  onDoubleClick?: () => void;
  stackIndex?: number;
  yOffset?: number;
  isTop?: boolean;
  isDropTarget?: boolean;
  canDrop?: boolean;
  className?: string;
}

// Dimensions
const CARD_WIDTH = 80;
const CARD_HEIGHT = 112;
const STACK_OFFSET_FACEDOWN = 6; // Slightly increased for better stack visibility
const STACK_OFFSET_FACEUP = 22;

export function Card({
  card,
  pileId,
  dragCardIds,
  onClick,
  onDoubleClick,
  stackIndex = 0,
  yOffset = 0,
  isTop = false,
  isDropTarget = false,
  canDrop = false,
  className,
}: CardProps) {
  const [{ isDragging }, dragRef, previewRef] = useDrag(
    () => ({
      type: DND_ITEM_TYPES.CARD,
      item: {
        type: DND_ITEM_TYPES.CARD,
        cardIds: dragCardIds,
        sourcePileId: pileId,
      },
      canDrag: () => card.faceUp,
      collect: monitor => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [card.faceUp, dragCardIds, pileId]
  );

  // Hide the default browser drag ghost (it shows at wrong scale due to AutoScaleWrapper)
  React.useEffect(() => {
    previewRef(getEmptyImage(), { captureDraggingState: true });
  }, [previewRef]);

  return (
    <div
      ref={dragRef as unknown as React.RefObject<HTMLDivElement>}
      className="absolute"
      style={{
        top: yOffset,
        zIndex: stackIndex,
      }}
    >
      <div
        className={cn(
          "relative select-none",
          isDragging ? "opacity-30" : "opacity-100",
          card.faceUp ? "cursor-grab active:cursor-grabbing" : "cursor-default",
          className
        )}
        style={{
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
        }}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
      >
        <div
          className={cn(
            "w-full h-full rounded-xl overflow-hidden",
            "border border-black/20 shadow-sm",
            card.faceUp ? "bg-white" : "bg-[#1E293B]",
            // Drop target visual feedback
            isDropTarget && canDrop && "ring-2 ring-emerald-400",
            isDropTarget && !canDrop && "ring-2 ring-red-400"
          )}
        >
          {card.faceUp ? <CardFace card={card} /> : <CardBack />}

          {/* Lighting overlay -- subtle */}
          <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-black/5 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Card Face
// -----------------------------------------------------------------------------

function CardFace({ card }: { card: CardType }) {
  const isRed = card.suit === "hearts" || card.suit === "diamonds";
  const colorClass = isRed ? "text-[#E11D48]" : "text-[#0F172A]"; // Rose-600 vs Slate-900

  return (
    <div
      className={cn(
        "w-full h-full flex flex-col relative bg-white",
        colorClass
      )}
    >
      {/* Top Left Index */}
      <CornerIndex rank={card.rank} suit={card.suit} />

      {/* Center Art */}
      <div className="flex-1 flex items-center justify-center p-2">
        <CenterArt rank={card.rank} suit={card.suit} />
      </div>

      {/* Bottom Right Index (Rotated) */}
      <CornerIndex rank={card.rank} suit={card.suit} rotated />
    </div>
  );
}

function CornerIndex({
  rank,
  suit,
  rotated = false,
}: {
  rank: Rank;
  suit: Suit;
  rotated?: boolean;
}) {
  const label = RANK_LABELS[rank];
  return (
    <div
      className={cn(
        "absolute flex flex-col items-center gap-0.5 p-1.5 leading-none",
        rotated ? "bottom-0 right-0 rotate-180" : "top-0 left-0"
      )}
    >
      <span className="font-bold text-sm tracking-tighter font-mono">
        {label}
      </span>
      <div className="w-2.5 h-2.5">
        <SuitIcon suit={suit} />
      </div>
    </div>
  );
}

function CenterArt({ rank, suit }: { rank: Rank; suit: Suit }) {
  // Face Cards (J, Q, K)
  if (rank >= 11) {
    const label = RANK_LABELS[rank];
    return (
      <div className="w-full h-full flex items-center justify-center relative overflow-hidden rounded-lg bg-current/5">
        <span className="text-6xl font-black opacity-30">{label}</span>
        <div className="absolute inset-0 flex items-center justify-center opacity-15 scale-150">
          <SuitIcon suit={suit} />
        </div>
      </div>
    );
  }

  // Aces - single large pip
  if (rank === 1) {
    return (
      <div className="w-14 h-14">
        <SuitIcon suit={suit} />
      </div>
    );
  }

  // Number cards (2-10) - proper pip layouts
  return <PipLayout rank={rank} suit={suit} />;
}

/**
 * Traditional pip layouts for playing cards 2-10.
 * Positions are relative to a 100x100 grid, scaled to the card center area.
 */
const PIP_POSITIONS: Record<
  number,
  Array<{ x: number; y: number; flip?: boolean }>
> = {
  2: [
    { x: 50, y: 18 },
    { x: 50, y: 82, flip: true },
  ],
  3: [
    { x: 50, y: 18 },
    { x: 50, y: 50 },
    { x: 50, y: 82, flip: true },
  ],
  4: [
    { x: 30, y: 18 },
    { x: 70, y: 18 },
    { x: 30, y: 82, flip: true },
    { x: 70, y: 82, flip: true },
  ],
  5: [
    { x: 30, y: 18 },
    { x: 70, y: 18 },
    { x: 50, y: 50 },
    { x: 30, y: 82, flip: true },
    { x: 70, y: 82, flip: true },
  ],
  6: [
    { x: 30, y: 18 },
    { x: 70, y: 18 },
    { x: 30, y: 50 },
    { x: 70, y: 50 },
    { x: 30, y: 82, flip: true },
    { x: 70, y: 82, flip: true },
  ],
  7: [
    { x: 30, y: 18 },
    { x: 70, y: 18 },
    { x: 50, y: 34 },
    { x: 30, y: 50 },
    { x: 70, y: 50 },
    { x: 30, y: 82, flip: true },
    { x: 70, y: 82, flip: true },
  ],
  8: [
    { x: 30, y: 18 },
    { x: 70, y: 18 },
    { x: 50, y: 34 },
    { x: 30, y: 50 },
    { x: 70, y: 50 },
    { x: 50, y: 66, flip: true },
    { x: 30, y: 82, flip: true },
    { x: 70, y: 82, flip: true },
  ],
  9: [
    { x: 30, y: 15 },
    { x: 70, y: 15 },
    { x: 30, y: 38 },
    { x: 70, y: 38 },
    { x: 50, y: 50 },
    { x: 30, y: 62, flip: true },
    { x: 70, y: 62, flip: true },
    { x: 30, y: 85, flip: true },
    { x: 70, y: 85, flip: true },
  ],
  10: [
    { x: 30, y: 15 },
    { x: 70, y: 15 },
    { x: 50, y: 28 },
    { x: 30, y: 38 },
    { x: 70, y: 38 },
    { x: 30, y: 62, flip: true },
    { x: 70, y: 62, flip: true },
    { x: 50, y: 72, flip: true },
    { x: 30, y: 85, flip: true },
    { x: 70, y: 85, flip: true },
  ],
};

function PipLayout({ rank, suit }: { rank: Rank; suit: Suit }) {
  const positions = PIP_POSITIONS[rank] || [];

  return (
    <div className="relative w-full h-full">
      {positions.map((pos, index) => (
        <div
          key={index}
          className="absolute w-3.5 h-3.5"
          style={{
            left: `${pos.x}%`,
            top: `${pos.y}%`,
            transform: `translate(-50%, -50%) ${
              pos.flip ? "rotate(180deg)" : ""
            }`,
          }}
        >
          <SuitIcon suit={suit} />
        </div>
      ))}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Card Back
// -----------------------------------------------------------------------------

function CardBack() {
  return (
    <div className="w-full h-full bg-[#1b2538] relative overflow-hidden flex items-center justify-center group">
      {/* Pattern */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle, #3b82f6 1px, transparent 1px)`,
          backgroundSize: "12px 12px",
        }}
      />
      {/* Central Logo */}
      <div className="w-12 h-12 rounded-full border-2 border-blue-500/30 flex items-center justify-center bg-[#0f172a] shadow-lg">
        <div className="w-6 h-6 text-blue-500/50">
          <SuitIcon suit="spades" />
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Assets (SVGs)
// -----------------------------------------------------------------------------

function SuitIcon({ suit }: { suit: Suit }) {
  switch (suit) {
    case "spades":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M12,2 C9,2 2.5,9 2.5,14 C2.5,17.3 4.5,19.5 7,19.5 C8.5,19.5 9.8,18.7 10.5,17.5 C11.2,18.7 12.5,19.5 14,19.5 C16.5,19.5 18.5,17.3 18.5,14 C18.5,9 12,2 12,2 Z M12,14 C11,15 11,17 11,17 H13 C13,17 13,15 12,14 Z M11.5,17 L12.5,17 L12.5,21.5 Q12.5,22 13,22 H11 Q11.5,22 11.5,21.5 Z" />
          <path
            d="M12,17 L12,22"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    case "hearts":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      );
    case "clubs":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M12,2.5c-2.5,0-4.5,2-4.5,4.5c0,1.4,0.6,2.6,1.6,3.4c-1.8,0.3-3.1,1.8-3.1,3.6c0,2.1,1.7,3.8,3.8,3.8 c0.6,0,1.2-0.2,1.7-0.5C11.1,19.2,11,21,10,23h4c-1-2-1.1-3.8-1.5-5.7c0.5,0.3,1.1,0.5,1.7,0.5c2.1,0,3.8-1.7,3.8-3.8 c0-1.8-1.4-3.4-3.1-3.6c1-0.8,1.6-2,1.6-3.4C16.5,4.5,14.5,2.5,12,2.5z" />
        </svg>
      );
    case "diamonds":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M12 2L2 12l10 10 10-10L12 2z" />
        </svg>
      );
  }
}

export { CARD_WIDTH, CARD_HEIGHT, STACK_OFFSET_FACEDOWN, STACK_OFFSET_FACEUP };
