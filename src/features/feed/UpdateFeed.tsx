import { useState } from "react";
import { ChevronRight, BookmarkCheck, Search, X } from "lucide-react";
import { AppIcon } from "./AppIcon";
import {
  dateLabel,
  headline,
  platformLabel,
  sections,
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
  const categories = Array.from(new Set(apps.map((app) => app.category)));
  const selected = new Set(selectedAppIds);
  const catalog = new Map(apps.map((app) => [app.id, app]));
  const search = query.trim().toLocaleLowerCase();
  const rows = updates
    .flatMap((update) => {
      const app = catalog.get(update.appId);
      if (
        !app ||
        (category && app.category !== category) ||
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
        {["", ...categories.filter(Boolean)].map((value) => (
          <button
            key={value}
            aria-pressed={value === category}
            onClick={() => setCategory(value)}
          >
            {value || "전체"}
          </button>
        ))}
      </div>
      <div className="ad-list-head">
        <small aria-live="polite">{rows.length}건</small>
        <small>{selected.size ? "내 앱 우선 · 최신순" : "최신순"}</small>
      </div>
      <div className="ad-grid">
        {rows.map(({ app, update }) => {
          const summary = headline(update);
          const limited = summary.endsWith("세부 내용 미공개.");
          const title = limited
            ? summary
                .slice(0, -"세부 내용 미공개.".length)
                .trim()
                .replace(/\.$/, "")
            : summary;
          return (
            <button
              key={update.id}
              className="ad-card"
              onClick={() => onOpenUpdate(update)}
            >
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
              <div className="ad-tags">
                {sections
                  .filter((s) => update[s.key].length)
                  .map((s) => (
                    <span key={s.key}>{s.label}</span>
                  ))}
              </div>
              <div className="ad-summary">
                <h3>{title || "업데이트"}</h3>
                <ChevronRight size={16} aria-hidden="true" />
              </div>
              {limited && <small>세부 내용 미공개</small>}
            </button>
          );
        })}
      </div>
      {!rows.length && (
        <div className="ad-empty">
          <Search />
          <p>
            {search || category
              ? "조건에 맞는 업데이트가 없어요."
              : "아직 등록된 업데이트가 없어요."}
          </p>
          {(search || category) && (
            <button
              onClick={() => {
                setCategory("");
                setQuery("");
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
