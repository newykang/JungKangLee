import { AppIcon } from "./AppIcon";
import {
  dateLabel,
  platformLabel,
  safeLink,
  type FeedApp,
  type FeedUpdate,
} from "./model";
import "./overview.css";

export function BankOverview({
  apps,
  updates,
  onOpenUpdate,
}: {
  apps: readonly FeedApp[];
  updates: readonly FeedUpdate[];
  onOpenUpdate: (update: FeedUpdate) => void;
}) {
  const groups = new Map<string, FeedApp[]>();
  for (const app of apps) {
    if (app.category !== "은행" && !app.bankFeatures?.length) continue;
    const publisher = app.developer?.trim() || "퍼블리셔 미확인";
    const group = groups.get(publisher) ?? [];
    group.push(app);
    groups.set(publisher, group);
  }

  const latest = new Map<string, Map<FeedUpdate["platform"], FeedUpdate>>();
  for (const update of updates) {
    if (!update.version.trim()) continue;
    const versions = latest.get(update.appId) ?? new Map();
    const current = versions.get(update.platform);
    if (!current || current.releaseDate < update.releaseDate)
      versions.set(update.platform, update);
    latest.set(update.appId, versions);
  }

  return (
    <section className="ad-overview ad-banks" aria-labelledby="ad-banks-title">
      <header>
        <h1 id="ad-banks-title">은행 앱 한눈에 보기</h1>
        <p>퍼블리셔별 주요 기능과 스토어에서 확인한 최신 버전</p>
      </header>
      {!groups.size && <p>등록된 은행 앱이 없습니다.</p>}
      {[...groups]
        .sort(([a], [b]) => a.localeCompare(b, "ko"))
        .map(([publisher, group]) => (
          <section key={publisher} className="ad-bank-group">
            <h2>
              {publisher}
              <small>{group.length}개 앱</small>
            </h2>
            <ul className="ad-bank-list">
              {group.map((app) => {
                const versions = latest.get(app.id);
                const store = safeLink(app.storeUrl);
                return (
                  <li key={app.id} className="ad-bank-app">
                    <AppIcon app={app} />
                    <div className="ad-bank-info">
                      <h3>{app.name}</h3>
                      {app.bankFeatures?.length ? (
                        <ul>
                          {app.bankFeatures.map((feature) => (
                            <li key={feature}>{feature}</li>
                          ))}
                        </ul>
                      ) : (
                        <p>주요 기능 미등록</p>
                      )}
                    </div>
                    <div className="ad-bank-versions">
                      {versions?.size ? (
                        [...versions.values()]
                          .sort((a, b) => a.platform.localeCompare(b.platform))
                          .map((update) => (
                            <button
                              type="button"
                              key={update.platform}
                              onClick={() => onOpenUpdate(update)}
                            >
                              <span>
                                {platformLabel(update)} · v{update.version}
                              </span>
                              {update.releaseDate && (
                                <time dateTime={update.releaseDate}>
                                  {dateLabel(update.releaseDate)}
                                </time>
                              )}
                            </button>
                          ))
                      ) : (
                        <span>버전 미확인</span>
                      )}
                      {store && (
                        <a
                          href={store}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={app.name + " 공식 스토어"}
                        >
                          스토어
                        </a>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
    </section>
  );
}
