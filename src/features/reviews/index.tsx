import { lazy, Suspense, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import type { AppPlatform } from '../../types'
import { appCatalog } from '../../data'
import { ReviewControls, ReviewLoadError, ReviewSaveError } from './ReviewControls'
import { useSharedReviews } from './useSharedReviews'

const VersionChart = lazy(() => import('./VersionChart'))

const platforms: Record<AppPlatform, string> = { ios: 'iOS', android: 'Android' }
const stores: Record<AppPlatform, string> = { ios: 'App Store', android: 'Google Play' }

export default function Reviews({ initialAppId, initialPlatform = 'ios' }: { initialAppId?: string; initialPlatform?: AppPlatform }) {

  const [appId, setAppId] = useState(() => appCatalog.apps.find(app => app.id === initialAppId)?.id ?? appCatalog.apps[0]?.id ?? '')
  const [platform, setPlatform] = useState<AppPlatform>(initialPlatform)
  const app = appCatalog.apps.find(item => item.id === appId) ?? appCatalog.apps[0]
  const store = app?.stores.find(item => item.platform === platform)
  const releases = store?.releases ?? []
  const query = app && releases.some(release => release.version) ? new URLSearchParams({ appId: app.id, platform }).toString() : ''
  const reviews = useSharedReviews(query)
  const summaries = new Map(reviews.data?.reviews.map(summary => [summary.releaseId, summary]))
  const chartRows = releases.flatMap(release => {
    const summary = summaries.get(release.id)
    return release.version && summary ? [{ version: release.version, likes: summary.likes, dislikes: summary.dislikes }] : []
  })

  return (
    <section aria-labelledby="reviews-title" className="space-y-5">
      <header>
        <h1 id="reviews-title" className="text-3xl font-extrabold tracking-tight text-slate-950">버전별 평가</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">앱과 플랫폼을 선택해 버전별 투표 수와 긍정 비율을 비교하세요. 계정당 버전별로 한 표를 남길 수 있어요.</p>
      </header>

      {appCatalog.apps.length === 0 ? (
        <p className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-600">확인된 앱 업데이트가 없습니다.</p>
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="min-w-0 flex-1 text-sm font-semibold text-slate-800" htmlFor="review-app">
              앱
              <select id="review-app" value={app?.id ?? ''} onChange={event => setAppId(event.target.value)}
                className="mt-1.5 block min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-normal">
                {appCatalog.apps.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </label>
            <label className="text-sm font-semibold text-slate-800" htmlFor="review-platform">
              플랫폼
              <select id="review-platform" value={platform} onChange={event => {
                setPlatform(event.target.value === 'android' ? 'android' : 'ios')
              }} className="mt-1.5 block min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-normal sm:w-36">
                <option value="ios">iOS</option>
                <option value="android">Android</option>
              </select>
            </label>
          </div>

          {store && (
            <div className="flex min-w-0 flex-wrap items-center gap-3 text-sm">
              <span className="font-semibold text-slate-800">{store.name}</span>
              <a href={store.storeUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-indigo-700 underline underline-offset-2">
                {stores[platform]} <ExternalLink size={14} aria-hidden="true" />
              </a>
            </div>
          )}

          {reviews.loading && <p role="status" className="text-sm text-slate-600">평가를 불러오는 중입니다.</p>}
          {reviews.error && <ReviewLoadError error={reviews.error} retry={reviews.retry} />}
          {reviews.saveError && <ReviewSaveError message={reviews.saveError} retry={reviews.retry} />}

          {releases.length === 0 ? (
            <p className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-600">{platforms[platform]}에서 확인된 업데이트가 없습니다.</p>
          ) : (
            <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
              {chartRows.length > 0 && (
                <Suspense fallback={<p aria-live="polite" className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-600">그래프를 불러오는 중입니다.</p>}>
                  <VersionChart rows={chartRows} />
                </Suspense>
              )}
              <ul className={chartRows.length ? 'space-y-3' : 'space-y-3 lg:col-span-2'}>
                {releases.map(release => {
                  const summary = summaries.get(release.id)

                  return (
                    <li key={release.id} className="rounded-2xl border border-slate-200 p-4">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <h2 className="font-bold text-slate-900">{release.version ?? '버전 미확인'}</h2>
                        {release.updatedOn && <time className="text-xs text-slate-600" dateTime={release.updatedOn}>{release.updatedOn}</time>}
                      </div>
                      {release.summaryKo && <p className="mt-2 text-sm leading-6 text-slate-700">{release.summaryKo}</p>}
                      <a href={release.sourceUrl} target="_blank" rel="noreferrer"
                        className="my-1 inline-flex min-h-8 items-center gap-1 text-xs font-semibold text-indigo-700 underline underline-offset-2">
                        공식 출처 <ExternalLink size={13} aria-hidden="true" />
                      </a>
                      {release.version ? (
                        summary && reviews.data && <ReviewControls summary={summary} version={release.version}
                          canVote={reviews.data.canVote} saving={reviews.saving} onVote={(choice, reasons) => reviews.castVote(summary, choice, reasons)} />
                      ) : (
                        <p className="mt-3 text-sm text-slate-600">공식 출처에 버전이 표시되면 평가할 수 있습니다.</p>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </>
      )}
    </section>
  )
}
