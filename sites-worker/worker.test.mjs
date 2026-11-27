import assert from 'node:assert/strict';
import test from 'node:test';
import { createSiteWorker } from './worker.mjs';

const worker = createSiteWorker({
  revision: 'test',
  catalog: { observedOn: '2026-11-27', apps: [{
    id: 'one', stores: [
      { name: 'One', platform: 'ios', storeUrl: 'https://example.com/one', releases: [{ id: 'one-ios', updatedOn: '2026-11-27' }] },
      { name: 'One', platform: 'android', storeUrl: 'https://example.com/one', releases: [{ id: 'one-android', updatedOn: null }] },
    ],
  }] },
  assets: { '/index.html': ['text/html', btoa('<h1>appdate</h1>')] },
});
const serve = (path, method) => worker.fetch(new Request('https://appdate.test' + path, { method }));

test('serves the app, catalog and health', async () => {
  assert.equal(await serve('/').text(), '<h1>appdate</h1>');
  assert.equal((await serve('/api/catalog').json()).apps.length, 1);
  assert.equal((await serve('/api/health').json()).updates, 2);
});

test('filters releases and keeps undated releases at the end', async () => {
  assert.deepEqual((await serve('/api/updates').json()).updates.map(row => row.id), ['one-ios', 'one-android']);
  assert.deepEqual((await serve('/api/updates?appId=one&platform=android').json()).updates.map(row => row.id), ['one-android']);
});

test('rejects bad filters and writes with structured errors', async () => {
  assert.equal(serve('/api/updates?platform=web').status, 400);
  assert.equal(serve('/api/updates?platform=ios&platform=android').status, 400);
  assert.equal((await serve('/api/updates?appId=missing').json()).error.code, 'APP_NOT_FOUND');
  assert.equal(serve('/api/catalog', 'POST').status, 405);
  assert.equal(await serve('/api/catalog', 'HEAD').text(), '');
});
