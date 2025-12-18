# 🎯 Scrabble Game Implementation Plan

<div align="center">

```
╔═══════════════════════════════════════════════════════════════════════╗
║                                                                       ║
║   ███████╗ ██████╗██████╗  █████╗ ██████╗ ██████╗ ██╗     ███████╗   ║
║   ██╔════╝██╔════╝██╔══██╗██╔══██╗██╔══██╗██╔══██╗██║     ██╔════╝   ║
║   ███████╗██║     ██████╔╝███████║██████╔╝██████╔╝██║     █████╗     ║
║   ╚════██║██║     ██╔══██╗██╔══██║██╔══██╗██╔══██╗██║     ██╔══╝     ║
║   ███████║╚██████╗██║  ██║██║  ██║██████╔╝██████╔╝███████╗███████╗   ║
║   ╚══════╝ ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ ╚═════╝ ╚══════╝╚══════╝   ║
║                                                                       ║
║                    A Beautiful Word Game for mbm-os                   ║
╚═══════════════════════════════════════════════════════════════════════╝
```

**Version 1.0** • **Target: Games Category** • **Premium Experience**

</div>

---

## 📋 Table of Contents

1. [Vision & Goals](#-vision--goals)
2. [Game Modes](#-game-modes)
3. [Visual Design](#-visual-design)
4. [Architecture](#-architecture)
5. [Implementation Phases](#-implementation-phases)
6. [Technical Specifications](#-technical-specifications)
7. [File Structure](#-file-structure)
8. [Components Breakdown](#-components-breakdown)
9. [State Management](#-state-management)
10. [Dictionary & Validation](#-dictionary--validation)
11. [AI Opponent](#-ai-opponent)
12. [Animations & Polish](#-animations--polish)
13. [Sound Design](#-sound-design)
14. [Accessibility](#-accessibility)

---

## 🎯 Vision & Goals

### The Experience We're Creating

> _"A Scrabble game so beautifully crafted, it feels like playing on a handcrafted wooden board in a cozy cabin."_

| Goal                    | Description                                           |
| ----------------------- | ----------------------------------------------------- |
| **Premium Feel**        | Every interaction should feel satisfying and polished |
| **Instant Playability** | Jump into a game within seconds                       |
| **Smart AI**            | Challenging but fair computer opponent                |
| **Beautiful Design**    | Matches the overall mbm-os aesthetic                  |
| **Smooth Performance**  | 60fps animations, no jank                             |

### Core Principles

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   🎨 BEAUTY        Form follows function, but make it gorgeous │
│   ⚡ PERFORMANCE   Smooth 60fps, instant feedback              │
│   🧠 INTELLIGENCE  Smart AI that's fun to play against         │
│   ✨ DELIGHT       Micro-interactions that bring joy           │
│   ♿ ACCESSIBILITY  Playable by everyone                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎮 Game Modes

### Single Player (v1.0)

```
┌──────────────────────────────────────────────────┐
│                                                  │
│   👤 vs 🤖                                       │
│                                                  │
│   ┌────────────────────────────────────────┐    │
│   │  EASY    • 2-3 letter words            │    │
│   │          • Skips premium squares       │    │
│   │          • Perfect for learning        │    │
│   └────────────────────────────────────────┘    │
│                                                  │
│   ┌────────────────────────────────────────┐    │
│   │  MEDIUM  • Balanced vocabulary         │    │
│   │          • Uses strategy               │    │
│   │          • Good challenge              │    │
│   └────────────────────────────────────────┘    │
│                                                  │
│   ┌────────────────────────────────────────┐    │
│   │  HARD    • Full vocabulary             │    │
│   │          • Aggressive strategy         │    │
│   │          • Expert mode                 │    │
│   └────────────────────────────────────────┘    │
│                                                  │
└──────────────────────────────────────────────────┘
```

### Two Player Hot-Seat (v1.1)

Pass-and-play on the same device. Great for playing with friends!

### Online Multiplayer (v2.0 - Future)

Real-time games with friends or matchmaking.

---

## 🎨 Visual Design

### Color Palette

```scss
// Primary Game Colors
$board-wood: #d4a574; // Warm wood board
$board-wood-dark: #a67c52; // Board border
$tile-cream: #fdf6e3; // Classic tile color
$tile-shadow: #c4b896; // Tile depth

// Premium Square Colors
$double-letter: #a8d8ea; // Soft sky blue
$triple-letter: #3d5a80; // Deep ocean blue
$double-word: #ffb5a7; // Soft coral
$triple-word: #e63946; // Rich red
$center-star: #ffd166; // Golden star

// UI Colors
$score-gold: #ffd700; // Score highlights
$valid-word: #2ecc71; // Word accepted
$invalid-word: #e74c3c; // Word rejected
```

### Board Design Mockup

```
      1   2   3   4   5   6   7   8   9  10  11  12  13  14  15
    ╔═══╦═══╦═══╦═══╦═══╦═══╦═══╦═══╦═══╦═══╦═══╦═══╦═══╦═══╦═══╗
  A ║TW │   │   │DL │   │   │   │TW │   │   │   │DL │   │   │TW ║
    ╠═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╣
  B ║   │DW │   │   │   │TL │   │   │   │TL │   │   │   │DW │   ║
    ╠═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╣
  C ║   │   │DW │   │   │   │DL │   │DL │   │   │   │DW │   │   ║
    ╠═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╣
  D ║DL │   │   │DW │   │   │   │DL │   │   │   │DW │   │   │DL ║
    ╠═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╣
  E ║   │   │   │   │DW │   │   │   │   │   │DW │   │   │   │   ║
    ╠═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╣
  F ║   │TL │   │   │   │TL │   │   │   │TL │   │   │   │TL │   ║
    ╠═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╣
  G ║   │   │DL │   │   │   │DL │   │DL │   │   │   │DL │   │   ║
    ╠═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╣
  H ║TW │   │   │DL │   │   │   │ ★ │   │   │   │DL │   │   │TW ║
    ╠═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╣
  I ║   │   │DL │   │   │   │DL │   │DL │   │   │   │DL │   │   ║
    ╠═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╣
  J ║   │TL │   │   │   │TL │   │   │   │TL │   │   │   │TL │   ║
    ╠═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╣
  K ║   │   │   │   │DW │   │   │   │   │   │DW │   │   │   │   ║
    ╠═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╣
  L ║DL │   │   │DW │   │   │   │DL │   │   │   │DW │   │   │DL ║
    ╠═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╣
  M ║   │   │DW │   │   │   │DL │   │DL │   │   │   │DW │   │   ║
    ╠═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╣
  N ║   │DW │   │   │   │TL │   │   │   │TL │   │   │   │DW │   ║
    ╠═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╬═══╣
  O ║TW │   │   │DL │   │   │   │TW │   │   │   │DL │   │   │TW ║
    ╚═══╩═══╩═══╩═══╩═══╩═══╩═══╩═══╩═══╩═══╩═══╩═══╩═══╩═══╩═══╝

    Legend:
    ┌────┬─────────────────────────────┐
    │ TW │ Triple Word Score (Red)    │
    │ DW │ Double Word Score (Pink)   │
    │ TL │ Triple Letter Score (Blue) │
    │ DL │ Double Letter Score (Cyan) │
    │ ★  │ Center Star                │
    └────┴─────────────────────────────┘
```

### Tile Design

```
    ╭─────────────────╮
    │                 │
    │    ┌─────┐      │
    │    │  Q  │      │   Letter: Large, centered
    │    │     │      │   Point value: Bottom-right
    │    │   10│      │   Texture: Subtle wood grain
    │    └─────┘      │   Shadow: Soft drop shadow
    │                 │
    ╰─────────────────╯

    Tile States:
    • Default:    Cream with subtle shadow
    • Hovering:   Slight lift, stronger shadow
    • Dragging:   Rotate slightly, larger shadow
    • Placed:     Settle animation, lock in place
    • Just Scored: Golden glow pulse
```

---

## 🏗️ Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           SCRABBLE APP                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌───────────────────────────────────────────────────────────────┐    │
│   │                        UI LAYER                                │    │
│   │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │    │
│   │  │  Board   │  │  Rack    │  │  Tile    │  │  Score Panel │   │    │
│   │  │Component │  │Component │  │Component │  │  Component   │   │    │
│   │  └──────────┘  └──────────┘  └──────────┘  └──────────────┘   │    │
│   └───────────────────────────────────────────────────────────────┘    │
│                                   │                                     │
│                                   ▼                                     │
│   ┌───────────────────────────────────────────────────────────────┐    │
│   │                      STATE LAYER (Zustand)                     │    │
│   │  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐   │    │
│   │  │  Game State  │  │ Player State │  │  Animation Queue   │   │    │
│   │  └──────────────┘  └──────────────┘  └────────────────────┘   │    │
│   └───────────────────────────────────────────────────────────────┘    │
│                                   │                                     │
│                                   ▼                                     │
│   ┌───────────────────────────────────────────────────────────────┐    │
│   │                      LOGIC LAYER                               │    │
│   │  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐   │    │
│   │  │  Game Rules  │  │  Validator   │  │   AI Engine        │   │    │
│   │  │  Engine      │  │  (Dictionary)│  │   (Opponent)       │   │    │
│   │  └──────────────┘  └──────────────┘  └────────────────────┘   │    │
│   └───────────────────────────────────────────────────────────────┘    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│     User Action          State Update           UI Update            │
│         │                     │                     │                │
│         ▼                     ▼                     ▼                │
│    ┌─────────┐           ┌─────────┐           ┌─────────┐          │
│    │ Drag    │  ──────▶  │ Validate│  ──────▶  │ Animate │          │
│    │ Tile    │           │ Move    │           │ Tile    │          │
│    └─────────┘           └─────────┘           └─────────┘          │
│         │                     │                     │                │
│         ▼                     ▼                     ▼                │
│    ┌─────────┐           ┌─────────┐           ┌─────────┐          │
│    │ Play    │  ──────▶  │ Check   │  ──────▶  │ Show    │          │
│    │ Word    │           │ Words   │           │ Score   │          │
│    └─────────┘           └─────────┘           └─────────┘          │
│         │                     │                     │                │
│         ▼                     ▼                     ▼                │
│    ┌─────────┐           ┌─────────┐           ┌─────────┐          │
│    │ End     │  ──────▶  │ AI      │  ──────▶  │ AI      │          │
│    │ Turn    │           │ Think   │           │ Play    │          │
│    └─────────┘           └─────────┘           └─────────┘          │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 📅 Implementation Phases

### Phase 1: Core Foundation 🏗️

**Estimated Time: 2-3 days**

- [x] Create project plan (this document!)
- [ ] Set up file structure
- [ ] Define TypeScript types
- [ ] Create Zustand store skeleton
- [ ] Build basic Board component (static grid)
- [ ] Build basic Tile component
- [ ] Register app in catalog

### Phase 2: Game Mechanics ⚙️

**Estimated Time: 3-4 days**

- [ ] Implement tile bag and distribution
- [ ] Build player rack component
- [ ] Implement drag and drop (react-dnd)
- [ ] Add tile placement logic
- [ ] Word validation system
- [ ] Score calculation engine
- [ ] Turn management

### Phase 3: Dictionary & Validation 📚

**Estimated Time: 2 days**

- [ ] Integrate English word dictionary
- [ ] Build word validation engine
- [ ] Create validation feedback UI
- [ ] Handle edge cases (blank tiles, etc.)

### Phase 4: AI Opponent 🤖

**Estimated Time: 3-4 days**

- [ ] Implement word finding algorithm
- [ ] Build scoring optimization
- [ ] Add difficulty levels
- [ ] Implement AI "thinking" delay for realism

### Phase 5: Visual Polish ✨

**Estimated Time: 2-3 days**

- [ ] Tile animations (place, score, drag)
- [ ] Board premium square styling
- [ ] Score animations
- [ ] Game status indicators
- [ ] Win/lose celebration

### Phase 6: Sound & Final Polish 🎵

**Estimated Time: 1-2 days**

- [ ] Tile placement sounds
- [ ] Score sounds
- [ ] Ambient game sounds (optional)
- [ ] Final bug fixes and polish

---

## 📁 File Structure

```
scrabble/
├── index.tsx                 # Main app component & layout
├── store.ts                  # Zustand game state
├── types.ts                  # TypeScript definitions
├── constants.ts              # Game constants (points, board layout)
├── dictionary.ts             # Word validation & dictionary
├── PLAN.md                   # This planning document
│
├── components/
│   ├── board/
│   │   ├── board.tsx         # 15x15 game board
│   │   ├── cell.tsx          # Individual board cell
│   │   └── premium-badge.tsx # DL/TL/DW/TW indicators
│   │
│   ├── tiles/
│   │   ├── tile.tsx          # Draggable tile component
│   │   ├── tile-rack.tsx     # Player's tile holder
│   │   └── tile-bag.tsx      # Visual bag (optional)
│   │
│   ├── game-controls/
│   │   ├── action-bar.tsx    # Play/Exchange/Pass buttons
│   │   ├── score-panel.tsx   # Current scores display
│   │   └── game-status.tsx   # Turn indicator, game phase
│   │
│   ├── modals/
│   │   ├── new-game.tsx      # Game setup modal
│   │   ├── exchange-tiles.tsx # Tile exchange interface
│   │   └── game-over.tsx     # End game summary
│   │
│   └── effects/
│       ├── confetti.tsx      # Win celebration
│       └── score-popup.tsx   # Animated score display
│
├── engine/
│   ├── game-rules.ts         # Core game logic
│   ├── word-finder.ts        # Find valid words
│   ├── score-calculator.ts   # Calculate move scores
│   └── ai/
│       ├── ai-player.ts      # AI opponent logic
│       ├── strategies/
│       │   ├── easy.ts       # Simple word selection
│       │   ├── medium.ts     # Balanced strategy
│       │   └── hard.ts       # Aggressive optimization
│       └── word-generator.ts # Generate possible moves
│
└── hooks/
    ├── use-drag-tile.ts      # Tile drag logic
    ├── use-game-timer.ts     # Optional game timer
    └── use-keyboard.ts       # Keyboard shortcuts
```

---

## 🧩 Components Breakdown

### Board Component

```tsx
interface BoardProps {
  cells: Cell[][];
  placedTiles: Map<string, Tile>;
  pendingTiles: Map<string, Tile>;
  onCellDrop: (row: number, col: number, tile: Tile) => void;
  highlightedCells?: Set<string>;
}
```

**Features:**

- 15×15 responsive grid
- Premium square highlighting
- Drop zone for tiles
- Visual feedback for valid/invalid placement

### Tile Component

```tsx
interface TileProps {
  letter: string;
  points: number;
  isBlank?: boolean;
  isDragging?: boolean;
  isPlaced?: boolean;
  isPending?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}
```

**Visual States:**

- **In Rack**: Normal appearance, ready to drag
- **Dragging**: Slight rotation, shadow, cursor follows
- **Pending**: On board but not confirmed
- **Placed**: Locked into position
- **Highlighted**: Part of scoring word

### Tile Rack Component

```tsx
interface TileRackProps {
  tiles: Tile[];
  onTileSelect: (tile: Tile) => void;
  onShuffle: () => void;
  disabled?: boolean;
}
```

**Features:**

- 7 tile slots
- Shuffle button
- Drag source
- Visual feedback when empty

---

## 💾 State Management

### Zustand Store Structure

```typescript
interface ScrabbleState {
  // Game Configuration
  gameMode: "single" | "two-player";
  difficulty: "easy" | "medium" | "hard";
  gamePhase: "setup" | "playing" | "ended";

  // Board State
  board: (Tile | null)[][]; // 15x15 grid
  pendingTiles: Map<string, Tile>; // Tiles placed but not confirmed

  // Tile Bag
  tileBag: Tile[]; // Remaining tiles

  // Players
  players: Player[];
  currentPlayerIndex: number;

  // Scores
  scores: number[];
  moveHistory: Move[];

  // Actions
  newGame: (mode: GameMode, difficulty?: Difficulty) => void;
  placeTile: (tile: Tile, row: number, col: number) => void;
  removePendingTile: (row: number, col: number) => void;
  confirmMove: () => MoveResult;
  exchangeTiles: (tiles: Tile[]) => void;
  passTurn: () => void;
  undo: () => void;

  // Computed
  getCurrentPlayer: () => Player;
  canConfirmMove: () => boolean;
  getPendingScore: () => number;
}
```

---

## 📚 Dictionary & Validation

### Word Validation Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                    WORD VALIDATION FLOW                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Player Places Tiles                                           │
│          │                                                      │
│          ▼                                                      │
│   ┌──────────────────┐                                         │
│   │ Extract All Words│  ← Find horizontal and vertical words   │
│   └──────────────────┘                                         │
│          │                                                      │
│          ▼                                                      │
│   ┌──────────────────┐                                         │
│   │ Validate Each    │  ← Check against dictionary             │
│   │ Word             │                                         │
│   └──────────────────┘                                         │
│          │                                                      │
│     ┌────┴────┐                                                │
│     ▼         ▼                                                │
│  ┌──────┐  ┌──────┐                                           │
│  │Valid │  │Invalid                                            │
│  │      │  │      │                                            │
│  └──────┘  └──────┘                                           │
│     │         │                                                │
│     ▼         ▼                                                │
│  Calculate   Show Error                                        │
│  Score       Message                                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Dictionary Options

| Option           | Size        | Load Time | Pros                           | Cons               |
| ---------------- | ----------- | --------- | ------------------------------ | ------------------ |
| **SOWPODS**      | ~270k words | ~1-2s     | Complete tournament dictionary | Large file         |
| **TWL06**        | ~180k words | ~1s       | Official NA dictionary         | Some words missing |
| **Common Words** | ~50k words  | ~200ms    | Fast loading                   | Limited vocabulary |

**Recommendation:** Use a compressed word list (~50KB gzipped) loaded on game start, with lazy loading of the full dictionary for competitive play.

---

## 🤖 AI Opponent

### AI Architecture

```typescript
interface AIPlayer {
  difficulty: "easy" | "medium" | "hard";

  findBestMove(
    board: Board,
    rack: Tile[],
    dictionary: Dictionary
  ): Promise<Move | null>;

  // Internal methods
  generateAllMoves(board: Board, rack: Tile[]): Move[];
  scoreMove(move: Move): number;
  selectMove(moves: Move[]): Move;
}
```

### Difficulty Strategies

#### 🟢 Easy AI

- Finds shortest valid words (2-3 letters)
- Ignores premium squares
- Random selection from valid moves
- Never uses all 7 tiles

#### 🟡 Medium AI

- Balanced word length (3-5 letters)
- Considers premium squares
- Avoids giving opponent good spots
- Occasionally finds 7-tile words

#### 🔴 Hard AI

- Maximizes points per move
- Actively blocks opponent opportunities
- Strategic premium square usage
- Consistently finds best plays
- Considers future implications

### AI "Thinking" Animation

```
┌─────────────────────────────────────────┐
│                                         │
│           🤖 AI is thinking...          │
│                                         │
│         ━━━━━━━━━━━━━━━━━━━━━          │
│              ◐ ◓ ◑ ◒                    │
│                                         │
│     "Hmm, this is interesting..."       │
│                                         │
└─────────────────────────────────────────┘
```

---

## ✨ Animations & Polish

### Animation Catalog

| Animation    | Trigger                 | Duration | Effect                                |
| ------------ | ----------------------- | -------- | ------------------------------------- |
| Tile Pickup  | Drag start              | 150ms    | Scale up, rotate slightly, add shadow |
| Tile Drop    | Release on board        | 200ms    | Bounce settle, lock in place          |
| Invalid Drop | Release on invalid spot | 300ms    | Return to rack with shake             |
| Word Score   | Move confirmed          | 500ms    | Letters glow, points fly to score     |
| Turn Switch  | After play              | 400ms    | Slide transition, highlight player    |
| AI Thinking  | AI turn start           | Variable | Pulsing indicator                     |
| Game Win     | Victory                 | 2000ms   | Confetti, trophy animation            |
| Tile Shuffle | Shuffle click           | 300ms    | Cards scatter and reassemble          |

### Framer Motion Variants

```typescript
const tileVariants = {
  idle: { scale: 1, rotate: 0, boxShadow: "0 2px 4px rgba(0,0,0,0.1)" },
  dragging: {
    scale: 1.1,
    rotate: 5,
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
    cursor: "grabbing",
  },
  placed: {
    scale: 1,
    rotate: 0,
    transition: { type: "spring", stiffness: 500 },
  },
  scoring: {
    scale: [1, 1.2, 1],
    boxShadow: [
      "0 0 0 rgba(255,215,0,0)",
      "0 0 20px rgba(255,215,0,0.8)",
      "0 0 0 rgba(255,215,0,0)",
    ],
    transition: { duration: 0.5 },
  },
};
```

---

## 🎵 Sound Design

### Sound Effects Library

| Sound        | File             | Trigger         | Notes               |
| ------------ | ---------------- | --------------- | ------------------- |
| Tile Click   | `tile-click.mp3` | Pick up tile    | Soft wooden click   |
| Tile Place   | `tile-place.mp3` | Drop on board   | Satisfying thunk    |
| Invalid Move | `invalid.mp3`    | Bad placement   | Gentle error tone   |
| Word Score   | `score.mp3`      | Move confirmed  | Cheerful ding       |
| Big Score    | `big-score.mp3`  | 50+ points      | Fanfare             |
| AI Play      | `ai-move.mp3`    | AI places tiles | Subtle whoosh       |
| Game Win     | `victory.mp3`    | Player wins     | Celebration         |
| Game Lose    | `defeat.mp3`     | AI wins         | Gentle sad trombone |

---

## ♿ Accessibility

### Keyboard Navigation

| Key          | Action                         |
| ------------ | ------------------------------ |
| `Tab`        | Navigate between tiles/buttons |
| `Enter`      | Select/confirm                 |
| `Escape`     | Cancel action                  |
| `Arrow Keys` | Navigate board                 |
| `Space`      | Place selected tile            |
| `R`          | Return tiles to rack           |
| `P`          | Play word                      |
| `S`          | Shuffle rack                   |

### Screen Reader Support

- All tiles announce letter and point value
- Board cells announce position and premium type
- Game status is announced on changes
- Score updates are announced

---

## 🎯 Success Criteria

### v1.0 Release Checklist

- [ ] Single player vs AI works smoothly
- [ ] All three difficulty levels are distinct
- [ ] Word validation is accurate
- [ ] Score calculation is correct
- [ ] UI is responsive and beautiful
- [ ] Animations are smooth (60fps)
- [ ] Sound effects enhance experience
- [ ] Game can be won/lost properly
- [ ] No critical bugs

### Performance Targets

| Metric        | Target                         |
| ------------- | ------------------------------ |
| First Paint   | < 200ms                        |
| Interactive   | < 500ms                        |
| AI Move       | < 2s (with thinking delay)     |
| Animation FPS | 60                             |
| Bundle Size   | < 200KB (excluding dictionary) |

---

## 🚀 Let's Build Something Beautiful

```
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║   "The details are not the details.                               ║
║    They make the design."                                         ║
║                                         — Charles Eames           ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
```

---

<div align="center">

**Created for mbm-os** • **Made with ❤️**

_Ready to play? Let's start building!_

</div>
