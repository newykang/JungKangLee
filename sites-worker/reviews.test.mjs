import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { DatabaseSync } from 'node:sqlite'
import test from 'node:test'
import { createSiteWorker } from './worker.mjs'

const app = { id: 'app', stores: [
  { platform: 'ios', releases: [{ id: 'ios:1', version: '1' }, { id: 'ios:unknown', version: null }] },
  { platform: 'android', releases: [{ id: 'android:1', version: '1' }] },
] }
const worker = createSiteWorker({ catalog: { apps: [app] }, assets: {} })
const origin = 'https://appdate.test'

function fixture(t, beforeMigration = () => {}) {
  const sql = new DatabaseSync(':memory:')
  sql.exec(readFileSync(new URL('../drizzle/0000_release_votes.sql', import.meta.url), 'utf8'))
  sql.exec(readFileSync(new URL('../drizzle/0001_review_visitors.sql', import.meta.url), 'utf8'))
  beforeMigration(sql)
  sql.exec(readFileSync(new URL('../drizzle/0002_vote_reasons.sql', import.meta.url), 'utf8'))
  t.after(() => sql.close())
  const env = { DB: {
    prepare(query) {
      const statement = sql.prepare(query)
      return { bind: (...values) => ({
        all: async () => ({ results: statement.all(...values) }),
        run: async () => statement.run(...values),
        execute: () => statement.all(...values),
      }) }
    },
    async batch(statements) {
      sql.exec('BEGIN')
      try {
        const results = statements.map(statement => ({ results: statement.execute() }))
        sql.exec('COMMIT')
        return results
      } catch (error) {
        sql.exec('ROLLBACK')
        throw error
      }
    },
  } }
  function request(path, { user, cookie, method = 'GET', body, from = origin, fetchSite } = {}) {
    const headers = new Headers()
    if (user) headers.set('oai-authenticated-user-id', user)
    if (cookie) headers.set('Cookie', cookie)
    if (fetchSite) headers.set('Sec-Fetch-Site', fetchSite)
    if (method === 'PUT') {
      headers.set('Origin', from)
      headers.set('Content-Type', 'application/json')
    }
    return worker.fetch(new Request(origin + '/api/reviews' + path, {
      method, headers, body: JSON.stringify(body),
    }), env)
  }
  const read = async (user) => {
    const response = await request('?appId=app&platform=ios', { user })
    assert.equal(response.status, 200)
    assert.equal(response.headers.get('Cache-Control'), 'no-store')
    return response.json()
  }
  const write = async (user, vote, releaseId = 'ios:1', reasons) => {
    const response = await request('', { method: 'PUT', user, body: { releaseId, vote, reasons } })
    assert.equal(response.status, 200)
    return response.json()
  }
  return { request, read, write }
}

test('combines distinct accounts, replaces or removes only their own vote, and separates platforms', async t => {
  const { read, write } = fixture(t)
  await write('first', 'like')
  await write('first', 'like')
  await write('second', 'like')
  await write('third', 'dislike')
  await write('first', 'dislike', 'android:1')
  assert.deepEqual(await read(), {
    signedIn: false,
    canVote: true,
    reviews: [{ releaseId: 'ios:1', likes: 2, dislikes: 1, myVote: null, myReasons: [], reasonCounts: [] }],
  })
  assert.deepEqual((await read('first')).reviews[0], { releaseId: 'ios:1', likes: 2, dislikes: 1, myVote: 'like', myReasons: [], reasonCounts: [] })
  assert.deepEqual(await write('first', 'dislike'), { releaseId: 'ios:1', likes: 1, dislikes: 2, myVote: 'dislike', myReasons: [], reasonCounts: [] })
  assert.deepEqual(await write('first', null), { releaseId: 'ios:1', likes: 1, dislikes: 1, myVote: null, myReasons: [], reasonCounts: [] })
})

test('rejects unissued visitors, cross-origin requests, invalid and unversioned votes', async t => {
  const { request, read } = fixture(t)
  const body = { releaseId: 'ios:1', vote: 'like' }
  assert.equal((await request('', { method: 'PUT', body })).status, 401)
  const unissued = '__Host-appdate-voter=12345678-0000-4000-8000-123456789012'
  assert.equal((await request('', { method: 'PUT', body, cookie: unissued })).status, 401)
  assert.equal((await request('', { method: 'PUT', body, user: 'first', from: 'https://elsewhere.test' })).status, 403)
  assert.equal((await request('', { method: 'PUT', body: { ...body, vote: 'maybe' }, user: 'first' })).status, 400)
  assert.equal((await request('', { method: 'PUT', body: { ...body, releaseId: 'ios:unknown' }, user: 'first' })).status, 404)
  assert.deepEqual((await read()).reviews[0], { releaseId: 'ios:1', likes: 0, dislikes: 0, myVote: null, myReasons: [], reasonCounts: [] })
})

