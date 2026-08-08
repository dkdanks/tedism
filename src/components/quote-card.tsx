"use client";

import { useId, useState } from "react";

import { formatDay, formatExact } from "@/lib/format";
import type { Quote } from "@/lib/types";

type QuoteCardProps = {
  quote: Quote;
  onVote: (id: string) => void;
};

export function QuoteCard({ quote, onVote }: QuoteCardProps) {
  const [expanded, setExpanded] = useState(false);
  const contextId = useId();
  const hasContext = Boolean(quote.context);

  return (
    <article className="rounded-2xl border border-line bg-card p-5 shadow-[0_1px_2px_rgba(35,32,27,0.04)] sm:p-6">
      <div className="flex gap-4">
        <VoteButton
          count={quote.voteCount}
          hasVoted={quote.hasVoted}
          onClick={() => onVote(quote.id)}
          quote={quote.quote}
        />

        <div className="min-w-0 flex-1">
          <blockquote className="font-serif text-lg leading-snug text-ink sm:text-xl">
            &ldquo;{quote.quote}&rdquo;
          </blockquote>

          {/* The toggle sits on its own line below the byline so a narrow screen
              never strands the separator dot at the start of a wrapped row. */}
          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-soft">
            <span>{quote.author ? `Added by ${quote.author}` : "Added anonymously"}</span>
            <span aria-hidden="true">&middot;</span>
            <time dateTime={quote.createdAt} title={formatExact(quote.createdAt)}>
              {formatDay(quote.createdAt)}
            </time>

            {hasContext ? (
              <button
                type="button"
                onClick={() => setExpanded((value) => !value)}
                aria-expanded={expanded}
                aria-controls={contextId}
                className="inline-flex basis-full items-center gap-1 rounded font-medium text-accent underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:basis-auto sm:before:mr-2 sm:before:text-ink-soft sm:before:content-['·']"
              >
                {expanded ? "Hide context" : "What happened?"}
                <Chevron expanded={expanded} />
              </button>
            ) : null}
          </div>

          {hasContext ? (
            <div id={contextId} hidden={!expanded} className="mt-3">
              <p className="whitespace-pre-line border-l-2 border-line pl-4 text-[0.95rem] leading-relaxed text-ink-soft">
                {quote.context}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

type VoteButtonProps = {
  count: number;
  hasVoted: boolean;
  onClick: () => void;
  quote: string;
};

function VoteButton({ count, hasVoted, onClick, quote }: VoteButtonProps) {
  const label = `${hasVoted ? "Remove your upvote from" : "Upvote"} "${quote}"`;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={hasVoted}
      aria-label={label}
      title={hasVoted ? "Remove your upvote" : "Upvote"}
      className={[
        "flex h-14 w-12 shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl border transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        hasVoted
          ? "border-accent bg-accent-soft text-accent"
          : "border-line bg-transparent text-ink-soft hover:border-accent hover:text-accent",
      ].join(" ")}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
        <path
          d="M12 5.5 19 14H5z"
          fill={hasVoted ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-sm font-semibold tabular-nums">{count}</span>
    </button>
  );
}

function Chevron({ expanded }: { expanded: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
    >
      <path
        d="m6 9 6 6 6-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
