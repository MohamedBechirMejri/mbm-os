"use client";

/**
 * Klondike Solitaire layout - the classic Windows Solitaire game.
 *
 * Layout:
 * - Top row: Stock, Waste, [gap], 4 Foundations
 * - Bottom: 7 Tableau piles
 */

import { Pile, StockPile, WastePile } from "../components/pile";
import { CARD_WIDTH } from "../components/card";
import { useSolitaireStore } from "../store";

// Gap between cards horizontally
const HORIZONTAL_GAP = 16;

export function KlondikeLayout() {
  const piles = useSolitaireStore(state => state.piles);

  // Get piles by ID
  const stock = piles.stock;
  const waste = piles.waste;
  const foundations = [0, 1, 2, 3].map(i => piles[`foundation-${i}`]);
  const tableaus = [0, 1, 2, 3, 4, 5, 6].map(i => piles[`tableau-${i}`]);

  return (
    <div className="flex flex-col gap-6 p-4 select-none">
      {/* Top row: Stock, Waste, and Foundations */}
      <div className="flex items-start gap-4">
        {/* Stock pile */}
        <StockPile cards={stock?.cards ?? []} />

        {/* Waste pile */}
        <WastePile cards={waste?.cards ?? []} />

        {/* Spacer between waste and foundations */}
        <div style={{ width: CARD_WIDTH }} />

        {/* 4 Foundation piles */}
        <div className="flex gap-4">
          {foundations.map((pile, index) => (
            <Pile
              key={pile?.id ?? `foundation-${index}`}
              pileId={pile?.id ?? `foundation-${index}`}
              pileType="foundation"
              cards={pile?.cards ?? []}
              showPlaceholder
            />
          ))}
        </div>
      </div>

      {/* Tableau row: 7 piles */}
      <div
        className="flex gap-4"
        style={{
          marginTop: 8,
          minHeight: 400, // Allow room for long cascades
        }}
      >
        {tableaus.map((pile, index) => (
          <Pile
            key={pile?.id ?? `tableau-${index}`}
            pileId={pile?.id ?? `tableau-${index}`}
            pileType="tableau"
            cards={pile?.cards ?? []}
            spread
            showPlaceholder
          />
        ))}
      </div>
    </div>
  );
}
