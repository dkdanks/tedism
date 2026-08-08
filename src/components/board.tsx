"use client";

import { useMemo, useState } from "react";

import { QuoteCard } from "@/components/quote-card";
import { SubmitForm } from "@/components/submit-form";
import { formatCount } from "@/lib/format";
import type { Quote, SortOrder } from "@/lib/types";
import type { NewQuoteInput } from "@/lib/validation";

type BoardProps = {
  initialQuotes: Quote[];
  initialSort: SortOrder;
};

function sortQuotes(quotes: Quote[], sort: SortOrder) {
  return [...quotes].sort((a, b) => {
    if (sort === "top" && b.voteCount !== a.voteCount) {
      return b.voteCount - a.voteCount;
    }
    return Date.parse(b.createdAt) - Date.parse(a.createdAt);
  });
}

async function readError(response: Response, fallback: string) {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error ?? fallback;
  } catch {
    return fallback;
  }
}

export function Board({ initialQuotes, initialSort }: BoardProps) {
  const [quotes, setQuotes] = useState(initialQuotes);
  const [sort, setSort] = useState(initialSort);
  const [search, setSearch] = useState("");
  const [voteError, setVoteError] = useState<string | null>(null);

  const visible = useMemo(() => {
    const needle = search.trim().toLowerCase();

    if (!needle) {
      return quotes;
    }

    return quotes.filter((quote) =>
      [quote.quote, quote.context, quote.author]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(needle)),
    );
  }, [quotes, search]);

  function changeSort(next: SortOrder) {
    setSort(next);
    setQuotes((current) => sortQuotes(current, next));
  }

  async function handleSubmit(input: NewQuoteInput) {
    const response = await fetch("/api/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      return readError(response, "Couldn't save that one. Please try again.");
    }

    const { quote } = (await response.json()) as { quote: Quote };
    // Show it at the top straight away, whatever the sort — re-sorting would
    // bury a brand new quote under everything that already has votes.
    setQuotes((current) => [quote, ...current]);
    return null;
  }

  async function handleVote(id: string) {
    setVoteError(null);

    const before = quotes;

    setQuotes((current) =>
      current.map((quote) =>
        quote.id === id
          ? {
              ...quote,
              hasVoted: !quote.hasVoted,
              voteCount: quote.voteCount + (quote.hasVoted ? -1 : 1),
            }
          : quote,
      ),
    );

    try {
      const response = await fetch(`/api/quotes/${id}/vote`, { method: "POST" });

      if (!response.ok) {
        setQuotes(before);
        setVoteError(await readError(response, "Couldn't save that vote."));
        return;
      }

      const result = (await response.json()) as { voteCount: number; hasVoted: boolean };

      setQuotes((current) =>
        current.map((quote) =>
          quote.id === id
            ? { ...quote, voteCount: result.voteCount, hasVoted: result.hasVoted }
            : quote,
        ),
      );
    } catch {
      setQuotes(before);
      setVoteError("Couldn't reach the server. Check your connection and try again.");
    }
  }

  return (
    <div className="space-y-8">
      <SubmitForm onSubmit={handleSubmit} />

      <section aria-labelledby="collection-heading" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="collection-heading" className="text-sm font-semibold text-ink-soft">
            {formatCount(quotes.length, "Tedism")}
            {search.trim() && visible.length !== quotes.length ? ` · ${visible.length} matching` : ""}
          </h2>

          <div className="flex items-center gap-2">
            <SortToggle sort={sort} onChange={changeSort} />
          </div>
        </div>

        <label className="block">
          <span className="sr-only">Search the Tedisms</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search the Tedisms"
            className="w-full rounded-xl border border-line bg-card px-3.5 py-2.5 text-ink placeholder:text-ink-soft/70 focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent"
          />
        </label>

        {voteError ? (
          <p role="status" className="text-sm text-accent">
            {voteError}
          </p>
        ) : null}

        {visible.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line px-5 py-10 text-center text-ink-soft">
            {quotes.length === 0
              ? "Nothing here yet. Add the first Tedism above."
              : "No Tedisms match that search."}
          </p>
        ) : (
          <ul className="space-y-3">
            {visible.map((quote) => (
              <li key={quote.id}>
                <QuoteCard quote={quote} onVote={handleVote} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function SortToggle({
  sort,
  onChange,
}: {
  sort: SortOrder;
  onChange: (sort: SortOrder) => void;
}) {
  const options: { value: SortOrder; label: string }[] = [
    { value: "top", label: "Top" },
    { value: "new", label: "Newest" },
  ];

  return (
    <div role="group" aria-label="Sort quotes" className="flex rounded-xl border border-line p-0.5">
      {options.map((option) => {
        const active = sort === option.value;

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={[
              "rounded-[0.6rem] px-3 py-1.5 text-sm font-medium transition-colors",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
              active ? "bg-accent text-accent-ink" : "text-ink-soft hover:text-ink",
            ].join(" ")}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
