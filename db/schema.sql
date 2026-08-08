-- Tedism's schema.
-- Applied automatically on first database access (see src/server/database.ts),
-- and safe to run by hand against a fresh Postgres/Supabase database.

-- Requires Postgres 13+ for the built-in gen_random_uuid().

create table if not exists quotes (
  id          uuid primary key default gen_random_uuid(),
  quote       text        not null,
  context     text,
  author      text,
  created_at  timestamptz not null default now(),
  vote_count  integer     not null default 0
);

create table if not exists quote_votes (
  quote_id    uuid        not null references quotes (id) on delete cascade,
  voter_token text        not null,
  created_at  timestamptz not null default now(),
  primary key (quote_id, voter_token)
);

create index if not exists quotes_created_at_idx on quotes (created_at desc);
create index if not exists quotes_vote_count_idx on quotes (vote_count desc, created_at desc);
create index if not exists quote_votes_voter_idx on quote_votes (voter_token);
