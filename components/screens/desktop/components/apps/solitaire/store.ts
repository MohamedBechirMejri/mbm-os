/**
 * Solitaire game state management with Zustand.
 * Handles Klondike game logic with extensible design for Spider/FreeCell.
 */

import { create } from "zustand";
import type {
  Card,
  CardId,
  GameMode,
  GameStats,
  Move,
  Pile,
  PileType,
} from "./types";
import {
  createShuffledDeck,
  flipUp,
  canStackInTableau,
  canStackOnFoundation,
} from "./deck";

// ============================================================================
// State Interface
// ============================================================================

interface SolitaireState {
  // Game configuration
  mode: GameMode;

  // All piles indexed by ID for quick lookup
  piles: Record<string, Pile>;

  // Move history for undo/redo
  history: Move[];
  historyIndex: number;

  // Game status
  gameStats: GameStats;
  isWon: boolean;

  // Actions
  newGame: (mode?: GameMode) => void;
  moveCards: (
    fromPileId: string,
    toPileId: string,
    cardIds: CardId[]
  ) => boolean;
  drawCard: () => void;
  autoComplete: () => void;
  undo: () => void;
  redo: () => void;
  canMoveCards: (
    fromPileId: string,
    toPileId: string,
    cardIds: CardId[]
  ) => boolean;
  getCard: (cardId: CardId) => Card | undefined;
  getPileByType: (type: PileType) => Pile[];
}

// ============================================================================
// Klondike Setup
// ============================================================================

const createKlondikeLayout = (): Record<string, Pile> => {
  const deck = createShuffledDeck();
  const piles: Record<string, Pile> = {};
  let cardIndex = 0;

  // Create 7 tableau piles with increasing cards (1, 2, 3, 4, 5, 6, 7)
  for (let i = 0; i < 7; i++) {
    const tableauCards: Card[] = [];
    for (let j = 0; j <= i; j++) {
      const card = deck[cardIndex++];
      // Last card in each tableau pile is face up
      tableauCards.push(j === i ? flipUp(card) : card);
    }
    piles[`tableau-${i}`] = {
      id: `tableau-${i}`,
      type: "tableau",
      cards: tableauCards,
    };
  }

  // Create 4 foundation piles (empty to start)
  for (let i = 0; i < 4; i++) {
    piles[`foundation-${i}`] = {
      id: `foundation-${i}`,
      type: "foundation",
      cards: [],
    };
  }

  // Remaining cards go to stock (24 cards)
  piles.stock = {
    id: "stock",
    type: "stock",
    cards: deck.slice(cardIndex),
  };

  // Waste pile starts empty
  piles.waste = {
    id: "waste",
    type: "waste",
    cards: [],
  };

  return piles;
};

// ============================================================================
// TODO: Spider Setup (for future implementation)
// ============================================================================
// const createSpiderLayout = (difficulty: SpiderDifficulty): Record<string, Pile> => {
//   // Spider uses 2 decks (104 cards)
//   // 10 tableau piles: first 4 have 6 cards, last 6 have 5 cards
//   // 50 cards remain in stock
//   // Only top card of each pile is face up
//   throw new Error("Spider mode not implemented yet");
// };

// ============================================================================
// TODO: FreeCell Setup (for future implementation)
// ============================================================================
// const createFreeCellLayout = (): Record<string, Pile> => {
//   // Single deck, all cards face up
//   // 8 tableau piles with alternating 7 and 6 cards
//   // 4 free cells and 4 foundations (empty)
//   throw new Error("FreeCell mode not implemented yet");
// };

// ============================================================================
// Move Validation
// ============================================================================

const validateKlondikeMove = (
  piles: Record<string, Pile>,
  fromPile: Pile,
  toPile: Pile,
  movingCards: Card[]
): boolean => {
  const firstCard = movingCards[0];
  if (!firstCard) return false;

  // Check target pile type
  switch (toPile.type) {
    case "foundation": {
      // Only single cards go to foundation
      if (movingCards.length !== 1) return false;
      const topCard = toPile.cards[toPile.cards.length - 1];
      return canStackOnFoundation(firstCard, topCard, topCard?.suit);
    }
    case "tableau": {
      const topCard = toPile.cards[toPile.cards.length - 1];
      // If tableau is empty, only Kings can go there
      if (!topCard) {
        return firstCard.rank === 13;
      }
      return canStackInTableau(firstCard, topCard);
    }
    default:
      return false;
  }
};

// ============================================================================
// Win Detection
// ============================================================================

const checkWin = (piles: Record<string, Pile>): boolean => {
  // Win when all 4 foundations have 13 cards each (52 total)
  const foundationPiles = Object.values(piles).filter(
    p => p.type === "foundation"
  );
  return foundationPiles.every(pile => pile.cards.length === 13);
};

// ============================================================================
// Store
// ============================================================================

