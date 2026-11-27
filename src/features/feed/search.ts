import type { FeedApp } from './model'

function normalizeName(value: string) {
  return value.normalize('NFKC').toLowerCase().replace(/[\s·-]/g, '')
}

function matchesName(query: string, names: readonly string[]) {
  const needle = normalizeName(query)
  return Boolean(needle) && names.some(name => normalizeName(name).includes(needle))
}

type SearchableApp = Pick<FeedApp, 'id' | 'name' | 'developer' | 'aliases' | 'nameHistory'>

export function searchApps(apps: readonly SearchableApp[], query: string) {
  const results = new Map<string, string[]>()
  for (const app of apps) {
    const notices = (app.nameHistory ?? [])
      .filter(previous => matchesName(query, [previous.name, ...previous.aliases]))
      .map(previous => previous.message)
    if (!query.trim() || notices.length || matchesName(query, [app.name, app.developer ?? '', ...(app.aliases ?? [])])) {
      results.set(app.id, notices)
    }
  }
  return results
}
