import { z } from "zod";

import { AUTHOR_MAX_LENGTH, CONTEXT_MAX_LENGTH, QUOTE_MAX_LENGTH } from "@/lib/types";

/** Trims a string field and turns blank input into `undefined`. */
const optionalText = (max: number, label: string) =>
  z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return undefined;
      }
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : undefined;
    },
    z.string().max(max, `${label} must be ${max} characters or fewer.`).optional(),
  );

export const newQuoteSchema = z.object({
  quote: z
    .string({ error: "A quote is required." })
    .trim()
    .min(2, "That quote is a little too short.")
    .max(QUOTE_MAX_LENGTH, `Quotes must be ${QUOTE_MAX_LENGTH} characters or fewer.`),
  context: optionalText(CONTEXT_MAX_LENGTH, "Context"),
  author: optionalText(AUTHOR_MAX_LENGTH, "Your name"),
});

export type NewQuoteInput = z.infer<typeof newQuoteSchema>;
