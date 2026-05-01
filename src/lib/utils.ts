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
