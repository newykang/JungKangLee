import { apps as catalog } from '../../data'
import type { FeedApp, FeedUpdate } from '../../features/feed/model'
import { profilesById } from '../../features/ecosystem/graph'

const icons = new Set(Object.keys(import.meta.glob('/public/icons/*.jpg')).map(path => path.split('/').pop()?.slice(0, -4)))

export const apps: FeedApp[] = catalog.map(app => {
  const profile = profilesById.get(app.id)
  const listing = app.stores.find(store => store.platform === 'ios') ?? app.stores[0]
  return {
    id: app.id, developer: profile?.developer, name: profile?.name ?? app.name, category: profile?.category ?? app.category,
    iconUrl: icons.has(app.id) ? '/icons/' + app.id + '.jpg' : listing?.iconUrl ?? '',
    storeUrl: listing?.storeUrl ?? '',
  }
})

export const releases = catalog.flatMap(app => app.stores.flatMap(store => store.releases.map(release => {
  const card: FeedUpdate = {
    id: release.id, appId: app.id, platform: store.platform, version: release.version ?? '미확인',
    releaseDate: release.updatedOn ?? '', releaseNotes: (release.releaseNotes ?? '') + (release.notesAreExcerpt ? '\n(공식 원문 발췌)' : ''),
    added: release.added, changed: release.changed, improved: release.improved, sourceUrl: release.sourceUrl,
  }
  return { card, storeUrl: store.storeUrl, canVote: Boolean(release.version) }
})))

export const appIds = new Set(apps.map(app => app.id))
export const updates = releases.map(row => row.card)
