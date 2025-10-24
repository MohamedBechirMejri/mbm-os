import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { demoEvents } from "@/drizzle/schema";
import { db } from "@/lib/db";

type Payload = {
  // demoEvents
  numberOfRows: number;
};

export async function GET(): Promise<
  NextResponse<Payload | { error: string }>
> {
  try {
    const numberOfRows = await db
      .select({ count: sql`count(*)` })
      .from(demoEvents)
      .execute();
    const payload = {
      numberOfRows: Number(numberOfRows[0].count),
    };
    console.log(payload);

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "s-maxage=300, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 503 },
    );
  }
}