export const useSolitaireStore = create<SolitaireState>((set, get) => ({
  mode: "klondike",
  piles: createKlondikeLayout(),
  history: [],
  historyIndex: -1,
  gameStats: {
    moves: 0,
    startTime: Date.now(),
    won: false,
  },
  isWon: false,

  newGame: (mode = "klondike") => {
    // TODO: Add Spider and FreeCell layouts when implemented
    const piles =
      mode === "klondike" ? createKlondikeLayout() : createKlondikeLayout(); // Fallback for now

    set({
      mode,
      piles,
      history: [],
      historyIndex: -1,
      gameStats: {
        moves: 0,
        startTime: Date.now(),
        won: false,
      },
      isWon: false,
    });
  },

  getCard: (cardId: CardId) => {
    const { piles } = get();
    for (const pile of Object.values(piles)) {
      const card = pile.cards.find(c => c.id === cardId);
      if (card) return card;
    }
    return undefined;
  },

  getPileByType: (type: PileType) => {
    const { piles } = get();
    return Object.values(piles).filter(p => p.type === type);
  },

  canMoveCards: (fromPileId: string, toPileId: string, cardIds: CardId[]) => {
    const { piles, mode } = get();
    const fromPile = piles[fromPileId];
    const toPile = piles[toPileId];

    if (!fromPile || !toPile || cardIds.length === 0) return false;

    // Get the moving cards
    const firstCardIndex = fromPile.cards.findIndex(c => c.id === cardIds[0]);
    if (firstCardIndex === -1) return false;

    const movingCards = fromPile.cards.slice(firstCardIndex);

    // Verify all requested cards are being moved (must be a continuous stack from the first card)
    if (movingCards.length !== cardIds.length) return false;
    if (!movingCards.every((c, i) => c.id === cardIds[i])) return false;

    // All moving cards must be face up
    if (!movingCards.every(c => c.faceUp)) return false;

    // Validate based on game mode
    if (mode === "klondike") {
      return validateKlondikeMove(piles, fromPile, toPile, movingCards);
    }

    // TODO: Add Spider and FreeCell validation
    return false;
  },

  moveCards: (fromPileId: string, toPileId: string, cardIds: CardId[]) => {
    const state = get();
    if (!state.canMoveCards(fromPileId, toPileId, cardIds)) return false;

    set(prev => {
      const newPiles = { ...prev.piles };
      const fromPile = {
        ...newPiles[fromPileId],
        cards: [...newPiles[fromPileId].cards],
      };
      const toPile = {
        ...newPiles[toPileId],
        cards: [...newPiles[toPileId].cards],
      };

      // Find and remove cards from source pile
      const firstCardIndex = fromPile.cards.findIndex(c => c.id === cardIds[0]);
      const movingCards = fromPile.cards.splice(firstCardIndex);

      // Add cards to destination pile
      toPile.cards.push(...movingCards);

      newPiles[fromPileId] = fromPile;
      newPiles[toPileId] = toPile;

      // Flip the new top card of source pile if it's face down
      let flippedCardId: CardId | undefined;
      if (fromPile.cards.length > 0) {
        const newTopCard = fromPile.cards[fromPile.cards.length - 1];
        if (!newTopCard.faceUp) {
          fromPile.cards[fromPile.cards.length - 1] = flipUp(newTopCard);
          flippedCardId = newTopCard.id;
        }
      }

      // Record move for undo
      const move: Move = { fromPileId, toPileId, cardIds, flippedCardId };
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push(move);

      // Check for win
      const isWon = checkWin(newPiles);

      return {
        piles: newPiles,
        history: newHistory,
        historyIndex: newHistory.length - 1,
        gameStats: {
          ...prev.gameStats,
          moves: prev.gameStats.moves + 1,
          won: isWon,
          endTime: isWon ? Date.now() : undefined,
        },
        isWon,
      };
    });

    return true;
  },

  drawCard: () => {
    set(prev => {
      const newPiles = { ...prev.piles };
      const stock = { ...newPiles.stock, cards: [...newPiles.stock.cards] };
      const waste = { ...newPiles.waste, cards: [...newPiles.waste.cards] };

      if (stock.cards.length === 0) {
        // Reset: move all waste cards back to stock (face down)
        stock.cards = waste.cards.reverse().map(c => ({ ...c, faceUp: false }));
        waste.cards = [];
      } else {
        // Draw one card from stock to waste
        const drawnCard = stock.cards.pop();
        if (drawnCard) {
          waste.cards.push(flipUp(drawnCard));
        }
      }

      newPiles.stock = stock;
      newPiles.waste = waste;

      return {
        piles: newPiles,
        gameStats: {
          ...prev.gameStats,
          moves: prev.gameStats.moves + 1,
        },
      };
    });
  },

  autoComplete: () => {
    // TODO: Auto-complete moves all cards to foundation when possible
    // This is a convenience feature for when the game is essentially won
  },

  undo: () => {
    const { history, historyIndex, piles } = get();
    if (historyIndex < 0) return;

    const move = history[historyIndex];

    set(prev => {
      const newPiles = { ...prev.piles };
      const fromPile = {
        ...newPiles[move.fromPileId],
        cards: [...newPiles[move.fromPileId].cards],
      };
      const toPile = {
        ...newPiles[move.toPileId],
        cards: [...newPiles[move.toPileId].cards],
      };

      // Undo flipped card if any
      if (move.flippedCardId && fromPile.cards.length > 0) {
        const topCard = fromPile.cards[fromPile.cards.length - 1];
        if (topCard.id === move.flippedCardId) {
          fromPile.cards[fromPile.cards.length - 1] = {
            ...topCard,
            faceUp: false,
          };
        }
      }

      // Move cards back
      const movedCards = toPile.cards.splice(-move.cardIds.length);
      fromPile.cards.push(...movedCards);

      newPiles[move.fromPileId] = fromPile;
      newPiles[move.toPileId] = toPile;

      return {
        piles: newPiles,
        historyIndex: prev.historyIndex - 1,
        gameStats: {
          ...prev.gameStats,
          moves: prev.gameStats.moves + 1,
        },
      };
    });
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return;

    const move = history[historyIndex + 1];
    get().moveCards(move.fromPileId, move.toPileId, move.cardIds);
  },
}));
