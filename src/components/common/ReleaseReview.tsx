import { useState } from 'react'
import { nextVote, getVoteStorage, readVote, saveVote, voteKey } from '../../features/reviews/votes'
import type { VersionVote } from '../../types'

export default function ReleaseReview({ id, version }: { id: string; version: string }) {
  const key = voteKey(id)
  const [vote, setVote] = useState(() => readVote(getVoteStorage(), key))
  const [localOnly, setLocalOnly] = useState(false)
  function choose(choice: VersionVote) {
    const next = nextVote(vote, choice)
    setLocalOnly(!saveVote(getVoteStorage(), key, next))
    setVote(next)
  }
  return <section className="pane"><h2>이 버전은 어땠나요?</h2><p className="subtext">v{version} · 이 브라우저의 평가 {vote ? 1 : 0}건</p>
    <div className="group-tabs">{(['like', 'dislike'] as const).map(choice =>
      <button className="pill" key={choice} aria-pressed={vote === choice} onClick={() => choose(choice)}>{choice === 'like' ? '좋아요' : '아쉬워요'}</button>)}</div>
    {localOnly && <p>새로고침하면 이번 평가가 사라져요.</p>}
  </section>
}
