import { Accessibility, BatteryCharging, Gauge, LayoutPanelTop, MousePointer2, ShieldCheck, Sparkles } from 'lucide-react'
import { useState } from 'react'
import type { VersionVote } from '../../types'
import reviewReasons from './review-reasons.json'
import type { ReviewSummary } from './useSharedReviews'
import './review-reasons.css'

const icons = {
  features: Sparkles, usability: MousePointer2, speed: Gauge, stability: ShieldCheck,
  design: LayoutPanelTop, accessibility: Accessibility, resources: BatteryCharging,
}

export const reasonOptions = reviewReasons.items.map(item => ({ ...item, Icon: icons[item.id as keyof typeof icons] }))
export const maxReasons = reviewReasons.max

const number = new Intl.NumberFormat('ko-KR')

export function ReviewReasonResults({ summary, expanded = false }: { summary: ReviewSummary; expanded?: boolean }) {
  const counts = summary.reasonCounts ?? []
  const total = counts.reduce((sum, item) => sum + item.count, 0)
  const [selectedTone, setTone] = useState<VersionVote>()
  const defaultTone = counts.some(item => item.vote === 'like') || !counts.some(item => item.vote === 'dislike') ? 'like' : 'dislike'
  const tone = selectedTone ?? defaultTone
  const ranked = reasonOptions.map(item => ({
    ...item, count: counts.find(count => count.vote === tone && count.id === item.id)?.count ?? 0,
  })).filter(item => item.count > 0).sort((a, b) => b.count - a.count)
  const voters = tone === 'like' ? summary.likes : summary.dislikes

  return <details className="review-insights" open={expanded || total > 0}>
    <summary>
      <span>평가 이유</span>
      <span className="review-insights-total">{total ? `선택 ${number.format(total)}회` : '아직 선택 없음'}</span>
    </summary>
    <div className="review-insights-body" data-tone={tone}>
      <div className="review-segment" role="group" aria-label="집계할 평가 유형">
        <button type="button" aria-pressed={tone === 'like'} onClick={() => setTone('like')}>좋았던 점 <span>{number.format(summary.likes)}명</span></button>
        <button type="button" aria-pressed={tone === 'dislike'} onClick={() => setTone('dislike')}>아쉬웠던 점 <span>{number.format(summary.dislikes)}명</span></button>
      </div>
      {ranked.length ? <>
        <p className="review-insights-note">해당 평가 참여자 중 선택 비율 · 복수 선택</p>
        <ul className="review-rankings" aria-label={tone === 'like' ? '좋았던 점 순위' : '아쉬웠던 점 순위'}>
          {ranked.map(({ id, count, Icon, ...labels }) => {
            const percent = voters ? Math.round(count / voters * 100) : 0
            return <li key={id}>
              <span className="review-rank-fill" aria-hidden="true" style={{ width: `${percent}%` }} />
              <span className="review-rank-label"><Icon size={17} aria-hidden="true" />{labels[tone]}</span>
              <span className="review-rank-number">{number.format(count)}명 <span>{percent}%</span></span>
            </li>
          })}
        </ul>
      </> : <p className="review-insights-note" role="status">{tone === 'like' ? '아직 공유된 좋았던 점이 없어요.' : '아직 공유된 아쉬웠던 점이 없어요.'}</p>}
    </div>
  </details>
}
