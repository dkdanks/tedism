import "server-only";

import postgres from "postgres";

let sql: postgres.Sql | null = null;
let schemaReady: Promise<void> | null = null;

export class DatabaseNotConfiguredError extends Error {
  constructor() {
    super("DATABASE_URL is not configured.");
    this.name = "DatabaseNotConfiguredError";
  }
}

function connectionString() {
  const raw = process.env.DATABASE_URL ?? process.env.SUPABASE_DATABASE_URL;
  const trimmed = raw?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}

export function isDatabaseConfigured() {
  return connectionString() !== null;
}

function client() {
  const url = connectionString();

  if (!url) {
    throw new DatabaseNotConfiguredError();
  }

  if (!sql) {
    sql = postgres(url, {
      max: 5,
      idle_timeout: 20,
      connect_timeout: 10,
      prepare: false,
    });
  }

  return sql;
}

/**
 * The schema is small and additive, so we create it on demand rather than
 * carrying a migration runner around. Every statement is `if not exists`, and
 * the promise is cached so the work happens once per server instance.
 */
function ensureSchema(db: postgres.Sql) {
  if (!schemaReady) {
    schemaReady = (async () => {
      await db.unsafe(`
        create extension if not exists "pgcrypto";

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
      `);
    })().catch((error) => {
      // Let the next request retry instead of caching the failure forever.
      schemaReady = null;
      throw error;
    });
  }

  return schemaReady;
}

export async function getDatabase() {
  const db = client();
  await ensureSchema(db);
  return db;
}
