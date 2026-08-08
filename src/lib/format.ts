/**
 * Dates render on the server and again on the client, so the formatter is
 * pinned to one locale and time zone — otherwise the two passes disagree and
 * React reports a hydration mismatch.
 */
const DISPLAY_TIME_ZONE = "Australia/Sydney";

const dayFormatter = new Intl.DateTimeFormat("en-AU", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: DISPLAY_TIME_ZONE,
});

const exactFormatter = new Intl.DateTimeFormat("en-AU", {
  dateStyle: "full",
  timeStyle: "short",
  timeZone: DISPLAY_TIME_ZONE,
});

export function formatDay(iso: string) {
  return dayFormatter.format(new Date(iso));
}

export function formatExact(iso: string) {
  return exactFormatter.format(new Date(iso));
}

export function formatCount(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}
