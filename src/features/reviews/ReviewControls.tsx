import { ThumbsDown, ThumbsUp } from 'lucide-react'
import { useId, useState } from 'react'
import type { VersionVote } from '../../types'
import { maxReasons, reasonOptions, ReviewReasonResults } from './ReviewReasons'
import { readLegacyVote, type ReviewSummary } from './useSharedReviews'
import { positiveRate } from './votes'

export function ReviewSaveError({ message, retry }: { message: string; retry: () => void }) {
  return <p role="status" className="rounded-xl bg-amber-50 px-3 py-1 text-sm text-amber-900">
    {message}{' '}
    <button type="button" className="min-h-11 font-semibold underline underline-offset-2" onClick={retry}>다시 불러오기</button>
  </p>
}

export function ReviewLoadError({ error, retry }: { error: 'unavailable' | 'no-api'; retry: () => void }) {
  if (error === 'no-api') return <p role="status" className="rounded-xl bg-indigo-50 p-3 text-sm text-indigo-900">
    <a className="font-semibold underline" href={'https://appdate-qa.sleekbeacon8.chatgpt.site/' + window.location.hash}>appdate에서 전체 평가 보기</a>
  </p>
  return <p role="status" className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
    평가를 불러올 수 없습니다. <button type="button" className="font-semibold underline" onClick={retry}>다시 불러오기</button>
  </p>
}

export function ReviewControls({ summary, version, canVote, saving, expandedReasons, onVote }: {
  summary: ReviewSummary
  version: string
  canVote: boolean
  saving: string
  expandedReasons?: boolean
  onVote: (choice: VersionVote | null, reasons: string[]) => Promise<boolean>
}) {
  const [draft, setDraft] = useState<{ vote: VersionVote; reasons: string[] }>()
  const editorId = useId()
  const { likes, dislikes, myVote, releaseId } = summary
  const rate = positiveRate(likes, dislikes)
  const legacy = myVote === null ? readLegacyVote(releaseId) : null

  function edit(choice: VersionVote) {
    setDraft(current => current?.vote === choice ? current : {
      vote: choice,
      reasons: choice === myVote ? summary.myReasons ?? [] : [],
    })
  }

  async function save(choice: VersionVote | null, reasons: string[]) {
    if (await onVote(choice, reasons)) setDraft(undefined)
  }

  return <div className="review-reasons">
    <p aria-live="polite" className="mb-3 mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm text-slate-600">
      <span>좋아요 {likes.toLocaleString('ko-KR')}표</span>
      <span>아쉬워요 {dislikes.toLocaleString('ko-KR')}표</span>
      <span>전체 {(likes + dislikes).toLocaleString('ko-KR')}표</span>
      <span>{rate === null ? '평가 대기 중' : `긍정 비율 ${rate}%`}</span>
    </p>
    {legacy && <p className="mb-2 text-xs text-slate-600">
      이 브라우저의 이전 평가: {legacy === 'like' ? '좋아요' : '아쉬워요'}. 평가를 다시 제출하면 전체 집계에 반영됩니다.
    </p>}
    {canVote && <div aria-busy={saving === releaseId}>
      <div className="review-vote-actions">
        {([{ value: 'like', label: '좋아요', Icon: ThumbsUp }, { value: 'dislike', label: '아쉬워요', Icon: ThumbsDown }] as const)
          .map(({ value, label, Icon }) => (
            <button key={value} type="button" className="review-vote" data-tone={value} aria-label={`${version} ${label}`}
              aria-pressed={(draft?.vote ?? myVote) === value} aria-expanded={draft?.vote === value}
              aria-controls={draft ? editorId : undefined} disabled={Boolean(saving)} onClick={() => edit(value)}>
              <Icon size={16} aria-hidden="true" />{label}
            </button>
          ))}
        {myVote && !draft && <button type="button" className="review-quiet" disabled={Boolean(saving)}
          onClick={() => void save(null, [])}>평가 취소</button>}
      </div>
      {draft && <form id={editorId} className="review-editor" data-tone={draft.vote} onSubmit={event => {
        event.preventDefault()
        void save(draft.vote, draft.reasons)
      }}>
        <fieldset disabled={Boolean(saving)}>
          <legend className="review-editor-title">
            {draft.vote === 'like' ? '어떤 점이 좋았나요?' : '어떤 점이 아쉬웠나요?'}
            {' '}<span aria-live="polite">선택 사항 · {draft.reasons.length}/{maxReasons}</span>
          </legend>
          <div className="review-chips">
            {reasonOptions.map(({ id, Icon, ...labels }) => {
              const checked = draft.reasons.includes(id)
              return <label key={id} className="review-chip">
                <Icon size={16} aria-hidden="true" />
                {labels[draft.vote]}
                <input type="checkbox" className="review-check" checked={checked}
                  disabled={!checked && draft.reasons.length >= maxReasons}
                  onChange={event => {
                    const selected = event.currentTarget.checked
                    setDraft({ ...draft, reasons: selected ? [...draft.reasons, id] : draft.reasons.filter(reason => reason !== id) })
                  }} />
              </label>
            })}
          </div>
          <div className="review-editor-footer">
            <button type="button" className="review-quiet" onClick={() => setDraft(undefined)}>닫기</button>
            <button type="submit" className="review-save">{saving === releaseId ? '저장 중…' : '평가 저장'}</button>
          </div>
        </fieldset>
      </form>}
    </div>}
    {saving === releaseId && <p role="status" className="mt-2 text-xs text-slate-600">평가를 저장하는 중입니다.</p>}
    <ReviewReasonResults summary={summary} expanded={expandedReasons} />
  </div>
}
