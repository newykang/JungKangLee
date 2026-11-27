import { useState } from "react";
import type { FeedUpdate } from "./model";

export type PlatformChoice = FeedUpdate["platform"] | "all";
export const platformNames = { android: "Android", ios: "iOS", all: "둘 다" } as const;
const storageKey = "appdate.feed.platform.v1";

export function usePlatformFeed(updates: readonly FeedUpdate[]) {
  const [platform, setPlatform] = useState<PlatformChoice>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved === "ios" || saved === "android") return saved;
    } catch {
      // Storage may be unavailable in a private browser.
    }
    return "all";
  });
  function savePlatform(next: PlatformChoice) {
    setPlatform(next);
    try {
      localStorage.setItem(storageKey, next);
    } catch {
      // The selection still applies during this visit.
    }
  }
  const feedUpdates = platform === "all" ? updates : updates.filter(update => update.platform === platform);
  return { platform, savePlatform, feedUpdates };
}
