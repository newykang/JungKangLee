import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Bookmark, Layers2 } from "lucide-react";
import { UpdateFeed } from "../UpdateFeed";
import brandWordmark from "../appdate-wordmark.png";
import { usePlatformFeed, type PlatformChoice } from "../usePlatformFeed";
import { AppGroupLanding, type AppGroup } from "../AppGroupLanding";
import { BankOverview } from "../BankOverview";
import { UpdateDetail } from "../../updates/UpdateDetail";
import { AppTimeline } from "../../updates/AppTimeline";
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
  "393499958": ["네이버", "생활"],
  "311867728": ["네이버지도", "생활"],
  "660616512": ["KB스타기업뱅킹", "은행"],
  "1470181651": ["우리WON뱅킹", "은행"],
  "1512902361": ["우리WON뱅킹 기업", "은행"],
  "357484932": ["신한 슈퍼SOL", "은행"],
  "587766126": ["신한 SOL Biz", "은행"],
};
const bankFeatures: Record<string, string[]> = {
  "373742138": ["개인 계좌 조회·이체", "KB국민인증서"],
  "660616512": ["기업 계좌·이체 관리", "기업 오픈뱅킹", "부동산 임대관리"],
  "1470181651": ["개인 계좌 조회·이체", "자산·소비 현황", "금융상품 가입"],
  "1512902361": ["개인사업자·법인 뱅킹", "대량이체", "이용자 권한별 메뉴"],
  "357484932": ["계좌 조회·이체", "간편결제·주식매매", "보험청구"],
  "587766126": ["기업 계좌 조회·이체", "급여이체", "통합 자금 관리"],
};
const summaries: Record<
  string,
  Partial<Pick<FeedUpdate, "added" | "improved" | "changed">>
> = {
  "362057947": {
    added: ["채팅방 공지 최대 10개 등록", "채팅방별 외국어 메시지 자동 번역"],
    changed: ["채팅방 게시판을 톡보드로 개편"],
    improved: ["사진·동영상 추가 시 게시물 편집 내용 유지"],
  },
  "373742138": {
    improved: ["일부 서비스 사용성 개선. 세부 내용 미공개."],
  },
  "839333328": { improved: ["버그 수정. 세부 내용 미공개."] },
  "304608425": {
    added: [
      "혼자 달리기 기능 추가",
      "즐겨찾기 그룹별 이모지 지정",
      "홈에서 최근 본 장소 확인",
    ],
  },
  "389801252": { improved: ["버그 수정", "성능 개선"] },
  "1232780281": { improved: ["버그 수정", "성능 개선"] },
  "431589174": { improved: ["성능 개선"] },
  "393499958": { improved: ["사용성 개선. 세부 내용 미공개."] },
  "311867728": { improved: ["앱 안정성 개선"] },
  "660616512": { improved: ["일부 서비스 사용성 개선. 세부 내용 미공개."] },
  "1470181651": { improved: ["앱 사용 환경 및 안정성 개선"] },
  "1512902361": { improved: ["앱 사용 환경 개선"] },
  "357484932": { improved: ["혜택 화면 개선", "버그 수정 및 사용성 개선"] },
  "587766126": { improved: ["서비스 안정성 개선"] },
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
  bankFeatures: bankFeatures[item.id],
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
  added: [],
  improved: [],
  changed: [],
  ...summaries[item.id],
}));
const key = "appdate.frontend.preview.myApps";
const groupKey = "appdate.frontend.preview.appGroups";
const groupNames: Record<string, string> = {
  "Kakao Corp.": "카카오",
  "NAVER Corp.": "네이버",
  "Kookmin Bank Co., Ltd.": "KB국민은행",
  "SHINHAN BANK": "신한은행",
  "Woori Bank": "우리은행",
};
const groups: AppGroup[] = Object.entries(groupNames)
  .map(([id, name]) => ({
    id,
    name,
    apps: apps.filter((app) => app.developer === id),
  }))
  .filter((group) => group.apps.length);
