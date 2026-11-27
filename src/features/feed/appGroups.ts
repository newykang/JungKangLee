import type { AppGroup } from "./AppGroupLanding";
import type { FeedApp } from "./model";

const definitions = [
  { id: "kakao", name: "카카오", members: ["kakaotalk", "kakao-map", "kakao-t", "kakao-pay", "kakao-bank", "kakao-metro", "kakao-page", "kakao-webtoon"] },
  { id: "naver", name: "네이버", members: ["naver", "naver-map", "naver-webtoon"] },
  { id: "kb", name: "KB국민은행", members: ["kb-star", "kb-business"] },
  { id: "shinhan", name: "신한은행", members: ["shinhan-super-sol", "shinhan-business"] },
  { id: "woori", name: "우리은행", members: ["woori-won", "woori-business"] },
];
export function buildAppGroups(apps: readonly FeedApp[]): AppGroup[] {
  const byId = new Map(apps.map(app => [app.id, app]));
  return definitions.map(({ id, name, members }) => ({
    id, name,
    apps: members.flatMap(member => {
      const app = byId.get(member);
      return app ? [app] : [];
    }),
  })).filter(group => group.apps.length > 0);
}

interface GroupSelection {
  groups: string[];
  autoAdded: string[];
}
const groupKey = "appdate:app-groups:v1";
export function readAppGroups(): GroupSelection | null {
  try {
    const saved = JSON.parse(localStorage.getItem(groupKey) ?? "null");
    if (Array.isArray(saved?.groups) && Array.isArray(saved?.autoAdded)) {
      return {
        groups: saved.groups.filter((id: unknown) => typeof id === "string"),
        autoAdded: saved.autoAdded.filter((id: unknown) => typeof id === "string"),
      };
    }
  } catch {
    // A missing preference starts at group selection.
  }
  return null;
}
export function saveAppGroups(groups: AppGroup[], ids: string[], previous: GroupSelection | null, selected: readonly string[]) {
  const previousIds = new Set(previous?.groups);
  const activeGroups = groups.filter(group => ids.includes(group.id));
  const activeApps = new Set(activeGroups.flatMap(group => group.apps.map(app => app.id)));
  const autoAdded = new Set(previous?.autoAdded.filter(id => activeApps.has(id) && selected.includes(id)));
  const next = new Set(selected.filter(id => activeApps.has(id) || !previous?.autoAdded.includes(id)));
  for (const group of activeGroups) {
    if (previousIds.has(group.id)) continue;
    for (const app of group.apps) {
      if (!next.has(app.id)) autoAdded.add(app.id);
      next.add(app.id);
    }
  }
  const preferences = { groups: ids, autoAdded: [...autoAdded] };
  try {
    localStorage.setItem(groupKey, JSON.stringify(preferences));
  } catch {
    // Keep the updated preferences for this session.
  }
  return { preferences, selected: [...next] };
}