test('anonymous browsers can vote, persist, switch, and remove their own vote', async t => {
  const { request } = fixture(t)
  const query = '?appId=app&platform=ios'
  async function startVisitor() {
    const response = await request(query)
    const header = response.headers.get('Set-Cookie')
    assert.match(header, /^__Host-appdate-voter=/)
    assert.match(header, /Path=\/; Max-Age=31536000; Secure; HttpOnly; SameSite=Lax$/)
    const { signedIn, canVote, reviews } = await response.json()
    assert.equal(signedIn, false)
    assert.equal(canVote, true)
    assert.equal(reviews[0].myVote, null)
    return header.split(';')[0]
  }
  async function vote(cookie, choice, reasons) {
    const response = await request('', { method: 'PUT', cookie, body: { releaseId: 'ios:1', vote: choice, reasons } })
    assert.equal(response.status, 200)
    return response.json()
  }

  const first = await startVisitor()
  assert.deepEqual(await vote(first, 'like'), { releaseId: 'ios:1', likes: 1, dislikes: 0, myVote: 'like', myReasons: [], reasonCounts: [] })
  assert.deepEqual(await vote(first, 'like'), { releaseId: 'ios:1', likes: 1, dislikes: 0, myVote: 'like', myReasons: [], reasonCounts: [] })
  const second = await startVisitor()
  assert.deepEqual(await vote(second, 'dislike'), { releaseId: 'ios:1', likes: 1, dislikes: 1, myVote: 'dislike', myReasons: [], reasonCounts: [] })

  const persisted = await request(query, { cookie: first })
  assert.equal(persisted.headers.has('Set-Cookie'), false)
  assert.equal((await persisted.json()).reviews[0].myVote, 'like')
  assert.deepEqual(await vote(first, 'dislike'), { releaseId: 'ios:1', likes: 0, dislikes: 2, myVote: 'dislike', myReasons: [], reasonCounts: [] })
  assert.deepEqual(await vote(first, null), { releaseId: 'ios:1', likes: 0, dislikes: 1, myVote: null, myReasons: [], reasonCounts: [] })

  const guestReason = await vote(second, 'dislike', ['speed'])
  assert.deepEqual(guestReason.myReasons, ['speed'])
  assert.deepEqual(guestReason.reasonCounts, [{ vote: 'dislike', id: 'speed', count: 1 }])
  const expired = await request(query)
  assert.deepEqual((await expired.json()).reviews[0].myReasons, [])

  const crossSite = await request(query, { fetchSite: 'cross-site' })
  assert.equal(crossSite.headers.has('Set-Cookie'), false)
  assert.equal((await crossSite.json()).canVote, false)
})

test('aggregates reasons by sentiment and changes or removes them with their vote', async t => {
  const { read, write } = fixture(t, sql => {
    sql.exec("INSERT INTO release_votes VALUES ('ios:1', 'historical-voter', 'like')")
  })
  await write('first', 'like', 'ios:1', ['speed', 'features'])
  await write('second', 'like', 'ios:1', ['speed'])
  await write('third', 'dislike', 'ios:1', ['speed'])
  const [summary] = (await read()).reviews
  assert.equal(summary.likes, 3)
  assert.deepEqual(summary.myReasons, [])
  assert.deepEqual(summary.reasonCounts, [
    { vote: 'dislike', id: 'speed', count: 1 },
    { vote: 'like', id: 'features', count: 1 },
    { vote: 'like', id: 'speed', count: 2 },
  ])
  assert.deepEqual((await write('first', 'like')).myReasons, ['speed', 'features'])
  assert.deepEqual((await write('first', 'like', 'ios:1', ['design'])).myReasons, ['design'])
  assert.deepEqual((await write('first', 'dislike', 'ios:1', ['stability'])).reasonCounts, [
    { vote: 'dislike', id: 'speed', count: 1 },
    { vote: 'dislike', id: 'stability', count: 1 },
    { vote: 'like', id: 'speed', count: 1 },
  ])
  assert.deepEqual((await write('first', null)).reasonCounts, [
    { vote: 'dislike', id: 'speed', count: 1 },
    { vote: 'like', id: 'speed', count: 1 },
  ])
})

test('rejects duplicate, unknown, excess and orphaned reasons', async t => {
  const { request, read } = fixture(t)
  for (const [vote, reasons] of [
    ['like', ['speed', 'speed']],
    ['like', ['unknown']],
    ['like', ['speed', 'features', 'stability', 'design']],
    [null, ['speed']],
  ]) {
    const response = await request('', { method: 'PUT', user: 'first', body: { releaseId: 'ios:1', vote, reasons } })
    assert.equal(response.status, 400)
    assert.equal((await response.json()).error.code, 'INVALID_REASONS')
  }
  assert.deepEqual((await read()).reviews[0].reasonCounts, [])
})
