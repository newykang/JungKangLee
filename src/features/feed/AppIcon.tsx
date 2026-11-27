import { useState } from "react";
import type { FeedApp } from "./model";
export function AppIcon({ app }: { app: FeedApp }) {
  const [failed, setFailed] = useState("");
  return app.iconUrl && failed !== app.iconUrl ? (
    <img
      className="ad-icon"
      src={app.iconUrl}
      alt=""
      onError={() => setFailed(app.iconUrl)}
    />
  ) : (
    <span className="ad-icon ad-initial" aria-hidden="true">
      {app.name.slice(0, 1)}
    </span>
  );
}
