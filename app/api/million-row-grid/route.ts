import { gt, sql } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get("limit");
  const cursorParam = searchParams.get("cursor");

  const limitValue = Number.parseInt(limitParam ?? "", 10);
  const limit = Number.isFinite(limitValue)
    ? Math.min(Math.max(limitValue, 10), MAX_LIMIT)
    : DEFAULT_LIMIT;

  const cursor = cursorParam ? Number.parseInt(cursorParam, 10) : null;

  if (cursorParam && (cursor === null || Number.isNaN(cursor))) {
    return NextResponse.json({ error: "Invalid cursor." }, { status: 400 });
  }

  try {
    const rows = await db.query.demoEvents.findMany({
      limit: limit + 1,
      orderBy: (event) => [sql`${event.id} ASC`],
      where: cursor !== null ? (event) => gt(event.id, cursor) : undefined,
    });

    const hasMore = rows.length > limit;
    const slicedRows = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? (slicedRows.at(-1)?.id ?? null) : null;

    return NextResponse.json(
      {
        rows: slicedRows,
        nextCursor,
        hasMore,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 503 },
    );
  }
}
