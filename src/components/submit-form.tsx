"use client";

import { useRef, useState } from "react";

import { AUTHOR_MAX_LENGTH, CONTEXT_MAX_LENGTH, QUOTE_MAX_LENGTH } from "@/lib/types";
import type { NewQuoteInput } from "@/lib/validation";

type SubmitFormProps = {
  onSubmit: (input: NewQuoteInput) => Promise<string | null>;
};

const fieldClasses =
  "w-full rounded-xl border border-line bg-card px-3.5 py-2.5 text-ink placeholder:text-ink-soft/70 focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent";

export function SubmitForm({ onSubmit }: SubmitFormProps) {
  // Collapsed by default: most visits are for reading the collection, not adding to it.
  const [open, setOpen] = useState(false);
  const [quote, setQuote] = useState("");
  const [context, setContext] = useState("");
  const [author, setAuthor] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);
  const quoteRef = useRef<HTMLTextAreaElement>(null);

  if (!open) {
    return (
      <div>
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            setSaved(false);
            requestAnimationFrame(() => quoteRef.current?.focus());
          }}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-line bg-card px-5 py-4 font-semibold text-ink transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <span aria-hidden="true" className="text-lg leading-none">
            +
          </span>
          Add a Tedism
        </button>

        {saved ? (
          <p aria-live="polite" className="mt-2 text-center text-sm text-ink-soft">
            Added. Keep them coming.
          </p>
        ) : null}
      </div>
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (pending) {
      return;
    }

    setPending(true);
    setError(null);
    setSaved(false);

    const failure = await onSubmit({ quote, context, author });

    if (failure) {
      setError(failure);
    } else {
      // The name is deliberately kept — the same person usually adds a few in a row.
      setQuote("");
      setContext("");
      setSaved(true);
      setOpen(false);
    }

    setPending(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-line bg-card p-5 shadow-[0_1px_2px_rgba(35,32,27,0.04)] sm:p-6"
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="quote" className="mb-1.5 block text-sm font-semibold text-ink">
            What did Ted say?
          </label>
          <textarea
            id="quote"
            name="quote"
            ref={quoteRef}
            required
            rows={2}
            maxLength={QUOTE_MAX_LENGTH}
            value={quote}
            onChange={(event) => setQuote(event.target.value)}
            placeholder="Quote it word for word."
            className={`${fieldClasses} font-serif text-lg leading-snug`}
          />
        </div>

        <div>
          <label htmlFor="context" className="mb-1.5 block text-sm font-semibold text-ink">
            Context <span className="font-normal text-ink-soft">(optional)</span>
          </label>
          <textarea
            id="context"
            name="context"
            rows={2}
            maxLength={CONTEXT_MAX_LENGTH}
            value={context}
            onChange={(event) => setContext(event.target.value)}
            placeholder="Where were you, who was there, what set him off?"
            className={fieldClasses}
          />
          <p className="mt-1.5 text-sm text-ink-soft">
            Hidden until someone taps &ldquo;What happened?&rdquo; on the quote.
          </p>
        </div>

        <div>
          <label htmlFor="author" className="mb-1.5 block text-sm font-semibold text-ink">
            Your first name <span className="font-normal text-ink-soft">(optional)</span>
          </label>
          <input
            id="author"
            name="author"
            type="text"
            autoComplete="given-name"
            maxLength={AUTHOR_MAX_LENGTH}
            value={author}
            onChange={(event) => setAuthor(event.target.value)}
            placeholder="Leave blank to post anonymously"
            className={`${fieldClasses} sm:max-w-xs`}
          />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending || quote.trim().length === 0}
          className="rounded-xl bg-accent px-5 py-2.5 font-semibold text-accent-ink transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Adding…" : "Add it"}
        </button>

        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
          className="rounded-xl px-2 py-2.5 text-sm font-medium text-ink-soft hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Cancel
        </button>

        <p aria-live="polite" className="text-sm">
          {error ? <span className="text-accent">{error}</span> : null}
        </p>
      </div>
    </form>
  );
}
