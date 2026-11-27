import type { AppCatalog, AppRelease, StoreListing, TrackedApp } from '../types'
import snapshot from './apps.json'
import bankingSnapshot from '../features/ecosystem/banking.json'
import expandedBankingSnapshot from './bank-catalog.json'

export interface ReleaseDetails extends AppRelease {
  added: string[]
  improved: string[]
  changed: string[]
}

export interface AppInfo extends Omit<TrackedApp, 'stores'> {
  category: string
  developer?: string
  bankFeatures?: readonly string[]
  stores: (Omit<StoreListing, 'releases'> & { releases: ReleaseDetails[] })[]
}

export interface AppUpdate extends ReleaseDetails {
  appId: string
  platform: StoreListing['platform']
}

const official = snapshot as Omit<AppCatalog, 'apps'> & { apps: AppInfo[] }
const knownIds = new Set(official.apps.map(app => app.id))
const bankApps: AppInfo[] = [...bankingSnapshot, ...expandedBankingSnapshot] as AppInfo[]
export const appCatalog = { ...official, apps: [...official.apps, ...bankApps.filter(app => !knownIds.has(app.id))] }
export const apps = appCatalog.apps

export const updates: AppUpdate[] = apps.flatMap(app =>
  app.stores.flatMap(store => store.releases.map(release => ({
    ...release,
    appId: app.id,
    platform: store.platform,
  }))),
)
