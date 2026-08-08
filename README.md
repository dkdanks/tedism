# Tedism&rsquo;s

A running collection of the things Ted says. Anyone with the link can add a quote, upvote the
greats, and expand a quote to read the context behind it.

- **Submit** a quote, with an optional context note and an optional first name.
- **Anonymous by default** — leave the name blank and it posts as "Added anonymously".
- **Date stamped** — every quote records when it was added.
- **Upvote** anything, once per person, and toggle your vote off again.
- **Sort** by Top or Newest, and search across quotes, context and contributors.

## Stack

Next.js (App Router) · React · Tailwind CSS · Postgres.

## Running locally

```bash
npm install
cp .env.example .env.local   # then fill in DATABASE_URL
npm run dev
```

Open http://localhost:3000.

Without a `DATABASE_URL` the site still boots and shows a short setup notice instead of the board.

## Database

Any Postgres works — Supabase, Neon, Vercel Postgres, or a local instance. Point `DATABASE_URL` at
it and the tables are created on the first request; `db/schema.sql` has the same statements if you
would rather apply them by hand.

Two tables:

| Table         | What it holds                                                            |
| ------------- | ------------------------------------------------------------------------ |
| `quotes`      | The quote, optional context, optional first name, timestamp, vote count. |
| `quote_votes` | One row per (quote, voter) so a person can only upvote a quote once.     |

## How voting stays honest-ish

There are no accounts. `middleware.ts` drops a long-lived random `tedisms_voter` cookie on each
visitor and votes are keyed to it, which stops accidental double-voting and casual button mashing.
Anyone determined enough to clear their cookies can vote twice — for a family quote wall that
tradeoff beats making everyone sign in.

## Deploying to Vercel

1. Import the repository.
2. Add `DATABASE_URL` as an environment variable (Production, Preview and Development).
3. Deploy, then share the URL.

`vercel.json` pins functions to the `syd1` region — change it if the database lives elsewhere.
