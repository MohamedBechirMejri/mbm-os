/**
 * Core types for the Solitaire card game.
 * These types are shared across all game modes (Klondike, Spider, FreeCell).
 */

// Card suits in standard order
export type Suit = "hearts" | "diamonds" | "clubs" | "spades";

// Card rank values (1 = Ace, 11 = Jack, 12 = Queen, 13 = King)
export type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

// Card color derived from suit
export type CardColor = "red" | "black";

// Unique card identifier combining rank and suit (e.g., "7-hearts", "K-spades")
export type CardId = `${Rank}-${Suit}`;

/**
 * A playing card with all its properties
 */
export interface Card {
  id: CardId;
  suit: Suit;
  rank: Rank;
  color: CardColor;
  faceUp: boolean;
}

/**
 * Display labels for card ranks
 */
export const RANK_LABELS: Record<Rank, string> = {
  1: "A",
  2: "2",
  3: "3",
  4: "4",
  5: "5",
  6: "6",
  7: "7",
  8: "8",
  9: "9",
  10: "10",
  11: "J",
  12: "Q",
  13: "K",
};

/**
 * Suit symbols for display
 */
export const SUIT_SYMBOLS: Record<Suit, string> = {
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣",
  spades: "♠",
};

/**
 * Get the color of a suit
 */
export const getSuitColor = (suit: Suit): CardColor => {
  return suit === "hearts" || suit === "diamonds" ? "red" : "black";
};

// ============================================================================
// Pile Types - Different pile types across game modes
// ============================================================================

/**
 * Different types of card piles
 * - stock: Draw pile (face-down cards to draw from)
 * - waste: Discard pile (drawn cards go here)
 * - tableau: Main playing columns
 * - foundation: Where completed suits go (Ace → King)
 * - freecell: Temporary storage cells (FreeCell mode only)
 */
export type PileType =
  | "stock"
  | "waste"
  | "tableau"
  | "foundation"
  | "freecell";

/**
 * A pile of cards with metadata
 */
export interface Pile {
  id: string;
  type: PileType;
  cards: Card[];
}

// ============================================================================
// Game Modes
// ============================================================================

/**
 * Available game modes
 * - klondike: Classic solitaire (7 tableau piles)
 * - spider: Spider solitaire (10 tableau piles, complete suits)
 * - freecell: All cards visible, 4 free cells
 */
export type GameMode = "klondike" | "spider" | "freecell";

/**
 * Spider solitaire difficulty (number of suits used)
 */
export type SpiderDifficulty = 1 | 2 | 4;

// ============================================================================
// Game State
// ============================================================================

/**
 * Move record for undo/redo functionality
 */
export interface Move {
  fromPileId: string;
  toPileId: string;
  cardIds: CardId[];
  flippedCardId?: CardId; // Card that was flipped after the move
}

/**
 * Game statistics for a single game
 */
export interface GameStats {
  moves: number;
  startTime: number;
  endTime?: number;
  won: boolean;
}

/**
 * Lifetime statistics across all games
 */
export interface LifetimeStats {
  gamesPlayed: number;
  gamesWon: number;
  bestTime?: number; // Fastest win in ms
  currentStreak: number;
  bestStreak: number;
}

// ============================================================================
// Drag & Drop Types
// ============================================================================

/**
 * Item types for react-dnd
 */
export const DND_ITEM_TYPES = {
  CARD: "card",
} as const;

/**
 * Drag item payload when dragging cards
 */
export interface CardDragItem {
  type: typeof DND_ITEM_TYPES.CARD;
  cardIds: CardId[];
  sourcePileId: string;
}
