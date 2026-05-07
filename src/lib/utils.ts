import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Humanize snake_case / kebab-case keys for display
 * (e.g. "overcoming_temptation" → "overcoming temptation").
 */
export function humanizeLabel(value: string): string {
  if (!value) return "";
  return value.replace(/[_-]+/g, " ").trim();
}

/**
 * Local-date YYYY-MM-DD (NOT UTC). Critical for prayer_date / streaks so
 * an evening prayer in PT doesn't get tagged as tomorrow.
 */
export function localDateStr(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
