import type { HistoryState } from "../types";

export class HistoryManager {
  private history: HistoryState[] = [];
  private currentIndex = -1;
  private maxHistory: number;

  constructor(maxHistory = 50) {
    this.maxHistory = maxHistory;
  }

  /**
   * Push a new state to history
   * Clears any redo history when new state is added
   */
  push(state: HistoryState): void {
    // Remove any future states if we're not at the end
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }

    // Add new state with timestamp
    this.history.push({
      ...state,
      timestamp: Date.now(),
    });

    // Enforce max history limit
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    } else {
      this.currentIndex++;
    }
  }

  /**
   * Undo to previous state
   */
  undo(): HistoryState | null {
    if (!this.canUndo()) return null;

    this.currentIndex--;
    return this.history[this.currentIndex];
  }

  /**
   * Redo to next state
   */
  redo(): HistoryState | null {
    if (!this.canRedo()) return null;

    this.currentIndex++;
    return this.history[this.currentIndex];
  }

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.currentIndex > 0;
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  /**
   * Get current state
   */
  current(): HistoryState | null {
    if (this.currentIndex < 0) return null;
    return this.history[this.currentIndex];
  }

  /**
   * Clear all history
   */
  clear(): void {
    this.history = [];
    this.currentIndex = -1;
  }

  /**
   * Get the entire history timeline
   */
  getTimeline(): HistoryState[] {
    return [...this.history];
  }

  /**
   * Get current position in history
   */
  getCurrentIndex(): number {
    return this.currentIndex;
  }

  /**
   * Get total history length
   */
  getLength(): number {
    return this.history.length;
  }
}
