/**
 * Deck utilities for creating and manipulating cards.
 * Shared across all game modes.
 */

import type { Card, CardId, Rank, Suit } from "./types";
import { getSuitColor } from "./types";

const SUITS: Suit[] = ["hearts", "diamonds", "clubs", "spades"];
const RANKS: Rank[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

/**
 * Create a card ID from rank and suit
 */
export const createCardId = (rank: Rank, suit: Suit): CardId =>
  `${rank}-${suit}`;

/**
 * Create a single card
 */
export const createCard = (rank: Rank, suit: Suit, faceUp = false): Card => ({
  id: createCardId(rank, suit),
  rank,
  suit,
  color: getSuitColor(suit),
  faceUp,
});

/**
 * Create a standard 52-card deck
 */
export const createDeck = (): Card[] => {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push(createCard(rank, suit, false));
    }
  }
  return deck;
};

/**
 * Create multiple decks (for Spider solitaire which uses 2 decks)
 */
export const createMultipleDecks = (count: number): Card[] => {
  // For multiple decks, we need unique IDs, so we append deck index
  const allCards: Card[] = [];
  for (let deckIndex = 0; deckIndex < count; deckIndex++) {
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        // Create card with deck-indexed ID for uniqueness
        const baseId = createCardId(rank, suit);
        const uniqueId = (
          deckIndex > 0 ? `${baseId}-${deckIndex}` : baseId
        ) as CardId;
        allCards.push({
          id: uniqueId,
          rank,
          suit,
          color: getSuitColor(suit),
          faceUp: false,
        });
      }
    }
  }
  return allCards;
};

/**
 * Fisher-Yates shuffle algorithm
 * Returns a new shuffled array without mutating the original
 */
export const shuffle = <T>(array: T[]): T[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

/**
 * Create and shuffle a new deck
 */
export const createShuffledDeck = (): Card[] => shuffle(createDeck());

/**
 * Flip a card face-up (returns new card object)
 */
export const flipUp = (card: Card): Card => ({ ...card, faceUp: true });

/**
 * Flip a card face-down (returns new card object)
 */
export const flipDown = (card: Card): Card => ({ ...card, faceUp: false });

/**
 * Check if a card can stack on another in tableau (alternating colors, descending)
 */
export const canStackInTableau = (card: Card, targetCard: Card): boolean => {
  return card.color !== targetCard.color && card.rank === targetCard.rank - 1;
};

/**
 * Check if a card can go on foundation (same suit, ascending from Ace)
 */
export const canStackOnFoundation = (
  card: Card,
  topCard: Card | undefined,
  foundationSuit: Suit | undefined
): boolean => {
  // If foundation is empty, only Ace can go
  if (!topCard) {
    return card.rank === 1;
  }
  // Must be same suit and next rank
  return card.suit === topCard.suit && card.rank === topCard.rank + 1;
};

/**
 * Check if a sequence of cards forms a valid descending run (same suit)
 * Used in Spider solitaire
 */
export const isValidSameSuitRun = (cards: Card[]): boolean => {
  if (cards.length === 0) return true;
  for (let i = 1; i < cards.length; i++) {
    const prev = cards[i - 1];
    const curr = cards[i];
    if (curr.suit !== prev.suit || curr.rank !== prev.rank - 1) {
      return false;
    }
  }
  return true;
};

/**
 * Check if cards form a complete suit run (K → A, all same suit)
 * Used in Spider solitaire for completion
 */
export const isCompleteSuitRun = (cards: Card[]): boolean => {
  if (cards.length !== 13) return false;
  const sorted = [...cards].sort((a, b) => b.rank - a.rank);
  const suit = sorted[0].suit;
  return sorted.every(
    (card, index) => card.suit === suit && card.rank === 13 - index
  );
};
