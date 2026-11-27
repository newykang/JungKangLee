// Structural subsets of AppInfo and AppUpdate let the shell pass its own records directly.
export interface FeedApp {
  id: string;
  name: string;
  category: string;
  developer?: string;
  aliases?: readonly string[];
  nameHistory?: readonly { name: string; aliases: readonly string[]; message: string }[];
  bankFeatures?: readonly string[];
  /** Set when the catalog has verified a mandatory latest-version policy. */
  requiresLatestVersion?: boolean;
  iconUrl: string;
  fallbackIconUrl?: string;
  storeUrl: string;
}
export interface FeedUpdate {
  id: string;
  appId: string;
  version: string;
  platform: "ios" | "android";
  releaseDate: string;
  releaseNotes: string;
  notesAreExcerpt?: boolean;
  releaseCaptureUrl?: string;
  summaryKo?: string | null;
  added: string[];
  improved: string[];
  changed: string[];
  sourceUrl: string;
  /** Optional catalog override for releases without specific user-facing changes. */
  bugFixOnly?: boolean;
}
export const sections = [
  { key: "added", label: "추가" },
  { key: "improved", label: "개선" },
  { key: "changed", label: "변경" },
] as const;
const genericMaintenance =
  /^(?:(?:앱(?:의|\s*사용\s*중)?|서비스|사용자?|이용|일부|기타|소소한|전반적인)\s*)*(?:버그|오류|사용성|편의성|안정성|성능|사용\s*환경|기능|불편한\s*부분|앱)(?:을|를|이|가|의)?\s*(?:수정|개선|향상|최적화|픽스)(?:합니다|했습니다|하였습니다|했어요|되었습니다|됐습니다|됐어요)?$/;
const genericNotes = new Set([
  "세부 내용 미공개",
  "구체적인 변경 사항 미공개",
  "앱 안정성을 높이기 위한 수정이 포함됐습니다",
  "앱 안정화를 위한 관련 수정",
  "안정화",
  "안정선 개선",
  "(공식 원문 발췌)",
]);
const genericEnglish =
  /^(?:bug fixes?|(?:performance|stability|usability) improvements?|minor fixes)$/i;

export function isBugFixOnly(update: FeedUpdate) {
  if (update.bugFixOnly !== undefined) return update.bugFixOnly;
  const classified = sections.flatMap(({ key }) => update[key]);
  const notes = classified.some((line) => line.trim())
    ? classified
    : [update.releaseNotes];
  return notes
    .flatMap((line) =>
      line.split(
        /[\r\n]+|[.!。](?:\s+|$)|\s+및\s+|(?<=수정|개선|향상)하고\s+|\s+(?:and|&)\s+/i,
      ),
    )
    .map((line) => line.replace(/^[\s•●·*–—-]+/, "").trim())
    .filter(Boolean)
    .every(
      (line) =>
        genericNotes.has(line) ||
        genericMaintenance.test(line) ||
        genericEnglish.test(line),
    );
}
export function dateLabel(date: string) {
  return date.slice(0, 10).replaceAll("-", ".");
}
export function latestUpdatesByPlatform(updates: readonly FeedUpdate[]) {
  const latest = new Map<string, FeedUpdate>();
  for (const update of updates) {
    const key = update.appId + ":" + update.platform;
    const current = latest.get(key);
    if (!current || update.releaseDate > current.releaseDate)
      latest.set(key, update);
  }
  return [...latest.values()];
}
export function platformLabel(update: FeedUpdate) {
  return update.platform === "ios" ? "iOS" : "Android";
}
export function feedChanges(update: FeedUpdate) {
  if (isBugFixOnly(update)) {
    return {
      items: [{ label: "버그 픽스", text: "구체적인 변경 사항 미공개" }],
      limited: false,
    };
  }
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
