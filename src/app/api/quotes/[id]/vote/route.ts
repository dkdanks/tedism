import { NextResponse } from "next/server";

import { DatabaseNotConfiguredError } from "@/server/database";
import { getVoterToken, toggleVote } from "@/server/quotes";

export const dynamic = "force-dynamic";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!UUID_PATTERN.test(id)) {
    return NextResponse.json({ error: "Unknown quote." }, { status: 400 });
  }

  const voterToken = await getVoterToken();

  if (!voterToken) {
    return NextResponse.json(
      { error: "Voting needs cookies enabled. Try reloading the page." },
      { status: 400 },
    );
  }

  try {
    const result = await toggleVote(id, voterToken);

    if (!result) {
      return NextResponse.json({ error: "Unknown quote." }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof DatabaseNotConfiguredError) {
      return NextResponse.json({ error: "The database is not configured yet." }, { status: 503 });
    }

    console.error("[api/quotes/vote]", error);
    return NextResponse.json({ error: "Couldn't save that vote." }, { status: 500 });
  }
}
