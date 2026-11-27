import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Bookmark, Layers2 } from "lucide-react";
import { UpdateFeed } from "../UpdateFeed";
import { UpdateDetail } from "../../updates/UpdateDetail";
import type { FeedApp, FeedUpdate } from "../model";
import snapshot from "./releases.json";

const labels: Record<string, [string, string]> = {
  "362057947": ["카카오톡", "SNS"],
  "373742138": ["KB스타뱅킹", "은행"],
  "839333328": ["토스", "금융"],
  "304608425": ["카카오맵", "생활"],
  "389801252": ["인스타그램", "SNS"],
  "1232780281": ["Notion", "생산성"],
  "431589174": ["티맵", "생활"],
};
const summaries: Record<
  string,
  Partial<Pick<FeedUpdate, "added" | "improved" | "changed">>
> = {
  "362057947": {
    added: [
      "채팅방 공지를 최대 10개까지 등록할 수 있어요.",
      "채팅방별로 외국어 메시지 자동 번역을 설정할 수 있어요.",
    ],
    changed: ["채팅방 게시판이 톡보드로 바뀌었어요."],
    improved: ["사진이나 동영상을 더 넣어도 게시물 편집 내용이 유지돼요."],
  },
  "373742138": {
    improved: ["일부 서비스 사용성 개선. 세부 내용 미공개."],
  },
  "839333328": { improved: ["버그를 수정했어요. 세부 내용 미공개."] },
  "304608425": {
    added: [
      "혼자 달리기 기능 추가",
      "즐겨찾기 그룹에 이모지를 지정할 수 있어요.",
      "홈에서 최근 본 장소를 확인할 수 있어요.",
    ],
  },
  "389801252": { improved: ["버그를 수정하고 성능을 개선했어요."] },
  "1232780281": { improved: ["버그를 수정하고 성능을 개선했어요."] },
  "431589174": { improved: ["원활한 사용을 위해 성능을 개선했어요."] },
};
const icons = import.meta.glob<string>("./icons/*.jpg", {
  eager: true,
  query: "?url",
  import: "default",
});
const apps: FeedApp[] = snapshot.map((item) => ({
  id: item.id,
  name: labels[item.id][0],
  category: labels[item.id][1],
  developer: item.developer,
  iconUrl: icons["./icons/" + item.id + ".jpg"],
  storeUrl: item.url,
}));
const updates: FeedUpdate[] = snapshot.map((item) => ({
  id: item.id + "-" + item.version,
  appId: item.id,
  version: item.version,
  platform: "ios",
  releaseDate: item.date.slice(0, 10),
  releaseNotes: item.notes,
  sourceUrl: item.url,
  bugFixOnly: item.id === "839333328" && item.version === "5.286.0",
  added: [],
  improved: [],
  changed: [],
  ...summaries[item.id],
}));
const key = "appdate.frontend.preview.myApps";
function readSelection(): string[] {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(saved)
      ? saved.filter((id) => apps.some((app) => app.id === id))
      : [];
  } catch {
    return [];
  }
}
function Preview() {
  const [selected, setSelected] = useState(readSelection);
  const [editing, setEditing] = useState(false);
  const [current, setCurrent] = useState(location.hash.slice(1));
  useEffect(() => {
    const sync = () => {
      setCurrent(location.hash.slice(1));
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);
  const item = updates.find((u) => u.id === current);
  function toggle(id: string) {
    const next = selected.includes(id)
      ? selected.filter((value) => value !== id)
      : [...selected, id];
    setSelected(next);
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      /* Selection still works for this session. */
    }
  }
  return (
    <div className="ad-shell">
      <header className="ad-bar">
        <div className="ad-bar-inner">
          <span className="ad-brand">
            <span className="ad-brand-mark">
              <Layers2 size={18} />
            </span>
            appdate
          </span>
          <button
            className="ad-mine"
            aria-expanded={editing}
            onClick={() => setEditing(!editing)}
          >
            <Bookmark size={16} /> 내 앱 {selected.length || ""}
          </button>
        </div>
      </header>
      {editing && (
        <div className="ad-panel">
          <fieldset>
            <legend>사용 중인 앱 선택</legend>
            {apps.map((app) => (
              <label key={app.id}>
                <input
                  type="checkbox"
                  checked={selected.includes(app.id)}
                  onChange={() => toggle(app.id)}
                />
                {app.name}
              </label>
            ))}
          </fieldset>
        </div>
      )}
      <main>
        <div hidden={Boolean(item)}>
          <UpdateFeed
            apps={apps}
            updates={updates}
            selectedAppIds={selected}
            onOpenUpdate={(u) => {
              location.hash = u.id;
            }}
          />
        </div>
        {item && (
          <UpdateDetail
            app={apps.find((app) => app.id === item.appId)!}
            update={item}
            history={updates}
            onBack={() => {
              location.hash = "";
            }}
          />
        )}
      </main>
    </div>
  );
}
createRoot(document.getElementById("root")!).render(<Preview />);
