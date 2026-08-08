import "server-only";

import { cookies } from "next/headers";

import type { Quote, SortOrder } from "@/lib/types";
import type { NewQuoteInput } from "@/lib/validation";
import { VOTER_COOKIE } from "@/lib/voter";
import { getDatabase } from "@/server/database";

type QuoteRow = {
  id: string;
  quote: string;
  context: string | null;
  author: string | null;
  created_at: Date;
  vote_count: number;
  has_voted: boolean;
};

function toQuote(row: QuoteRow): Quote {
  return {
    id: row.id,
    quote: row.quote,
    context: row.context,
    author: row.author,
    createdAt: row.created_at.toISOString(),
    voteCount: Number(row.vote_count),
    hasVoted: row.has_voted,
  };
}

/** The middleware assigns this on every request; empty string just means no votes match. */
export async function getVoterToken() {
  const store = await cookies();
  return store.get(VOTER_COOKIE)?.value ?? "";
}

export async function listQuotes(sort: SortOrder, voterToken: string): Promise<Quote[]> {
  const db = await getDatabase();

  const rows = await db<QuoteRow[]>`
    select
      q.id,
      q.quote,
      q.context,
      q.author,
      q.created_at,
      q.vote_count,
      (v.voter_token is not null) as has_voted
    from quotes q
    left join quote_votes v
      on v.quote_id = q.id
     and v.voter_token = ${voterToken}
    order by
      ${sort === "top" ? db`q.vote_count desc, q.created_at desc` : db`q.created_at desc`}
  `;

  return rows.map(toQuote);
}

export async function createQuote(input: NewQuoteInput): Promise<Quote> {
  const db = await getDatabase();

  const [row] = await db<QuoteRow[]>`
    insert into quotes (quote, context, author)
    values (${input.quote}, ${input.context ?? null}, ${input.author ?? null})
    returning id, quote, context, author, created_at, vote_count, false as has_voted
  `;

  return toQuote({ ...row, has_voted: false });
}

export type VoteResult = { voteCount: number; hasVoted: boolean };

/**
 * Toggles this voter's upvote and keeps the denormalised `vote_count` in step.
 * Both statements run in one transaction so the count can never drift from the
 * rows in `quote_votes`.
 */
export async function toggleVote(quoteId: string, voterToken: string): Promise<VoteResult | null> {
  const db = await getDatabase();

  return db.begin(async (tx) => {
    const [quote] = await tx<{ id: string }[]>`
      select id from quotes where id = ${quoteId} for update
    `;

    if (!quote) {
      return null;
    }

    const removed = await tx`
      delete from quote_votes
      where quote_id = ${quoteId} and voter_token = ${voterToken}
      returning quote_id
    `;

    const hasVoted = removed.length === 0;

    if (hasVoted) {
      await tx`
        insert into quote_votes (quote_id, voter_token)
        values (${quoteId}, ${voterToken})
        on conflict do nothing
      `;
    }

    const [updated] = await tx<{ vote_count: number }[]>`
      update quotes
      set vote_count = (select count(*) from quote_votes where quote_id = ${quoteId})
      where id = ${quoteId}
      returning vote_count
    `;

    return { voteCount: Number(updated.vote_count), hasVoted };
  });
}
