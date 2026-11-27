import { createReviewsHandler } from './reviews.mjs';

const allow = { Allow: 'GET, HEAD' };

function json(request, value, status = 200, headers) {
  return new Response(request.method === 'HEAD' ? null : JSON.stringify(value), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...headers,
    },
  });
}

function error(request, status, code, message, headers) {
  return json(request, { error: { code, message } }, status, headers);
}

export function createSiteWorker({ catalog, assets, revision }) {
  const apps = new Map(catalog.apps.map(app => [app.id, app]));
  const updates = catalog.apps.flatMap(app => app.stores.flatMap(store =>
    store.releases.map(release => ({
      ...release, appId: app.id, appName: store.name, platform: store.platform, storeUrl: store.storeUrl,
    })),
  )).sort((left, right) => (right.updatedOn ?? '').localeCompare(left.updatedOn ?? '') || left.id.localeCompare(right.id));

  const reviews = createReviewsHandler({ apps, updates, json, error });

  return {
    fetch(request, env) {
      const { pathname, searchParams } = new URL(request.url);
      if (pathname === '/api/reviews') return reviews(request, env?.DB);
      if (pathname.startsWith('/api/')) {
        if (request.method !== 'GET' && request.method !== 'HEAD') {
          return error(request, 405, 'METHOD_NOT_ALLOWED', 'GET 또는 HEAD만 사용할 수 있습니다.', allow);
        }
        if (pathname === '/api/health') {
          return json(request, { status: 'ok', revision, observedOn: catalog.observedOn, apps: apps.size, updates: updates.length });
        }
        if (pathname === '/api/catalog') return json(request, catalog);
        if (pathname === '/api/updates') {
          const appId = searchParams.get('appId');
          const platform = searchParams.get('platform');
          if ([...searchParams.keys()].some(key => key !== 'appId' && key !== 'platform') ||
              searchParams.getAll('appId').length > 1 || searchParams.getAll('platform').length > 1 ||
              (platform !== null && platform !== 'ios' && platform !== 'android') || appId === '') {
            return error(request, 400, 'INVALID_FILTER', 'appId와 platform(ios 또는 android)을 확인해 주세요.');
          }
          if (appId !== null && !apps.has(appId)) {
            return error(request, 404, 'APP_NOT_FOUND', '등록된 앱을 찾을 수 없습니다.');
          }
          return json(request, {
            observedOn: catalog.observedOn,
            updates: updates.filter(row => (!appId || row.appId === appId) && (!platform || row.platform === platform)),
          });
        }
        return error(request, 404, 'ROUTE_NOT_FOUND', 'API 경로를 찾을 수 없습니다.');
      }

      if (request.method !== 'GET' && request.method !== 'HEAD') {
        return new Response('Method not allowed', { status: 405, headers: allow });
      }
      const asset = assets[pathname === '/' ? '/index.html' : pathname];
      if (!asset) return new Response(request.method === 'HEAD' ? null : 'Not found', { status: 404 });
      const [mime, encoded] = asset;
      return new Response(request.method === 'HEAD' ? null : Uint8Array.from(atob(encoded), byte => byte.charCodeAt(0)), {
        headers: {
          'Content-Type': mime,
          'Cache-Control': pathname.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache',
          'X-Content-Type-Options': 'nosniff',
        },
      });
    },
  };
}
