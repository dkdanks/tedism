import { Board } from "@/components/board";
import { parseSortOrder } from "@/lib/types";
import { isDatabaseConfigured } from "@/server/database";
import { getVoterToken, listQuotes } from "@/server/quotes";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ sort?: string }>;
};

export default async function HomePage({ searchParams }: PageProps) {
  const { sort: sortParam } = await searchParams;
  const sort = parseSortOrder(sortParam);

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
      <header className="mb-8">
        <h1 className="font-serif text-4xl tracking-tight text-ink sm:text-5xl">Tedism&rsquo;s</h1>
        <p className="mt-2 text-ink-soft">
          A running collection of the things Ted says. Add one, upvote the greats, and expand a
          quote to find out what on earth was going on.
        </p>
      </header>

      {isDatabaseConfigured() ? <QuoteBoard sort={sort} /> : <SetupNotice />}

      <footer className="mt-14 border-t border-line pt-6 text-sm text-ink-soft">
        Every quote is date stamped. Add your first name or stay anonymous — your call.
      </footer>
    </main>
  );
}

async function QuoteBoard({ sort }: { sort: ReturnType<typeof parseSortOrder> }) {
  let quotes;

  try {
    quotes = await listQuotes(sort, await getVoterToken());
  } catch (error) {
    console.error("[page] failed to load quotes", error);

    return (
      <p className="rounded-2xl border border-line bg-card px-5 py-10 text-center text-ink-soft">
        The Tedisms are having a moment. Refresh in a bit.
      </p>
    );
  }

  return <Board initialQuotes={quotes} initialSort={sort} />;
}

function SetupNotice() {
  return (
    <div className="rounded-2xl border border-line bg-card p-6">
      <h2 className="font-semibold text-ink">Almost there</h2>
      <p className="mt-2 text-ink-soft">
        Set <code className="rounded bg-accent-soft px-1.5 py-0.5 text-accent">DATABASE_URL</code> to
        a Postgres connection string and reload. The tables are created automatically on the first
        request — see <code className="text-ink">README.md</code> for the two-minute version.
      </p>
    </div>
  );
}
