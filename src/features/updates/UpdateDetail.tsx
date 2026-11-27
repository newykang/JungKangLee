import type { ReactNode } from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { AppIcon } from "../feed/AppIcon";
import {
  dateLabel,
  platformLabel,
  safeLink,
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
  const source = safeLink(update.sourceUrl);
  const store = safeLink(app.storeUrl);
  const hasSummary = sections.some((s) => update[s.key].length > 0);
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
      <h2>이번 버전의 변경 사항</h2>
      {sections.map(
        (s) =>
          update[s.key].length > 0 && (
            <section className="ad-block" key={s.key}>
              <span className="ad-label">{s.label}</span>
              <ul>
                {update[s.key].map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </section>
          ),
      )}
      {!hasSummary && <p>세부 내용 미공개</p>}
      <details className="ad-block" key={update.id}>
        <summary>공식 업데이트 원문</summary>
        <p className="ad-original">
          {update.releaseNotes || "세부 내용 미공개"}
        </p>
      </details>
      <div className="ad-links">
        {source && (
          <a href={source} target="_blank" rel="noreferrer">
            공식 출처 <ExternalLink size={15} />
          </a>
        )}
        {store && (
          <a href={store} target="_blank" rel="noreferrer">
            스토어에서 보기 <ExternalLink size={15} />
          </a>
        )}
      </div>
      {versions[0]?.id === update.id &&
        new Set(versions.map((v) => v.version)).size > 1 && (
          <VersionComparison key={update.id} versions={versions} />
        )}
      {review}
    </article>
  );
}
import { useState } from "react";
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
