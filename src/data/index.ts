import type { AppCatalog, AppRelease, StoreListing, TrackedApp } from '../types'
import snapshot from './apps.json'

export interface ReleaseDetails extends AppRelease {
  added: string[]
  improved: string[]
  changed: string[]
}

export interface AppInfo extends Omit<TrackedApp, 'stores'> {
  category: string
  stores: (Omit<StoreListing, 'releases'> & { releases: ReleaseDetails[] })[]
}

export interface AppUpdate extends ReleaseDetails {
  appId: string
  platform: StoreListing['platform']
}

export const appCatalog = snapshot as Omit<AppCatalog, 'apps'> & { apps: AppInfo[] }
export const apps = appCatalog.apps

export const updates: AppUpdate[] = apps.flatMap(app =>
  app.stores.flatMap(store => store.releases.map(release => ({
    ...release,
    appId: app.id,
    platform: store.platform,
  }))),
)
