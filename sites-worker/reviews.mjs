const summarySql = `
  SELECT requested.value AS releaseId,
         COUNT(CASE WHEN votes.vote = 'like' THEN 1 END) AS likes,
         COUNT(CASE WHEN votes.vote = 'dislike' THEN 1 END) AS dislikes,
         MAX(CASE WHEN votes.voter_key = ? THEN votes.vote END) AS myVote
  FROM json_each(?) AS requested
  LEFT JOIN release_votes AS votes ON votes.release_id = requested.value
  GROUP BY requested.value
`

async function voterKey(request) {
  // Sites injects this header after authenticating the visitor at the edge.
  const id = request.headers.get('oai-authenticated-user-id')
  if (!id) return null
  const bytes = new TextEncoder().encode('appdate:release-vote:' + id)
  const hash = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, '0')).join('')
}

async function readVoteBody(request) {
  if (request.headers.get('Content-Type')?.split(';')[0].trim() !== 'application/json' || !request.body) return null
  const reader = request.body.getReader()
  const decoder = new TextDecoder()
  let size = 0
  let text = ''
  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.length
      if (size > 2048) {
        await reader.cancel()
        return null
      }
      text += decoder.decode(value, { stream: true })
    }
    return JSON.parse(text + decoder.decode())
  } catch {
    return null
  } finally {
    reader.releaseLock()
  }
}

export function createReviewsHandler({ apps, updates, json, error }) {
  const known = new Set(updates.filter(release => release.version).map(release => release.id))

  return async function reviews(request, db) {
    const { origin, searchParams } = new URL(request.url)
    const method = request.method
    if (method !== 'GET' && method !== 'PUT') {
      return error(request, 405, 'METHOD_NOT_ALLOWED', 'GET 또는 PUT만 사용할 수 있습니다.', { Allow: 'GET, PUT' })
    }

    try {
      const voter = await voterKey(request)
      if (method === 'PUT') {
        if (!voter) return error(request, 401, 'SIGN_IN_REQUIRED', '로그인 후 평가할 수 있습니다.')
        if (request.headers.get('Origin') !== origin) {
          return error(request, 403, 'INVALID_ORIGIN', '이 사이트에서 평가를 제출해 주세요.')
        }
        const body = await readVoteBody(request)
        const { releaseId, vote } = body ?? {}
        if (typeof releaseId !== 'string' || (vote !== 'like' && vote !== 'dislike' && vote !== null)) {
          return error(request, 400, 'INVALID_VOTE', '릴리스와 평가 값을 확인해 주세요.')
        }
        if (!known.has(releaseId)) return error(request, 404, 'RELEASE_NOT_FOUND', '평가 가능한 버전을 찾을 수 없습니다.')

        const mutation = vote === null
          ? db.prepare('DELETE FROM release_votes WHERE release_id = ? AND voter_key = ?').bind(releaseId, voter)
          : db.prepare(`
            INSERT INTO release_votes (release_id, voter_key, vote) VALUES (?, ?, ?)
            ON CONFLICT (release_id, voter_key) DO UPDATE SET vote = excluded.vote
          `).bind(releaseId, voter, vote)
        const [, summary] = await db.batch([mutation, db.prepare(summarySql).bind(voter, JSON.stringify([releaseId]))])
        return json(request, summary.results[0])
      }

      const releaseId = searchParams.get('releaseId')
      const appId = searchParams.get('appId')
      const platform = searchParams.get('platform')
      let releaseIds
      if (releaseId !== null && [...searchParams].length === 1) {
        if (!known.has(releaseId)) return error(request, 404, 'RELEASE_NOT_FOUND', '평가 가능한 버전을 찾을 수 없습니다.')
        releaseIds = [releaseId]
      } else if (releaseId === null && appId && (platform === 'ios' || platform === 'android') && [...searchParams].length === 2) {
        const app = apps.get(appId)
        if (!app) return error(request, 404, 'APP_NOT_FOUND', '등록된 앱을 찾을 수 없습니다.')
        const store = app.stores.find(store => store.platform === platform)
        releaseIds = store?.releases.filter(release => release.version).map(release => release.id) ?? []
      } else {
        return error(request, 400, 'INVALID_FILTER', '앱과 플랫폼 또는 릴리스를 확인해 주세요.')
      }

      const { results } = await db.prepare(summarySql).bind(voter, JSON.stringify(releaseIds)).all()
      return json(request, { signedIn: voter !== null, reviews: results })
    } catch (exception) {
      console.error('Review database request failed', exception instanceof Error ? exception.name : 'UnknownError')
      return error(request, 503, 'REVIEWS_UNAVAILABLE', '평가 서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.')
    }
  }
}
