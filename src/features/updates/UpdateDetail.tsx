import { useState, type ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { ReleaseCards } from "./ReleaseCards";
import { AppIcon } from "../feed/AppIcon";
import {
  dateLabel,
  platformLabel,
  sections,
  type FeedApp,
  type FeedUpdate,
} from "../feed/model";
import "../feed/feed.css";

interface Props {
  app: FeedApp;
  update: FeedUpdate;
  history?: readonly FeedUpdate[];
  onBack: () => void;
  backLabel?: string;
  review?: ReactNode;
}
export function UpdateDetail({
  app,
  update,
  history = [],
  onBack,
  backLabel = "업데이트 피드",
  review,
}: Props) {
  const versions = history
    .filter(
      (item) => item.appId === app.id && item.platform === update.platform,
    )
    .slice()
    .sort((a, b) => b.releaseDate.localeCompare(a.releaseDate));
  return (
    <article className="ad-detail">
      <button className="ad-back" onClick={onBack}>
        <ArrowLeft size={17} /> {backLabel}
      </button>
      <div className="ad-detail-hero">
        <AppIcon app={app} />
        <small>
          {app.category} · {platformLabel(update)}
        </small>
        <h1>{app.name}</h1>
        <p>
          v{update.version} · {dateLabel(update.releaseDate)}
        </p>
      </div>
      <ReleaseCards key={update.id} app={app} update={update} />
      {versions[0]?.id === update.id &&
        new Set(versions.map((v) => v.version)).size > 1 && (
          <VersionComparison key={update.id} versions={versions} />
        )}
      {review}
    </article>
  );
}
function VersionComparison({ versions }: { versions: FeedUpdate[] }) {
  const [base, setBase] = useState("");
  const end = versions.findIndex((item) => item.id === base);
  return (
    <section className="ad-block">
      <h2>내 버전과 비교</h2>
      <label>
        내 버전{" "}
        <select value={base} onChange={(e) => setBase(e.target.value)}>
          <option value="">선택하세요</option>
          {versions.slice(1).map((item) => (
            <option key={item.id} value={item.id}>
              {item.version}
            </option>
          ))}
        </select>
      </label>
      {end > 0 && (
        <>
          <p>확보된 버전 기록 기준</p>
          {versions.slice(0, end).map((item) => (
            <div key={item.id}>
              <strong>v{item.version}</strong>
              <p>
                {sections.flatMap((s) => item[s.key]).join(" · ") ||
                  item.releaseNotes ||
                  "세부 내용 미공개"}
              </p>
            </div>
          ))}
        </>
      )}
    </section>
  );
}
