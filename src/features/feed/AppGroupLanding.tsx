import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { AppIcon } from "./AppIcon";
import type { FeedApp } from "./model";
import { platformNames, type PlatformChoice } from "./usePlatformFeed";
import "./overview.css";

export interface AppGroup {
  id: string;
  name: string;
  apps: FeedApp[];
}

export function AppGroupLanding({
  groups,
  selected,
  platform,
  onSave,
}: {
  groups: AppGroup[];
  selected: string[];
  platform: PlatformChoice;
  onSave: (ids: string[], platform: PlatformChoice) => void;
}) {
  const [draft, setDraft] = useState(selected);
  const [draftPlatform, setDraftPlatform] = useState(platform);
  const featured = groups.filter((group) => !group.id.startsWith("bank:"));
  const otherBanks = groups.filter((group) => group.id.startsWith("bank:"));
  function toggle(id: string) {
    setDraft((ids) =>
      ids.includes(id) ? ids.filter((value) => value !== id) : [...ids, id],
    );
  }
  return (
    <section
      className="ad-overview ad-landing"
      aria-labelledby="ad-landing-title"
    >
      <div className="ad-landing-intro">
        <h1 id="ad-landing-title">
          어떤 앱을 <br />
          자주 쓰시나요?
        </h1>
        <p>
          그룹을 고르면 해당 앱을 내 앱에 등록하고 피드 상단에 모아
          보여드립니다.
        </p>
      </div>
      <form
        className="ad-group-picker"
        onSubmit={(event) => {
          event.preventDefault();
          onSave(draft, draftPlatform);
        }}
      >
        <fieldset className="ad-platform-picker">
          <legend>업데이트를 볼 운영체제</legend>
          <div>
            {(["android", "ios", "all"] as const).map(value => (
              <label key={value}>
                <input type="radio" name="platform" checked={draftPlatform === value}
                  onChange={() => setDraftPlatform(value)} />
                {platformNames[value]}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>사용하는 앱 그룹</legend>
          {featured.map(renderGroup)}
          {otherBanks.length > 0 && (
            <details
              className="ad-other-groups"
              open={
                otherBanks.some((group) => selected.includes(group.id)) ||
                undefined
              }
            >
              <summary>은행 그룹 더 보기</summary>
              <div>{otherBanks.map(renderGroup)}</div>
            </details>
          )}
        </fieldset>
        <div className="ad-group-actions">
          <button className="ad-start" type="submit">
            {draft.length || draftPlatform !== "all" ? "선택 저장하고 피드 보기" : "전체 피드 보기"}
            <ArrowRight size={16} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>
      </form>
    </section>
  );

  function renderGroup({ id, name, apps }: AppGroup) {
    return (
      <label key={id} className="ad-group-option">
        <span className="ad-group-icons" aria-hidden="true">
          {apps.slice(0, 2).map((app) => (
            <AppIcon key={app.id} app={app} />
          ))}
        </span>
        <span className="ad-group-name">
          <strong>{name}</strong>
          <small>{apps.map((app) => app.name).join(" · ")}</small>
        </span>
        <input
          type="checkbox"
          checked={draft.includes(id)}
          onChange={() => toggle(id)}
          aria-label={name}
        />
        <span className="ad-group-check" aria-hidden="true">
          <Check size={16} strokeWidth={1.5} />
        </span>
      </label>
    );
  }
}
