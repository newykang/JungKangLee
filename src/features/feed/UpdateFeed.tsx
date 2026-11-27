import { useState } from "react";
import { ChevronRight, BookmarkCheck, Search, SlidersHorizontal, X } from "lucide-react";
import { AppIcon } from "./AppIcon";
import { searchApps } from "./search";
import { useFeedPreferences } from "./preferences";
import { platformNames, type PlatformChoice } from "./usePlatformFeed";
import {
  isBugFixOnly,
  dateLabel,
  feedChanges,
  latestUpdatesByPlatform,
  platformLabel,
  type FeedApp,
  type FeedUpdate,
} from "./model";
import "./feed.css";

interface Props {
  platform: PlatformChoice;
  apps: readonly FeedApp[];
  updates: readonly FeedUpdate[];
  selectedAppIds: readonly string[];
  onOpenUpdate: (update: FeedUpdate) => void;
}
export function UpdateFeed({
  platform,
  apps,
  updates,
  selectedAppIds,
  onOpenUpdate,
}: Props) {
  const [query, setQuery] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [publisher, setPublisher] = useState("");
  const { preferences, save } = useFeedPreferences();
  const { showBugFixes, hideRequired, markedIds, mineOnly } = preferences;
  const categories = [...new Set(apps.map((app) => app.category))];
  const publisherOf = (app: FeedApp) =>
    app.developer?.trim() || "운영사 미확인";
  const publishers = [...new Set(apps.map(publisherOf))].sort((a, b) =>
    a.localeCompare(b, "ko"),
  );
  const selected = new Set(selectedAppIds);
  const catalog = new Map(apps.map((app) => [app.id, app]));
  const matches = searchApps(apps, query);
  const filtered = Boolean(mineOnly || query.trim() || category || publisher || hideRequired || !showBugFixes);
  const adjusted = Boolean(category || publisher || hideRequired || !showBugFixes);
  const visibleApps = new Set<string>();
  const rows = latestUpdatesByPlatform(updates)
    .flatMap((update) => {
      const app = catalog.get(update.appId);
      if (
        !app || !matches.has(app.id) || (mineOnly && !selected.has(app.id)) ||
        (category && app.category !== category) ||
        (publisher && publisherOf(app) !== publisher) ||
        (hideRequired &&
          (app.requiresLatestVersion || markedIds.includes(app.id))) ||
        (!showBugFixes && isBugFixOnly(update))
      )
        return [];
      return [{ app, update }];
    })
    .sort(
      (a, b) =>
        Number(selected.has(b.app.id)) - Number(selected.has(a.app.id)) ||
        b.update.releaseDate.localeCompare(a.update.releaseDate) ||
        Number(b.update.version !== "미확인") -
          Number(a.update.version !== "미확인") ||
        Number(b.update.platform === "ios") -
          Number(a.update.platform === "ios") ||
        a.update.id.localeCompare(b.update.id),
    )
    .filter(({ app }) => {
      if (visibleApps.has(app.id)) return false;
      visibleApps.add(app.id);
      return true;
    });
  return (
    <section className="ad-feed">
      <h1>업데이트 피드</h1>
      <div className="ad-search">
        <Search size={19} />
        <input
          aria-label="앱 이름 검색"
          value={query}
          placeholder="지금 이름이나 예전 이름 검색"
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button aria-label="검색어 지우기" onClick={() => setQuery("")}>
            <X size={17} />
          </button>
        )}
      </div>
      <div className="ad-feed-tools">
        <button type="button" aria-pressed={mineOnly} onClick={() => save({ mineOnly: !mineOnly })}>
          <BookmarkCheck size={18} aria-hidden="true" />내 앱만 보기
        </button>
        <button type="button" aria-expanded={settingsOpen} aria-controls="feed-settings" onClick={() => setSettingsOpen(!settingsOpen)}>
          <SlidersHorizontal size={18} aria-hidden="true" />보기 설정{adjusted && ' · 적용 중'}
        </button>
      </div>
      <div id="feed-settings" hidden={!settingsOpen}>
        <a className="ad-group-settings" href="#groups">
          운영체제 변경 · {platform === "all" ? "Android + iOS" : platformNames[platform]}
        </a>
        <div className="ad-filters" aria-label="카테고리">
          {[
            "",
            ...categories.filter((value): value is string => Boolean(value)),
          ].map((value) => (
            <button
              key={value}
              aria-pressed={value === category}
              onClick={() => setCategory(value)}
            >
              {value || "전체"}
            </button>
          ))}
        </div>
        <div className="ad-preferences">
          <label className="ad-publisher">
            운영사
            <select
              aria-label="운영사"
              value={publisher}
              onChange={(e) => setPublisher(e.target.value)}
            >
              <option value="">전체 운영사</option>
              {publishers.map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </label>
          <div className="ad-checks">
            <label className="ad-fix-filter">
              <input
                type="checkbox"
                checked={showBugFixes}
                onChange={(e) => save({ showBugFixes: e.target.checked })}
              />
              오류 수정·안정성 개선도 보기
            </label>
            <label className="ad-fix-filter">
              <input
                type="checkbox"
                checked={hideRequired}
                onChange={(e) => save({ hideRequired: e.target.checked })}
              />
              최신 버전 필수 앱 숨기기
            </label>
          </div>
          <details>
            <summary>최신 버전 필수 앱 지정</summary>
            <fieldset>
              <legend>피드에서 숨길 앱 선택</legend>
              {apps.map((app) => (
                <label className="ad-fix-filter" key={app.id}>
                  <input
                    type="checkbox"
                    disabled={app.requiresLatestVersion}
                    checked={Boolean(
                      app.requiresLatestVersion || markedIds.includes(app.id),
                    )}
                    onChange={(e) =>
                      save({
                        markedIds: e.target.checked
                          ? [...markedIds, app.id]
                          : markedIds.filter((id) => id !== app.id),
                      })
                    }
                  />
                  {app.name}
                  {app.requiresLatestVersion && " (공식 확인)"}
                </label>
              ))}
            </fieldset>
          </details>
        </div>
      </div>
      {apps.filter(app => visibleApps.has(app.id) && matches.get(app.id)?.length).map(app => (
        <div className="ad-history" key={app.id}>
          <AppIcon app={app} />
          <div><strong>{app.name}</strong>{matches.get(app.id)?.map(note => <p key={note}>{note}</p>)}</div>
        </div>
      ))}
      <div className="ad-list-head">
        <small aria-live="polite">{rows.length}건</small>
        <small>{mineOnly ? "내 앱 · 최신순" : selected.size ? "내 앱 우선 · 최신순" : "최신순"}</small>
      </div>
      <div className="ad-grid">
        {rows.map(({ app, update }) => {
          const summary = update.summaryKo?.trim().split(/(?<=[.!?])\s+|\n/)[0]
            || feedChanges(update).items[0]?.text || "세부 내용 미공개";
          return (
            <article key={update.id} className="ad-card">
              <div className="ad-app">
                <AppIcon app={app} />
                <div>
                  <strong>{app.name}</strong>
                </div>
                {selected.has(app.id) && (
                  <BookmarkCheck size={18} aria-label="내 앱" />
                )}
              </div>
              <p className="ad-change-lead">{summary.replaceAll("버그를", "오류를")}</p>
              <small className="ad-release-meta">{platformLabel(update)} · {update.version === '미확인' ? '버전 미확인' : 'v' + update.version}
                {update.releaseDate && <> · <time dateTime={update.releaseDate}>{dateLabel(update.releaseDate)}</time></>}
              </small>
              <button
                className="ad-open-update"
                aria-label={app.name + " " + update.version + " 바뀐 점 자세히 보기"}
                onClick={() => onOpenUpdate(update)}
              >
                바뀐 점 자세히 보기
                <ChevronRight size={16} aria-hidden="true" />
              </button>
            </article>
          );
        })}
      </div>
      {!rows.length && (
        <div className="ad-empty">
          <Search />
          <p>
            {mineOnly && !selected.size ? "아직 등록한 앱이 없어요." : filtered
              ? "조건에 맞는 업데이트가 없어요."
              : "아직 등록된 업데이트가 없어요."}
          </p>
          {mineOnly && !selected.size && <a href="#myapps">내 앱 등록하기</a>}
          {filtered && (
            <button
              onClick={() => {
                setCategory("");
                setQuery("");
                setPublisher("");
                save({
                  showBugFixes: true,
                  hideRequired: false,
                  mineOnly: false,
                });
              }}
            >
              전체 업데이트 보기
            </button>
          )}
        </div>
      )}
    </section>
  );
}
