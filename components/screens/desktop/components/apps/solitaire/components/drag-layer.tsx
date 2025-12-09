"use client";

/**
 * Custom Drag Layer for Solitaire
 *
 * Renders the card being dragged at the correct scale (matching AutoScaleWrapper).
 * This is needed because the default HTML5 drag ghost captures elements at their
 * pre-transform size, which looks wrong when the game board is scaled.
 */

import * as React from "react";
import { useDragLayer } from "react-dnd";
import { DND_ITEM_TYPES, RANK_LABELS, type Card, type Suit } from "../types";
import { useSolitaireStore } from "../store";

// Card dimensions (must match card.tsx)
const CARD_WIDTH = 80;
const CARD_HEIGHT = 112;
const STACK_OFFSET = 20;

// Scale context - set by AutoScaleWrapper
export const ScaleContext = React.createContext(1);

interface CustomDragLayerProps {
  scale: number;
}

export function CustomDragLayer({ scale }: CustomDragLayerProps) {
  const { itemType, isDragging, item, clientOffset } = useDragLayer(
    monitor => ({
      item: monitor.getItem() as {
        cardIds: string[];
        sourcePileId: string;
      } | null,
      itemType: monitor.getItemType(),
      clientOffset: monitor.getClientOffset(),
      isDragging: monitor.isDragging(),
    })
  );

  const piles = useSolitaireStore(state => state.piles);

  if (
    !isDragging ||
    itemType !== DND_ITEM_TYPES.CARD ||
    !clientOffset ||
    !item
  ) {
    return null;
  }

  // Get the cards being dragged
  const sourcePile = piles[item.sourcePileId];
  if (!sourcePile) return null;

  const draggedCards = sourcePile.cards.filter(c =>
    item.cardIds.includes(c.id)
  );

  if (draggedCards.length === 0) return null;

  // Position centered under cursor, scaled correctly
  const x = clientOffset.x - (CARD_WIDTH * scale) / 2;
  const y = clientOffset.y - 20;

  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 10000 }}
    >
      <div
        style={{
          position: "absolute",
          left: x,
          top: y,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {/* Stack of dragged cards */}
        {draggedCards.map((card, index) => (
          <div
            key={card.id}
            style={{
              position: "absolute",
              top: index * STACK_OFFSET,
              zIndex: index,
            }}
          >
            <CardPreview card={card} />
          </div>
        ))}
      </div>
    </div>
  );
}

// Simplified card preview for drag layer
function CardPreview({ card }: { card: Card }) {
  const isRed = card.suit === "hearts" || card.suit === "diamonds";

  return (
    <div
      className="rounded-xl border border-black/20 shadow-lg bg-white overflow-hidden"
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
      }}
    >
      {/* Corner index */}
      <div className="absolute top-1.5 left-1.5 flex flex-col items-center leading-none">
        <span
          className={`font-bold text-sm font-mono ${
            isRed ? "text-rose-600" : "text-slate-900"
          }`}
        >
          {RANK_LABELS[card.rank]}
        </span>
        <div
          className={`w-2.5 h-2.5 ${
            isRed ? "text-rose-600" : "text-slate-900"
          }`}
        >
          <SuitIcon suit={card.suit} />
        </div>
      </div>
      {/* Bottom corner (rotated) */}
      <div className="absolute bottom-1.5 right-1.5 flex flex-col items-center leading-none rotate-180">
        <span
          className={`font-bold text-sm font-mono ${
            isRed ? "text-rose-600" : "text-slate-900"
          }`}
        >
          {RANK_LABELS[card.rank]}
        </span>
        <div
          className={`w-2.5 h-2.5 ${
            isRed ? "text-rose-600" : "text-slate-900"
          }`}
        >
          <SuitIcon suit={card.suit} />
        </div>
      </div>
    </div>
  );
}

function SuitIcon({ suit }: { suit: Suit }) {
  switch (suit) {
    case "hearts":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      );
    case "diamonds":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M12 2L2 12l10 10 10-10L12 2z" />
        </svg>
      );
    case "clubs":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M12,2.5c-2.5,0-4.5,2-4.5,4.5c0,1.4,0.6,2.6,1.6,3.4c-1.8,0.3-3.1,1.8-3.1,3.6c0,2.1,1.7,3.8,3.8,3.8 c0.6,0,1.2-0.2,1.7-0.5C11.1,19.2,11,21,10,23h4c-1-2-1.1-3.8-1.5-5.7c0.5,0.3,1.1,0.5,1.7,0.5c2.1,0,3.8-1.7,3.8-3.8 c0-1.8-1.4-3.4-3.1-3.6c1-0.8,1.6-2,1.6-3.4C16.5,4.5,14.5,2.5,12,2.5z" />
        </svg>
      );
    case "spades":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M12,2 C9,2 2.5,9 2.5,14 C2.5,17.3 4.5,19.5 7,19.5 C8.5,19.5 9.8,18.7 10.5,17.5 C11.2,18.7 12.5,19.5 14,19.5 C16.5,19.5 18.5,17.3 18.5,14 C18.5,9 12,2 12,2 Z" />
          <path d="M12,17 L12,22" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
  }
}
