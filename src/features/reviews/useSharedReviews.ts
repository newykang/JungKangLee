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
type ReviewPayload = { signedIn: boolean; reviews: ReviewSummary[] }
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
      if (typeof data.signedIn !== 'boolean' || !Array.isArray(data.reviews)) throw new Error('Invalid review response')
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
    if (pending.current || !current?.data?.signedIn) return false
    pending.current = true
    setSaving(summary.releaseId)
    setSaveError(undefined)
    try {
      const response = await fetch('/api/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ releaseId: summary.releaseId, vote, reasons }),
        signal: AbortSignal.timeout(8_000),
      })
      if (response.status === 401) {
        setState(latest => latest?.query === query && latest.data ? {
          ...latest, data: { signedIn: false, reviews: latest.data.reviews.map(row => ({ ...row, myVote: null, myReasons: [] })) },
        } : latest)
        setSaveError({ query, message: '로그인 세션이 만료되었습니다. 다시 로그인해 주세요.' })
        return false
      }
      if (!response.ok) throw new Error('Vote save failed')
      const updated: ReviewSummary = await response.json()
      if (updated.releaseId !== summary.releaseId) throw new Error('Invalid vote response')
      saveVote(getVoteStorage(), voteKey(summary.releaseId), null)
      setState(latest => latest?.query === query && latest.data ? {
        ...latest, data: {
          signedIn: latest.data.signedIn,
          reviews: latest.data.reviews.map(row => row.releaseId === updated.releaseId ? updated : row),
        },
      } : latest)
      return true
    } catch {
      setSaveError({ query, message: '평가 저장을 확인하지 못했습니다. 다시 시도해 주세요.' })
      return false
    } finally {
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
    retry: () => { setState(undefined); setRevision(value => value + 1) },
  }
}

export function readLegacyVote(releaseId: string) {
  return readVote(getVoteStorage(), voteKey(releaseId))
}
