import { NextResponse, type NextRequest } from "next/server";

import { parseSortOrder } from "@/lib/types";
import { newQuoteSchema } from "@/lib/validation";
import { DatabaseNotConfiguredError } from "@/server/database";
import { createQuote, getVoterToken, listQuotes } from "@/server/quotes";

export const dynamic = "force-dynamic";

function errorResponse(error: unknown) {
  if (error instanceof DatabaseNotConfiguredError) {
    return NextResponse.json({ error: "The database is not configured yet." }, { status: 503 });
  }

  console.error("[api/quotes]", error);
  return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
}

export async function GET(request: NextRequest) {
  try {
    const sort = parseSortOrder(request.nextUrl.searchParams.get("sort"));
    const quotes = await listQuotes(sort, await getVoterToken());
    return NextResponse.json({ quotes });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  const parsed = newQuoteSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "That submission isn't valid." },
      { status: 400 },
    );
  }

  try {
    const quote = await createQuote(parsed.data);
    return NextResponse.json({ quote }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
