import { ArrowLeft, ChevronRight } from "lucide-react";
import { AppIcon } from "../feed/AppIcon";
import {
  dateLabel,
  feedChanges,
  platformLabel,
  type FeedApp,
  type FeedUpdate,
} from "../feed/model";
import "./release-cards.css";

export function AppTimeline({
  app,
  updates,
  onOpenUpdate,
  onBack,
}: {
  app: FeedApp;
  updates: readonly FeedUpdate[];
  onOpenUpdate: (update: FeedUpdate) => void;
  onBack: () => void;
}) {
  const releases = updates
    .filter((update) => update.appId === app.id)
    .sort(
      (a, b) =>
        b.releaseDate.localeCompare(a.releaseDate) ||
        a.platform.localeCompare(b.platform) ||
        a.id.localeCompare(b.id),
    );
  return (
    <section
      className="ad-detail ad-timeline"
      aria-labelledby="ad-timeline-title"
    >
      <button type="button" className="ad-back" onClick={onBack}>
        <ArrowLeft size={17} aria-hidden="true" /> 업데이트 피드
      </button>
      <header className="ad-timeline-heading">
        <AppIcon app={app} />
        <div>
          <h1 id="ad-timeline-title">{app.name}</h1>
          <p>
            {app.category} · {releases.length}건
          </p>
        </div>
      </header>
      <h2>업데이트 기록</h2>
      {releases.length === 0 ? (
        <p>확인된 업데이트 기록이 없습니다.</p>
      ) : (
        <ol className="ad-timeline-list">
          {releases.map((update) => {
            const summary = feedChanges(update).items[0];
            return (
              <li key={update.id}>
                <button type="button" onClick={() => onOpenUpdate(update)}>
                  <span>
                    <small>
                      {update.releaseDate ? (
                        <time dateTime={update.releaseDate}>
                          {dateLabel(update.releaseDate)}
                        </time>
                      ) : (
                        "날짜 미확인"
                      )}{" "}
                      · {platformLabel(update)}
                    </small>
                    <strong>
                      {update.version === "미확인" || !update.version
                        ? "버전 미확인"
                        : "v" + update.version}
                    </strong>
                    {summary && (
                      <span className="ad-timeline-summary">
                        {summary.label !== "원문" && (
                          <small>{summary.label} · </small>
                        )}
                        {summary.text}
                      </span>
                    )}
                  </span>
                  <ChevronRight size={16} aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
