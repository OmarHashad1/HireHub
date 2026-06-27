import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function relativeTime(date: string | Date | null | undefined) {
  if (!date) return "";
  const then = new Date(date).getTime();
  const diff = Date.now() - then;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.round(months / 12)}y ago`;
}

export function countdown(date: string | Date | null | undefined) {
  if (!date) return null;
  const diff = new Date(date).getTime() - Date.now();
  if (diff <= 0) return "Closed";
  const days = Math.floor(diff / 86400000);
  if (days >= 1) return `${days}d left`;
  const hrs = Math.floor(diff / 3600000);
  return `${hrs}h left`;
}

export function formatSalary(salary?: {
  min?: number | null;
  max?: number | null;
  currency?: string | null;
}) {
  if (!salary || (salary.min == null && salary.max == null)) return null;
  const cur = salary.currency ?? "";
  const fmt = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : `${n}`;
  if (salary.min != null && salary.max != null)
    return `${fmt(salary.min)}–${fmt(salary.max)} ${cur}`.trim();
  const single = salary.min ?? salary.max!;
  return `${fmt(single)} ${cur}`.trim();
}

export function titleCase(value: string) {
  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Soft pastel pairs drawn from the --tag-* design tokens. Referenced as raw
// CSS vars (not Tailwind classes) so the choice can be made at runtime without
// dynamic class names getting purged.
const ACCENTS = [
  { bg: "--tag-lavender", text: "--tag-text-lavender" },
  { bg: "--tag-sky", text: "--tag-text-sky" },
  { bg: "--tag-mint", text: "--tag-text-mint" },
  { bg: "--tag-peach", text: "--tag-text-peach" },
  { bg: "--tag-rose", text: "--tag-text-rose" },
  { bg: "--tag-yellow", text: "--tag-text-yellow" },
] as const;

/** Picks a stable pastel accent for a string (same input → same colors). */
export function accentFromString(seed?: string | null) {
  const key = seed && seed.length ? seed : "·";
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) | 0;
  }
  const { bg, text } = ACCENTS[Math.abs(hash) % ACCENTS.length]!;
  return { bg: `var(${bg})`, text: `var(${text})` };
}

export function pluralize(count: number, singular: string, plural?: string) {
  return `${count} ${count === 1 ? singular : (plural ?? `${singular}s`)}`;
}

export function initials(name?: string | null) {
  if (!name) return "·";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}
