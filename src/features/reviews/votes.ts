import type { VersionVote } from '../../types'

type VoteStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

export function voteKey(releaseId: string) {
  return `appdate:version-vote:v1:${releaseId}`
}

export function getVoteStorage(): VoteStorage | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export function readVote(storage: VoteStorage | null, key: string): VersionVote | null {
  try {
    const value = storage?.getItem(key)
    return value === 'like' || value === 'dislike' ? value : null
  } catch {
    return null
  }
}

export function saveVote(storage: VoteStorage | null, key: string, vote: VersionVote | null) {
  if (!storage) return false

  try {
    if (vote) storage.setItem(key, vote)
    else storage.removeItem(key)
    return true
  } catch {
    return false
  }
}

export function nextVote(current: VersionVote | null, selected: VersionVote) {
  return current === selected ? null : selected
}

export function positiveRate(likes: number, dislikes: number) {
  const total = likes + dislikes
  return total === 0 ? null : Math.round(likes / total * 100)
}
