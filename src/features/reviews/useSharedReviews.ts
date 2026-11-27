import { useEffect, useRef, useState } from 'react'
import type { VersionVote } from '../../types'
import { getVoteStorage, readVote, saveVote, voteKey } from './votes'

export type ReviewSummary = {
  releaseId: string
  likes: number
  dislikes: number
  myVote: VersionVote | null
  myReasons: string[]
  reasonCounts: { vote: VersionVote; id: string; count: number }[]
}
type ReviewPayload = { canVote: boolean; reviews: ReviewSummary[] }
type ReviewState = { query: string; data?: ReviewPayload; error?: 'unavailable' | 'no-api' }

export function useSharedReviews(query: string) {
  const [state, setState] = useState<ReviewState>()
  const [revision, setRevision] = useState(0)
  const [saving, setSaving] = useState('')
  const [saveError, setSaveError] = useState<{ query: string; message: string }>()
  const pending = useRef(false)
  const current = state?.query === query ? state : undefined

  useEffect(() => {
    if (!query) return
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 8_000)
    let active = true
    fetch('/api/reviews?' + query, { signal: controller.signal }).then(async response => {
      if (response.status === 404 || (response.ok && !response.headers.get('Content-Type')?.includes('application/json'))) {
        if (active) setState({ query, error: 'no-api' })
        return
      }
      if (!response.ok) throw new Error('Review request failed')
      const data: ReviewPayload = await response.json()
      if (typeof data.canVote !== 'boolean' || !Array.isArray(data.reviews)) throw new Error('Invalid review response')
      if (active) setState({ query, data })
    }).catch(() => {
      if (active) setState({ query, error: 'unavailable' })
    }).finally(() => window.clearTimeout(timeout))
    return () => {
      active = false
      window.clearTimeout(timeout)
      controller.abort()
    }
  }, [query, revision])

  async function castVote(summary: ReviewSummary, vote: VersionVote | null, reasons: string[]) {
    if (pending.current || !current?.data?.canVote) return false
    pending.current = true
    setSaving(summary.releaseId)
    setSaveError(undefined)
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 8_000)
    try {
      const response = await fetch('/api/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ releaseId: summary.releaseId, vote, reasons }),
        signal: controller.signal,
      })
      if (response.status === 401) {
        setState(latest => latest?.query === query && latest.data ? {
          ...latest, data: { canVote: false, reviews: latest.data.reviews.map(row => ({ ...row, myVote: null, myReasons: [] })) },
        } : latest)
        setSaveError({ query, message: '이 사이트의 쿠키를 허용한 후 평가를 다시 불러와 주세요.' })
        return false
      }
      if (!response.ok) throw new Error('Vote save failed')
      const updated: ReviewSummary = await response.json()
      if (updated.releaseId !== summary.releaseId) throw new Error('Invalid vote response')
      saveVote(getVoteStorage(), voteKey(summary.releaseId), null)
      setState(latest => latest?.query === query && latest.data ? {
        ...latest, data: {
          canVote: latest.data.canVote,
          reviews: latest.data.reviews.map(row => row.releaseId === updated.releaseId ? updated : row),
        },
      } : latest)
      return true
    } catch {
      setSaveError({ query, message: '평가 저장을 확인하지 못했습니다. 다시 시도해 주세요.' })
      return false
    } finally {
      window.clearTimeout(timeout)
      pending.current = false
      setSaving('')
    }
  }

  return {
    data: current?.data,
    loading: Boolean(query) && !current,
    error: current?.error,
    saving,
    saveError: saveError?.query === query ? saveError.message : '',
    castVote,
    retry: () => { setState(undefined); setSaveError(undefined); setRevision(value => value + 1) },
  }
}

export function readLegacyVote(releaseId: string) {
  return readVote(getVoteStorage(), voteKey(releaseId))
}
