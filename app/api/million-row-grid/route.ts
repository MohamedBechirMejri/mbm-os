import { NextResponse } from "next/server";
import type { demoEvents } from "@/drizzle/schema";

export const runtime = "edge";

type Payload = typeof demoEvents;

export async function GET(): Promise<
  NextResponse<Payload | { error: string }>
> {
  try {
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
