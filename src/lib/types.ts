export type SortOrder = "top" | "new";

export const SORT_ORDERS: SortOrder[] = ["top", "new"];

export function parseSortOrder(value: string | null | undefined): SortOrder {
  return value === "new" ? "new" : "top";
}

export type Quote = {
  id: string;
  quote: string;
  context: string | null;
  author: string | null;
  createdAt: string;
  voteCount: number;
  hasVoted: boolean;
};

export const QUOTE_MAX_LENGTH = 500;
export const CONTEXT_MAX_LENGTH = 1000;
export const AUTHOR_MAX_LENGTH = 40;
