import { lazy, Suspense, useState } from 'react'
import { ExternalLink, ThumbsDown, ThumbsUp } from 'lucide-react'
import { appCatalog } from '../../data'
import type { AppPlatform, AppRelease, VersionVote } from '../../types'
import { getVoteStorage, nextVote, positiveRate, readVote, saveVote, voteKey } from './votes'

const VersionChart = lazy(() => import('./VersionChart'))

const platforms: Record<AppPlatform, string> = { ios: 'iOS', android: 'Android' }
const stores: Record<AppPlatform, string> = { ios: 'App Store', android: 'Google Play' }

function getInitialVotes() {
  const storage = getVoteStorage()
  const votes: Record<string, VersionVote | null> = {}

  for (const app of appCatalog.apps) {
    for (const store of app.stores) {
      for (const release of store.releases) {
        if (release.version) votes[release.id] = readVote(storage, voteKey(release.id))
      }
    }
  }

  return votes
}

function VoteButtons({ release, vote, onVote }: {
  release: AppRelease
  vote: VersionVote | null
  onVote: (vote: VersionVote) => void
}) {
  const label = release.version ?? '버전 미확인'
  const buttons = [
    { id: 'like', label: '좋아요', icon: ThumbsUp },
    { id: 'dislike', label: '아쉬워요', icon: ThumbsDown },
  ] as const

  return (
    <div className="flex flex-wrap gap-2">
      {buttons.map(({ id, label: action, icon: Icon }) => (
        <button
          key={id}
          type="button"
          aria-label={`${label} ${action}`}
          aria-pressed={vote === id}
          onClick={() => onVote(id)}
          className={`inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 text-sm font-semibold ${vote === id ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-indigo-50'}`}
        >
          <Icon size={16} aria-hidden="true" />
          {action}
        </button>
      ))}
    </div>
  )
}

export default function Reviews() {
  const [appId, setAppId] = useState(() => appCatalog.apps[0]?.id ?? '')
  const [platform, setPlatform] = useState<AppPlatform>('ios')
  const [votes, setVotes] = useState(getInitialVotes)
  const [storageMessage, setStorageMessage] = useState('')

  const app = appCatalog.apps.find(item => item.id === appId)
  const store = app?.stores.find(item => item.platform === platform)
  const releases = store?.releases ?? []
  const chartRows = releases.flatMap(release => release.version ? [{
    version: release.version,
    likes: votes[release.id] === 'like' ? 1 : 0,
    dislikes: votes[release.id] === 'dislike' ? 1 : 0,
  }] : [])

  function recordVote(releaseId: string, choice: VersionVote) {
    const key = voteKey(releaseId)
    const storage = getVoteStorage()
    const vote = nextVote(votes[releaseId] ?? null, choice)
    const persisted = saveVote(storage, key, vote)
    setVotes(current => ({ ...current, [releaseId]: vote }))
    setStorageMessage(persisted ? '' : '브라우저에 저장할 수 없어 새로고침하면 이번 평가가 사라집니다.')
  }

  return (
    <section aria-labelledby="reviews-title" className="space-y-5">
      <header>
        <h1 id="reviews-title" className="text-3xl font-extrabold tracking-tight text-slate-950">버전별 평가</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">내가 이 브라우저에서 남긴 평가를 버전별로 확인할 수 있어요.</p>
      </header>

      {appCatalog.apps.length === 0 ? (
        <p className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-600">확인된 앱 업데이트가 없습니다.</p>
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="min-w-0 flex-1 text-sm font-semibold text-slate-800" htmlFor="review-app">
              앱
              <select id="review-app" value={appId} onChange={event => setAppId(event.target.value)}
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

          <p role="status" className={storageMessage ? 'rounded-xl bg-amber-50 p-3 text-sm text-amber-900' : 'sr-only'}>{storageMessage}</p>

          {releases.length === 0 ? (
            <p className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-600">{platforms[platform]}에서 확인된 업데이트가 없습니다.</p>
          ) : (
            <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
              {chartRows.length > 0 && (
                <Suspense fallback={<p aria-live="polite" className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-600">그래프를 불러오는 중입니다.</p>}>
                  <VersionChart rows={chartRows} />
                </Suspense>
              )}
              <ul className="space-y-3">
                {releases.map(release => {
                  const vote = votes[release.id] ?? null
                  const likes = vote === 'like' ? 1 : 0
                  const dislikes = vote === 'dislike' ? 1 : 0
                  const rate = positiveRate(likes, dislikes)

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
                        <>
                          <p aria-live="polite" className="mb-3 mt-3 flex flex-wrap gap-x-3 text-sm text-slate-600">
                            <span>좋아요 {likes}건</span>
                            <span>아쉬워요 {dislikes}건</span>
                            <span>{rate === null ? '총 0건 · 긍정 비율 —' : `긍정 비율 ${rate}%`}</span>
                          </p>
                          <VoteButtons release={release} vote={vote} onVote={choice => recordVote(release.id, choice)} />
                        </>
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
