import { ThumbsDown, ThumbsUp } from 'lucide-react'
import type { VersionVote } from '../../types'
import { readLegacyVote, type ReviewSummary } from './useSharedReviews'
import { positiveRate } from './votes'

export function ReviewSignIn({ returnHash }: { returnHash: string }) {
  const returnTo = '/' + returnHash
  return <a className="inline-flex min-h-11 items-center text-sm font-semibold text-indigo-700 underline underline-offset-2"
    href={'/signin-with-chatgpt?return_to=' + encodeURIComponent(returnTo)} target="_top">ChatGPT로 로그인해 평가하기</a>
}

export function ReviewLoadError({ error, retry }: { error: 'unavailable' | 'no-api'; retry: () => void }) {
  if (error === 'no-api') return <p role="status" className="rounded-xl bg-indigo-50 p-3 text-sm text-indigo-900">
    <a className="font-semibold underline" href={'https://appdate-qa.sleekbeacon8.chatgpt.site/' + window.location.hash}>appdate에서 전체 평가 보기</a>
  </p>
  return <p role="status" className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
    평가를 불러올 수 없습니다. <button type="button" className="font-semibold underline" onClick={retry}>다시 불러오기</button>
  </p>
}

export function ReviewControls({ summary, version, signedIn, saving, onVote }: {
  summary: ReviewSummary
  version: string
  signedIn: boolean
  saving: string
  onVote: (choice: VersionVote) => void
}) {
  const { likes, dislikes, myVote, releaseId } = summary
  const rate = positiveRate(likes, dislikes)
  const legacy = myVote === null ? readLegacyVote(releaseId) : null
  return <>
    <p aria-live="polite" className="mb-3 mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm text-slate-600">
      <span>좋아요 {likes.toLocaleString('ko-KR')}표</span>
      <span>아쉬워요 {dislikes.toLocaleString('ko-KR')}표</span>
      <span>참여 {(likes + dislikes).toLocaleString('ko-KR')}명</span>
      <span>{rate === null ? '평가 대기 중' : `긍정 비율 ${rate}%`}</span>
    </p>
    {legacy && <p className="mb-2 text-xs text-slate-600">
      이 브라우저의 이전 평가: {legacy === 'like' ? '좋아요' : '아쉬워요'}. 평가를 다시 제출하면 전체 집계에 반영됩니다.
    </p>}
    {signedIn && <div className="flex flex-wrap gap-2" aria-busy={saving === releaseId}>
      {([{ value: 'like', label: '좋아요', Icon: ThumbsUp }, { value: 'dislike', label: '아쉬워요', Icon: ThumbsDown }] as const)
        .map(({ value, label, Icon }) => (
          <button key={value} type="button" aria-label={`${version} ${label}`} aria-pressed={myVote === value}
            disabled={Boolean(saving)} onClick={() => onVote(value)}
            className={`inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 text-sm font-semibold disabled:opacity-60 ${myVote === value ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-indigo-50'}`}>
            <Icon size={16} aria-hidden="true" />{label}
          </button>
        ))}
    </div>}
    {saving === releaseId && <p role="status" className="mt-2 text-xs text-slate-600">평가를 저장하는 중입니다.</p>}
  </>
}
