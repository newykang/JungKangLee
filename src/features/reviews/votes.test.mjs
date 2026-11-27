import assert from 'node:assert/strict'
import test from 'node:test'
import { nextVote, positiveRate, readVote, saveVote, voteKey } from './votes.ts'

function memoryStorage() {
  const entries = new Map()
  return {
    getItem: (key) => entries.get(key) ?? null,
    setItem: (key, value) => { entries.set(key, value) },
    removeItem: (key) => { entries.delete(key) },
  }
}

test('switches a vote and removes a repeated vote', () => {
  assert.equal(nextVote(null, 'like'), 'like')
  assert.equal(nextVote('like', 'dislike'), 'dislike')
  assert.equal(nextVote('dislike', 'dislike'), null)
})

test('persists one vote per store and version', () => {
  const storage = memoryStorage()
  const ios = voteKey('ios:362057947:26.10.1')
  const android = voteKey('android:com.kakao.talk:26.10.1')
  assert.equal(readVote(storage, ios), null)
  assert.equal(saveVote(storage, ios, 'like'), true)
  assert.equal(saveVote(storage, android, 'dislike'), true)
  assert.equal(readVote(storage, ios), 'like')
  assert.equal(readVote(storage, android), 'dislike')
  assert.equal(saveVote(storage, ios, null), true)
  assert.equal(readVote(storage, ios), null)
})

test('handles unavailable storage and invalid saved values', () => {
  const denied = {
    getItem() { throw new Error('Storage unavailable') },
    setItem() { throw new Error('Storage unavailable') },
    removeItem() { throw new Error('Storage unavailable') },
  }
  const storage = memoryStorage()
  storage.setItem('unknown', 'maybe')
  assert.equal(readVote(storage, 'unknown'), null)
  assert.equal(readVote(denied, 'test'), null)
  assert.equal(saveVote(denied, 'test', 'like'), false)
  assert.equal(saveVote(denied, 'test', null), false)
})

test('displays no percentage at zero votes and rounds non-zero percentages', () => {
  assert.equal(positiveRate(0, 0), null)
  assert.equal(positiveRate(0, 1), 0)
  assert.equal(positiveRate(1, 0), 100)
  assert.equal(positiveRate(2, 1), 67)
})
