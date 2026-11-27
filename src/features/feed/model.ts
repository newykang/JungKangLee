// Structural subsets of AppInfo and AppUpdate let the shell pass its own records directly.
export interface FeedApp {
  id: string;
  name: string;
  category: string;
  developer?: string;
  bankFeatures?: readonly string[];
  /** Set when the catalog has verified a mandatory latest-version policy. */
  requiresLatestVersion?: boolean;
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
  /** Set for a verified release containing only bug fixes. */
  bugFixOnly?: boolean;
}
export const sections = [
  { key: "added", label: "추가" },
  { key: "improved", label: "개선" },
  { key: "changed", label: "변경" },
] as const;
export function isBugFixOnly(update: FeedUpdate) {
  if (update.bugFixOnly !== undefined) return update.bugFixOnly;
  if (update.added.length || update.changed.length) return false;
  const genericFix =
    /^(?:버그\s*(?:수정|픽스)|오류\s*수정|bug\s*fix(?:es)?)[.!]?$/i;
  return [update.releaseNotes, ...update.improved].every((line) =>
    genericFix.test(line.trim()),
  );
}
export function dateLabel(date: string) {
  return date.slice(0, 10).replaceAll("-", ".");
}
export function platformLabel(update: FeedUpdate) {
  return update.platform === "ios" ? "iOS" : "Android";
}
export function feedChanges(update: FeedUpdate) {
  const classified = sections.flatMap(({ key, label }) =>
    update[key].map((text) => ({ label, text })),
  );
  const source = classified.length
    ? classified
    : [{ label: "원문", text: update.releaseNotes }];
  const items = source.flatMap(({ label, text }) =>
    text
      .split(/\r?\n/)
      .map((line) => ({
        label,
        text: line
          .trim()
          .replace(/^[•●]\s*/, "")
          .replace(/(?:^|\s)세부 내용 미공개[.]?$/, "")
          .trim()
          .replace(/[.]$/, ""),
      }))
      .filter((item) => item.text),
  );
  const limited =
    !items.length ||
    source.some(({ text }) => text.includes("세부 내용 미공개"));
  return { items, limited };
}
export function safeLink(value: string) {
  try {
    return new URL(value).protocol === "https:" ? value : undefined;
  } catch {
    return undefined;
  }
}
