# Terminal Experience Roadmap

A quick playbook covering pragmatic approaches for evolving the desktop terminal into something actually worthy of flexing about. Each section outlines the core objective, recommended approach, and practical implementation notes so you can pick the right level of ambition for the sprint (or the inevitable all-nighter).

## 1. Real Command Aliases

**Objective**: Make brag commands show live metrics like GitHub streaks or Tunisian dev leaderboard rankings.

### Approach: Live Aliases

- Wire aliases to server-side loaders that hit public APIs (GitHub REST/v4, custom leaderboard endpoint) via edge-friendly fetch calls.
- Cache responses in a lightweight KV store (Upstash Redis or Vercel KV) with short TTL to stay fresh without hammering APIs.
- Stream the response into the terminal using server actions to avoid client-side effects.

### Implementation Notes: Live Aliases

- Model aliases in a typed registry: `aliasId`, `description`, `resolve(): Promise<TerminalFrame[]>`.
- Use `app-router` server components so the terminal shell can fetch data with `react-cache` instead of `useEffect`.
- Format output with StarkNet-inspired ANSI gradient (subtle, but flex-ready) rendered via CSS variables tied to the current theme.

## 2. Task / Goal Tracking (skip for now until we hook up a db)

**Objective**: Track micro-missions via commands like `todo`, `quest`, or `hustle`.

### Approach: Task Tracking

- Create a shared `tasks-store` powered by Zustand or Jotai for local state, hydrated from a JSON file or Trello API proxy route (`/api/quests`).
- Provide CRUD subcommands (`todo add`, `todo list`, `todo done`) and serialize updates back through server actions.
- Surface progress bars using the existing `ui/progress` component styled to match macOS Tahoe progress meters.

### Implementation Notes: Task Tracking

- Define data contracts in `lib/types/tasks.ts` to keep typing strict—no `any`, ever.
- Batch writes with optimistic UI; fall back to diff merge if remote source rejects the mutation.
- Schedule an optional bun cron job to sync Trello every hour if the API path is selected.

## 3. Custom Theming

**Objective**: Give `theme` command the power to swap between liquid glass, anime glow, club colors, or hacker noir.

### Approach: Custom Theming

- Store theme tokens (palette, blur, typography, shadow) in `public/json/themes.json`.
- Apply via CSS custom properties scoped to the terminal root and persisted with a tiny `SettingsMachine` (xstate) so nothing devolves into effect soup.
- Trigger subtle `motion` transitions (spring-based with low stiffness) to make theme swaps feel intentional.

### Implementation Notes: Custom Theming

- Provide presets referencing macOS Tahoe patterns (depth layering, frosted glass) and optional novelty palettes.
- Expose `theme preview` subcommand that renders a mini viewport using shadcn/ui cards.
- Verify contrast ratios before enabling a theme; fail loudly if it violates WCAG, because standards matter.

## 4. Interactive Easter Eggs

**Objective**: Upgrade novelty commands with anime quotes, mini-games, and gacha-esque surprises.

### Approach: Easter Eggs

- Introduce a `fun` namespace in the alias registry with pluggable generators (quotes, games, randomizer).
- Build micro frontends (Snake, Tetris) using `<canvas>` wrapped in React components that talk to the terminal via event streams.
- Use deterministic seeds for the gacha command so users can share their pulls (and receipts).

### Implementation Notes: Easter Eggs

- Keep animations lean: spring physics for pop-ins, respect reduced-motion settings.
- Cache anime quotes locally in `json/anime-quotes.json` with occasional refresh from AniList GraphQL.
- Add a rate limiter—nobody needs infinite `gacha` spam destroying the vibe.

## 5. Real Terminal Integration (implement this first if it's doable. skip if too much work)

**Objective**: Execute real shell commands without handing over the nuclear launch codes.

### Approach: Real Shell

- Spawn bun subprocesses inside an isolated worker (Node’s `child_process` or Bun’s `Spawn` API) via an API route.
- Validate commands against an allowlist (`ls`, `git status`, `bun run lint`, etc.) to keep things safe.
- Stream stdout/stderr chunks back through a server-sent event channel so the terminal stays responsive.

### Implementation Notes: Real Shell

- Sandbox with Docker-in-Docker or Firecracker if you need extra paranoia for deployed demos.
- Offer `real-shell` opt-in toggle so casual users stick to the simulated experience by default.
- Handle Ctrl+C by sending SIGINT through the worker and cleaning up processes immediately.

## 6. Secret Fun

**Objective**: Put the `secrets` directory to work with hidden puzzles, memes, and unlockables.

### Approach: Secrets

- Generate secret file trees from a static config (think YAML describing clues and rewards) hydrated at build time.
- Gate content behind achievements tracked in the `tasks-store`—complete quests to unlock `cat secrets/arcana.txt`.
- Drop a bun script that randomizes secret payloads per deploy so repeat visitors get fresh surprises.

### Implementation Notes: Secrets

- Include an easter-egg dispatcher that checks command history and reveals hints when certain sequences fire.
- For the rickroll, embed a subtle `motion`-driven cover art preview before auto-launching the audio player.
- Log discoveries to local storage so users can brag about 100% completion like it’s a mini ARG.

---
Pick the ambition tier that matches your caffeine intake: light polish, medium flex, or full-on cyberpunk terminal takeover. Either way, you now have a blueprint.
