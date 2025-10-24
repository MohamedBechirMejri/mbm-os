import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(): Promise<NextResponse> {
  try {
    const rows = await db.query.demoEvents.findMany({
      limit: 100,
      orderBy: (event) => [sql`${event.id} ASC`],
    });

    const payload = {
      rows,
    };
    console.log(payload);

    return NextResponse.json(payload, {});
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 503 },
    );
  }
}
