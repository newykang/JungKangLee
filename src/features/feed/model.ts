// Structural subsets of AppInfo and AppUpdate let the shell pass its own records directly.
export interface FeedApp {
  id: string;
  name: string;
  category: string;
  iconUrl: string;
  storeUrl: string;
}
export interface FeedUpdate {
  id: string;
  appId: string;
  version: string;
  platform: "ios" | "android";
  releaseDate: string;
  releaseNotes: string;
  added: string[];
  improved: string[];
  changed: string[];
  sourceUrl: string;
}
export const sections = [
  { key: "added", label: "추가" },
  { key: "improved", label: "개선" },
  { key: "changed", label: "변경" },
] as const;
export function dateLabel(date: string) {
  return date.slice(0, 10).replaceAll("-", ".");
}
export function platformLabel(update: FeedUpdate) {
  return update.platform === "ios" ? "iOS" : "Android";
}
export function headline(update: FeedUpdate) {
  for (const section of sections) {
    if (update[section.key].length) return update[section.key][0];
  }
  return update.releaseNotes.trim().split("\n")[0] || "세부 내용 미공개";
}
export function safeLink(value: string) {
  try {
    return new URL(value).protocol === "https:" ? value : undefined;
  } catch {
    return undefined;
  }
}
