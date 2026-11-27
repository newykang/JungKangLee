import { useState } from "react";

interface Preferences {
  showBugFixes: boolean;
  hideRequired: boolean;
  markedIds: string[];
}
const storageKey = "appdate.feed.preferences.v1";
const defaults: Preferences = {
  showBugFixes: true,
  hideRequired: false,
  markedIds: [],
};
function read(): Preferences {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
    return {
      showBugFixes: saved.showBugFixes !== false,
      hideRequired: saved.hideRequired === true,
      markedIds: Array.isArray(saved.markedIds)
        ? saved.markedIds.filter((id: unknown) => typeof id === "string")
        : [],
    };
  } catch {
    return defaults;
  }
}
export function useFeedPreferences() {
  const [preferences, setPreferences] = useState(read);
  function save(patch: Partial<Preferences>) {
    const next = { ...preferences, ...patch };
    setPreferences(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      /* Keep session preferences. */
    }
  }
  return { preferences, save };
}
