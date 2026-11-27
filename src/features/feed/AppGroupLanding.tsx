import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { AppIcon } from "./AppIcon";
import type { FeedApp } from "./model";
import "./overview.css";

export interface AppGroup {
  id: string;
  name: string;
  apps: FeedApp[];
}

export function AppGroupLanding({
  groups,
  selected,
  onSave,
}: {
  groups: AppGroup[];
  selected: string[];
  onSave: (ids: string[]) => void;
}) {
  const [draft, setDraft] = useState(selected);
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
          어떤 앱을
          <br />
          자주 쓰시나요?
        </h1>
        <p>앱 그룹을 고르면 해당 그룹의 업데이트가 피드 상단에 표시됩니다.</p>
      </div>
      <form
        className="ad-group-picker"
        onSubmit={(event) => {
          event.preventDefault();
          onSave(draft);
        }}
      >
        <fieldset>
          <legend>사용하는 앱 그룹</legend>
          {groups.map(({ id, name, apps }) => (
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
          ))}
        </fieldset>
        <div className="ad-group-actions">
          <button className="ad-start" type="submit">
            {draft.length ? "선택 저장하고 피드 보기" : "전체 피드 보기"}
            <ArrowRight size={16} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>
      </form>
    </section>
  );
}
