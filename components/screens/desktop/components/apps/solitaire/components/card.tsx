"use client";

/**
 * Playing card component with Windows-inspired design.
 * Handles rendering, drag source, and click events.
 */

import { useDrag } from "react-dnd";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  DND_ITEM_TYPES,
  RANK_LABELS,
  SUIT_SYMBOLS,
  type Card as CardType,
  type CardDragItem,
  type CardId,
} from "../types";

interface CardProps {
  card: CardType;
  pileId: string;
  /** Cards that will be dragged along with this one (for tableau stacks) */
  dragCardIds: CardId[];
  onClick?: () => void;
  onDoubleClick?: () => void;
  /** Index in stack for offset calculation */
  stackIndex?: number;
  /** Whether this card is in a spread pile (like tableau) */
  isSpread?: boolean;
  /** Whether this is the top card of the pile */
  isTop?: boolean;
  className?: string;
}

// Card dimensions matching Windows Solitaire feel
const CARD_WIDTH = 72;
const CARD_HEIGHT = 100;
const STACK_OFFSET_FACEDOWN = 4;
const STACK_OFFSET_FACEUP = 20;

export function Card({
  card,
  pileId,
  dragCardIds,
  onClick,
  onDoubleClick,
  stackIndex = 0,
  isSpread = false,
  isTop = false,
  className,
}: CardProps) {
  // Set up drag source for react-dnd
  const [{ isDragging }, dragRef] = useDrag<
    CardDragItem,
    unknown,
    { isDragging: boolean }
  >(
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

  // Calculate vertical offset for stacked cards
  const yOffset = isSpread
    ? stackIndex * (card.faceUp ? STACK_OFFSET_FACEUP : STACK_OFFSET_FACEDOWN)
    : 0;

  return (
    <div
      ref={dragRef as unknown as React.RefObject<HTMLDivElement>}
      className="absolute"
      style={{ top: yOffset, zIndex: stackIndex }}
    >
      <motion.div
        className={cn(
          "cursor-pointer select-none",
          isDragging && "opacity-50",
          className
        )}
        style={{
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
        }}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        initial={false}
        animate={{ opacity: isDragging ? 0.5 : 1 }}
        whileHover={card.faceUp ? { scale: 1.02, y: -2 } : undefined}
        transition={{ duration: 0.1 }}
      >
        {card.faceUp ? <CardFace card={card} /> : <CardBack />}
      </motion.div>
    </div>
  );
}

/**
 * Face-up card rendering with suit and rank
 */
function CardFace({ card }: { card: CardType }) {
  const symbol = SUIT_SYMBOLS[card.suit];
  const label = RANK_LABELS[card.rank];
  const colorClass = card.color === "red" ? "text-red-600" : "text-gray-900";

  return (
    <div
      className={cn(
        "w-full h-full rounded-lg bg-white border border-gray-300 shadow-md",
        "flex flex-col p-1.5 overflow-hidden",
        colorClass
      )}
    >
      {/* Top-left corner */}
      <div className="flex flex-col items-center leading-none text-sm font-bold">
        <span>{label}</span>
        <span className="text-base -mt-0.5">{symbol}</span>
      </div>

      {/* Center suit symbol */}
      <div className="flex-1 flex items-center justify-center">
        <span className="text-3xl">{symbol}</span>
      </div>

      {/* Bottom-right corner (rotated) */}
      <div className="flex flex-col items-center leading-none text-sm font-bold rotate-180">
        <span>{label}</span>
        <span className="text-base -mt-0.5">{symbol}</span>
      </div>
    </div>
  );
}

/**
 * Card back design - Windows-inspired blue pattern
 */
function CardBack() {
  return (
    <div
      className={cn(
        "w-full h-full rounded-lg border-2 border-blue-900/50 shadow-md",
        "bg-linear-to-br from-blue-700 via-blue-600 to-blue-800",
        "overflow-hidden"
      )}
    >
      {/* Decorative pattern */}
      <div className="w-full h-full relative">
        {/* Diamond pattern overlay */}
        <div
          className="absolute inset-2 rounded border-2 border-blue-400/30"
          style={{
            backgroundImage: `
              linear-gradient(45deg, rgba(255,255,255,0.05) 25%, transparent 25%),
              linear-gradient(-45deg, rgba(255,255,255,0.05) 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.05) 75%),
              linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.05) 75%)
            `,
            backgroundSize: "10px 10px",
            backgroundPosition: "0 0, 0 5px, 5px -5px, -5px 0px",
          }}
        />
        {/* Center emblem */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-blue-400/20 border border-blue-300/30 flex items-center justify-center">
            <span className="text-blue-200/50 text-lg">♠</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export dimensions for layout calculations
export { CARD_WIDTH, CARD_HEIGHT, STACK_OFFSET_FACEDOWN, STACK_OFFSET_FACEUP };
