export type AppPlatform = 'ios' | 'android'

export interface AppRelease {
  id: string
  version: string | null
  updatedOn: string | null
  releaseNotes: string | null
  summaryKo: string | null
  notesAreExcerpt: boolean
  sourceUrl: string
}

export interface StoreListing {
  platform: AppPlatform
  storeId: string
  name: string
  iconUrl: string | null
  storeUrl: string
  sourceUrl: string
  releases: AppRelease[]
}

export interface TrackedApp {
  id: string
  name: string
  stores: StoreListing[]
}

export interface AppCatalog {
  observedOn: string | null
  apps: TrackedApp[]
}

export type VersionVote = 'like' | 'dislike'
