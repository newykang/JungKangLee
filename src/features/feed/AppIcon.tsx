import { useState } from "react";
import type { FeedApp } from "./model";
export function AppIcon({ app }: { app: FeedApp }) {
  const [failedUrls, setFailedUrls] = useState<string[]>([]);
  const iconUrl = [app.iconUrl, app.fallbackIconUrl].find(
    (url) => url && !failedUrls.includes(url),
  );
  return iconUrl ? (
    <img
      className="ad-icon"
      src={iconUrl}
      alt=""
      onError={() => setFailedUrls((urls) => [...urls, iconUrl])}
    />
  ) : (
    <span className="ad-icon ad-initial" aria-hidden="true">
      {app.name.slice(0, 1)}
    </span>
  );
}
