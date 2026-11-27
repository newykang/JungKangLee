import type { AppGroup } from "./AppGroupLanding";
import type { FeedApp } from "./model";

const definitions = [
  {
    id: "kakao",
    name: "카카오",
    members: [
      "kakaotalk",
      "kakao-map",
      "kakao-t",
      "kakao-pay",
      "kakao-bank",
      "kakao-metro",
      "kakao-page",
      "kakao-webtoon",
    ],
  },
  {
    id: "naver",
    name: "네이버",
    members: ["naver", "naver-map", "naver-webtoon"],
  },
  { id: "kb", name: "KB국민은행", members: ["kb-star", "kb-business"] },
  {
    id: "shinhan",
    name: "신한은행",
    members: ["shinhan-super-sol", "shinhan-business"],
  },
  { id: "woori", name: "우리은행", members: ["woori-won", "woori-business"] },
];
const bankGroupNames: Record<string, string> = {
  "Hana Bank": "하나은행",
  NH농협은행: "NH농협은행",
  "National Agricultural Cooperative Federation": "농협중앙회",
  "INDUSTRIAL BANK OF KOREA": "IBK기업은행",
  "iM Bank Co., Ltd.": "iM뱅크",
  "Busan Bank": "BNK부산은행",
  KYONGNAMBANK: "BNK경남은행",
  "The Kwangju Bank, Ltd.": "광주은행",
  "JEONBUK BANK": "전북은행",
  "Jeju Bank": "제주은행",
};
export function buildAppGroups(apps: readonly FeedApp[]): AppGroup[] {
  const byId = new Map(apps.map((app) => [app.id, app]));
  const initial = definitions
    .map(({ id, name, members }) => ({
      id,
      name,
      apps: members.flatMap((member) => {
        const app = byId.get(member);
        return app ? [app] : [];
      }),
    }))
    .filter((group) => group.apps.length > 0);
  const included = new Set(
    initial.flatMap((group) => group.apps.map((app) => app.id)),
  );
  const publishers = new Map<string, AppGroup>();
  for (const app of apps) {
    const publisher = app.developer?.trim();
    if (!publisher || app.category !== "은행" || included.has(app.id)) continue;
    const group = publishers.get(publisher) ?? {
      id: "bank:" + publisher,
      name: bankGroupNames[publisher] ?? publisher,
      apps: [],
    };
    group.apps.push(app);
    publishers.set(publisher, group);
  }
  return [
    ...initial,
    ...[...publishers.values()].sort((a, b) =>
      a.name.localeCompare(b.name, "ko"),
    ),
  ];
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
        autoAdded: saved.autoAdded.filter(
          (id: unknown) => typeof id === "string",
        ),
      };
    }
  } catch {
    // A missing preference starts at group selection.
  }
  return null;
}
export function saveAppGroups(
  groups: AppGroup[],
  ids: string[],
  previous: GroupSelection | null,
  selected: readonly string[],
) {
  const activeGroups = groups.filter((group) => ids.includes(group.id));
  const activeApps = new Set(
    activeGroups.flatMap((group) => group.apps.map((app) => app.id)),
  );
  const autoAdded = new Set(
    previous?.autoAdded.filter(
      (id) => activeApps.has(id) && selected.includes(id),
    ),
  );
  const next = new Set(
    selected.filter(
      (id) => activeApps.has(id) || !previous?.autoAdded.includes(id),
    ),
  );
  for (const group of activeGroups) {
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