function readGroups(): string[] | null {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(groupKey) || "null");
    if (Array.isArray(saved))
      return saved.filter((id) => groups.some((group) => group.id === id));
  } catch {
    // Unavailable preferences start at group selection.
  }
  return null;
}
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
  const { platform, savePlatform, feedUpdates } = usePlatformFeed(updates);
  const [selected, setSelected] = useState(readSelection);
  const [selectedGroups, setSelectedGroups] = useState(readGroups);
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
  const [route, pathId, timelineReleaseId] = current.split("/");
  const timelineApp =
    route === "app" ? apps.find((app) => app.id === pathId) : undefined;
  const updateId = timelineApp ? timelineReleaseId : (pathId ?? route);
  const item = updates.find(
    (u) => u.id === updateId && (!timelineApp || u.appId === timelineApp.id),
  );
  const landing =
    route === "groups" ||
    (!route && selectedGroups === null && !selected.length);
  const banking = route === "banks";
  const groupApps = groups
    .filter((group) => selectedGroups?.includes(group.id))
    .flatMap((group) => group.apps.map((app) => app.id));
  const prioritized = [...new Set([...selected, ...groupApps])];
  function saveGroups(ids: string[], nextPlatform: PlatformChoice) {
    savePlatform(nextPlatform);
    setSelectedGroups(ids);
    try {
      localStorage.setItem(groupKey, JSON.stringify(ids));
    } catch {
      // Group selection remains active for this session.
    }
    location.hash = "feed";
  }
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
            <img className="brand-wordmark" src={brandWordmark} alt="appdate" />
          </span>
          <button
            className="ad-mine"
            hidden={landing}
            aria-expanded={editing}
            onClick={() => setEditing(!editing)}
          >
            <Bookmark size={16} /> 내 앱 {selected.length || ""}
          </button>
        </div>
      </header>
      {!landing && (
        <nav className="ad-view-nav" aria-label="앱 메뉴">
          <a href="#feed" aria-current={!banking ? "page" : undefined}>
            업데이트
          </a>
          <a href="#banks" aria-current={banking ? "page" : undefined}>
            은행 앱
          </a>
          <a href="#groups" onClick={() => setEditing(false)}>
            앱 그룹
          </a>
        </nav>
      )}
      {!landing && editing && (
        <div className="ad-panel">
          <fieldset>
            <legend>사용 중인 앱 추가 선택</legend>
            {apps.map((app) => (
              <label key={app.id}>
                <input
                  type="checkbox"
                  checked={prioritized.includes(app.id)}
                  disabled={groupApps.includes(app.id)}
                  onChange={() => toggle(app.id)}
                />
                {app.name}
              </label>
            ))}
          </fieldset>
        </div>
      )}
      <main>
        {landing && (
          <AppGroupLanding
            platform={platform}
            groups={groups}
            selected={selectedGroups ?? []}
            onSave={saveGroups}
          />
        )}
        <div hidden={landing || banking || Boolean(item || timelineApp)}>
          <UpdateFeed
            platform={platform}
            apps={apps}
            updates={feedUpdates}
            selectedAppIds={prioritized}
            onOpenUpdate={(u) => {
              location.hash = "app/" + u.appId;
            }}
          />
        </div>
        {timelineApp && !item && (
          <AppTimeline
            app={timelineApp}
            updates={feedUpdates}
            onOpenUpdate={(update) => {
              location.hash = "app/" + timelineApp.id + "/" + update.id;
            }}
            onBack={() => {
              location.hash = "feed";
            }}
          />
        )}
        {banking && !item && (
          <BankOverview
            apps={apps}
            updates={updates}
            onOpenUpdate={(update) => {
              location.hash = "banks/" + update.id;
            }}
          />
        )}
        {item && (
          <UpdateDetail
            app={apps.find((app) => app.id === item.appId)!}
            update={item}
            history={timelineApp ? feedUpdates : updates}
            onOpenUpdate={(item) => {
              location.hash =
                (timelineApp
                  ? "app/" + timelineApp.id + "/"
                  : banking
                    ? "banks/"
                    : "feed/") + item.id;
            }}
            onBack={() => {
              location.hash = timelineApp
                ? "app/" + timelineApp.id
                : banking
                  ? "banks"
                  : "feed";
            }}
            backLabel={
              timelineApp
                ? "앱 업데이트 기록"
                : banking
                  ? "은행 앱 한눈에 보기"
                  : undefined
            }
          />
        )}
      </main>
    </div>
  );
}
createRoot(document.getElementById("root")!).render(<Preview />);
