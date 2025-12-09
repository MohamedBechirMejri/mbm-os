"use client";

/**
 * Card pile component - handles different pile types with drop targeting.
 */

import { useDrop } from "react-dnd";
import { cn } from "@/lib/utils";
import {
  Card,
  CARD_HEIGHT,
  CARD_WIDTH,
  STACK_OFFSET_FACEDOWN,
  STACK_OFFSET_FACEUP,
} from "./card";
import {
  DND_ITEM_TYPES,
  type Card as CardType,
  type CardDragItem,
  type PileType,
} from "../types";
import { useSolitaireStore } from "../store";

interface PileProps {
  pileId: string;
  pileType: PileType;
  cards: CardType[];
  /** Click handler for the empty pile or stock */
  onClick?: () => void;
  /** Show placeholder when empty */
  showPlaceholder?: boolean;
  /** Whether cards should be spread (tableau style) */
  spread?: boolean;
  className?: string;
}

export function Pile({
  pileId,
  pileType,
  cards,
  onClick,
  showPlaceholder = true,
  spread = false,
  className,
}: PileProps) {
  const { moveCards, canMoveCards } = useSolitaireStore();

  // Set up drop target for react-dnd
  const [{ isOver, canDrop }, dropRef] = useDrop<
    CardDragItem,
    void,
    { isOver: boolean; canDrop: boolean }
  >(
    () => ({
      accept: DND_ITEM_TYPES.CARD,
      canDrop: item => {
        // Can't drop on itself
        if (item.sourcePileId === pileId) return false;
        return canMoveCards(item.sourcePileId, pileId, item.cardIds);
      },
      drop: item => {
        moveCards(item.sourcePileId, pileId, item.cardIds);
      },
      collect: monitor => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [pileId, moveCards, canMoveCards]
  );

  // Calculate pile height for spread piles
  const calculatePileHeight = () => {
    if (!spread || cards.length === 0) return CARD_HEIGHT;

    let totalOffset = 0;
    for (let i = 0; i < cards.length - 1; i++) {
      totalOffset += cards[i].faceUp
        ? STACK_OFFSET_FACEUP
        : STACK_OFFSET_FACEDOWN;
    }
    return totalOffset + CARD_HEIGHT;
  };

  const pileHeight = calculatePileHeight();

  // Generate drag IDs for each card (includes all cards below it in tableau)
  const getDragCardIds = (cardIndex: number) => {
    if (!spread) {
      // For non-spread piles (foundation, waste), only drag single card
      return [cards[cardIndex].id];
    }
    // For spread piles (tableau), drag this card and all cards below
    return cards.slice(cardIndex).map(c => c.id);
  };

  // Handle double-click to auto-move to foundation
  const handleDoubleClick = (cardIndex: number) => {
    const card = cards[cardIndex];
    if (!card.faceUp) return;

    // Only top card or cards in a valid sequence can move
    if (spread && cardIndex < cards.length - 1) return;

    // Try each foundation
    for (let i = 0; i < 4; i++) {
      const foundationId = `foundation-${i}`;
      if (canMoveCards(pileId, foundationId, [card.id])) {
        moveCards(pileId, foundationId, [card.id]);
        return;
      }
    }
  };

  return (
    <div
      ref={dropRef as unknown as React.RefObject<HTMLDivElement>}
      className={cn("relative", className)}
      style={{
        width: CARD_WIDTH,
        minHeight: pileHeight,
      }}
      onClick={cards.length === 0 ? onClick : undefined}
    >
      {/* Empty pile placeholder */}
      {cards.length === 0 && showPlaceholder && (
        <div
          className={cn(
            "absolute inset-0 rounded-lg border-2 border-dashed",
            "transition-colors duration-150",
            isOver && canDrop
              ? "border-green-400/50 bg-green-400/20 shadow-inner"
              : isOver
              ? "border-red-400/50 bg-red-400/10"
              : "border-black/10 bg-black/20 shadow-inner",
            onClick && "cursor-pointer hover:bg-black/30"
          )}
          style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
        >
          {/* Foundation indicator */}
          {pileType === "foundation" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white/20 text-2xl">A</span>
            </div>
          )}
          {/* Stock refresh indicator */}
          {pileType === "stock" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white/30 text-xl">↻</span>
            </div>
          )}
        </div>
      )}

      {/* Drop zone indicator (empty piles handled above) */}

      {/* Cards */}
      {cards.map((card, index) => {
        const isTopCard = index === cards.length - 1;
        return (
          <Card
            key={card.id}
            card={card}
            pileId={pileId}
            dragCardIds={getDragCardIds(index)}
            stackIndex={index}
            isSpread={spread}
            isTop={isTopCard}
            isDropTarget={isTopCard && isOver}
            canDrop={canDrop}
            onDoubleClick={() => handleDoubleClick(index)}
          />
        );
      })}
    </div>
  );
}

/**
 * Stock pile with click-to-draw functionality
 */
export function StockPile({ cards }: { cards: CardType[] }) {
  const { drawCard } = useSolitaireStore();

  return (
    <div
      className="relative cursor-pointer"
      style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
      onClick={drawCard}
    >
      {cards.length === 0 ? (
        // Empty stock - show refresh icon
        <div className="absolute inset-0 rounded-lg border-2 border-dashed border-white/20 bg-white/5 flex items-center justify-center hover:border-white/40 transition-colors">
          <span className="text-white/40 text-2xl">↻</span>
        </div>
      ) : (
        // Show stacked card backs to indicate remaining cards
        <>
          {cards.length > 2 && (
            <div className="absolute" style={{ top: 2, left: 2 }}>
              <div
                className="w-full h-full rounded-lg bg-blue-800 border border-blue-900/50"
                style={{ width: CARD_WIDTH - 4, height: CARD_HEIGHT - 4 }}
              />
            </div>
          )}
          {cards.length > 1 && (
            <div className="absolute" style={{ top: 1, left: 1 }}>
              <div
                className="w-full h-full rounded-lg bg-blue-700 border border-blue-900/50"
                style={{ width: CARD_WIDTH - 2, height: CARD_HEIGHT - 2 }}
              />
            </div>
          )}
          <div className="absolute">
            <Card
              card={cards[cards.length - 1]}
              pileId="stock"
              dragCardIds={[]}
              isTop
            />
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Waste pile - shows the top drawn card (draggable)
 */
export function WastePile({ cards }: { cards: CardType[] }) {
  if (cards.length === 0) {
    return (
      <div
        className="rounded-xl border-2 border-dashed border-white/10 bg-white/5"
        style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
      />
    );
  }

  // Only show top card - it's draggable
  const topCard = cards[cards.length - 1];

  return (
    <div
      className="relative"
      style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
    >
      {/* Depth indicator if multiple cards */}
      {cards.length > 1 && (
        <div
          className="absolute rounded-xl bg-white/80 border border-black/10"
          style={{
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            top: -2,
            left: 2,
            zIndex: 0,
          }}
        />
      )}
      {cards.length > 2 && (
        <div
          className="absolute rounded-xl bg-white/60 border border-black/10"
          style={{
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            top: -4,
            left: 4,
            zIndex: -1,
          }}
        />
      )}

      {/* Top card - draggable */}
      <div className="absolute" style={{ top: 0, left: 0, zIndex: 1 }}>
        <Pile
          pileId="waste"
          pileType="waste"
          cards={[topCard]}
          showPlaceholder={false}
        />
      </div>
    </div>
  );
}
