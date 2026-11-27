import { useState } from "react";
import { ChevronRight, BookmarkCheck, Search, X } from "lucide-react";
import { AppIcon } from "./AppIcon";
import { useFeedPreferences } from "./preferences";
import {
  isBugFixOnly,
  dateLabel,
  feedChanges,
  platformLabel,
  type FeedApp,
  type FeedUpdate,
} from "./model";
import "./feed.css";

interface Props {
  apps: readonly FeedApp[];
  updates: readonly FeedUpdate[];
  selectedAppIds: readonly string[];
  onOpenUpdate: (update: FeedUpdate) => void;
}
export function UpdateFeed({
  apps,
  updates,
  selectedAppIds,
  onOpenUpdate,
}: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [publisher, setPublisher] = useState("");
  const { preferences, save } = useFeedPreferences();
  const { showBugFixes, hideRequired, markedIds } = preferences;
  const categories = [...new Set(apps.map((app) => app.category))];
  const publisherOf = (app: FeedApp) =>
    app.developer?.trim() || "퍼블리셔 미확인";
  const publishers = [...new Set(apps.map(publisherOf))].sort((a, b) =>
    a.localeCompare(b, "ko"),
  );
  const selected = new Set(selectedAppIds);
  const catalog = new Map(apps.map((app) => [app.id, app]));
  const search = query.trim().toLocaleLowerCase();
  const rows = updates
    .flatMap((update) => {
      const app = catalog.get(update.appId);
      if (
        !app ||
        (category && app.category !== category) ||
        (publisher && publisherOf(app) !== publisher) ||
        (hideRequired &&
          (app.requiresLatestVersion || markedIds.includes(app.id))) ||
        (!showBugFixes && isBugFixOnly(update)) ||
        !app.name.toLocaleLowerCase().includes(search)
      )
        return [];
      return [{ app, update }];
    })
    .sort(
      (a, b) =>
        Number(selected.has(b.app.id)) - Number(selected.has(a.app.id)) ||
        b.update.releaseDate.localeCompare(a.update.releaseDate) ||
        a.update.id.localeCompare(b.update.id),
    );
  return (
    <section className="ad-feed">
      <h1>업데이트 피드</h1>
      <div className="ad-search">
        <Search size={19} />
        <input
          aria-label="앱 이름 검색"
          value={query}
          placeholder="앱 이름으로 검색"
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button aria-label="검색어 지우기" onClick={() => setQuery("")}>
            <X size={17} />
          </button>
        )}
      </div>
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
          퍼블리셔
          <select
            value={publisher}
            onChange={(e) => setPublisher(e.target.value)}
          >
            <option value="">전체 퍼블리셔</option>
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
            버그 픽스 표시
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
      <div className="ad-list-head">
        <small aria-live="polite">{rows.length}건</small>
        <small>{selected.size ? "내 앱 우선 · 최신순" : "최신순"}</small>
      </div>
      <div className="ad-grid">
        {rows.map(({ app, update }) => {
          const { items, limited } = feedChanges(update);
          return (
            <article key={update.id} className="ad-card">
              <div className="ad-app">
                <AppIcon app={app} />
                <div>
                  <strong>{app.name}</strong>
                  <small>
                    {app.category} · {platformLabel(update)} · v{update.version}{" "}
                    ·{" "}
                    <time dateTime={update.releaseDate}>
                      {dateLabel(update.releaseDate)}
                    </time>
                  </small>
                </div>
                {selected.has(app.id) && (
                  <BookmarkCheck size={18} aria-label="내 앱" />
                )}
              </div>
              {items.length > 0 && (
                <ul className="ad-changes">
                  {items.slice(0, 3).map(({ label, text }, index) => (
                    <li key={index}>
                      <span>{label}</span>
                      {text}
                    </li>
                  ))}
                </ul>
              )}
              {limited && <small>세부 내용 미공개</small>}
              <button
                className="ad-open-update"
                aria-label={app.name + " " + update.version + " 업데이트 상세 보기"}
                onClick={() => onOpenUpdate(update)}
              >
                {items.length > 3 && <small>외 {items.length - 3}건</small>}
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
            {search || category || publisher || hideRequired || !showBugFixes
              ? "조건에 맞는 업데이트가 없어요."
              : "아직 등록된 업데이트가 없어요."}
          </p>
          {(search ||
            category ||
            publisher ||
            hideRequired ||
            !showBugFixes) && (
            <button
              onClick={() => {
                setCategory("");
                setQuery("");
                setPublisher("");
                save({ showBugFixes: true, hideRequired: false });
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
