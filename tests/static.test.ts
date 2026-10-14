import assert from 'node:assert/strict';
import path from 'node:path';
import { test } from 'node:test';
import { resolveStaticPath } from '../server/static.ts';

test('Windows : la page d’accueil et les fichiers sont trouvés', () => {
  const dist = 'C:\\Users\\Pascal\\Documents\\MaisonParadoxe\\le-lotissement\\dist';
  const w = path.win32;
  assert.equal(resolveStaticPath(dist, '/', w), dist + '\\index.html');
  assert.equal(resolveStaticPath(dist, '/controller.html', w), dist + '\\controller.html');
  assert.equal(resolveStaticPath(dist, '/assets/host-abc.js', w), dist + '\\assets\\host-abc.js');
});

test('macOS et Linux : mêmes résultats', () => {
  assert.equal(resolveStaticPath('/srv/le-lotissement/dist', '/', path.posix), '/srv/le-lotissement/dist/index.html');
  assert.equal(resolveStaticPath('/srv/le-lotissement/dist', '/assets/a.js', path.posix), '/srv/le-lotissement/dist/assets/a.js');
});

test('les tentatives de sortir du dossier sont refusées ou ramenées dedans', () => {
  for (const p of [path.win32, path.posix]) {
    const dist = p === path.win32 ? 'C:\\game\\dist' : '/game/dist';
    const mal = ['/..\\secret', '/a%5C..%5Cb', '/%00', '/%zz'];
    for (const bad of mal) assert.equal(resolveStaticPath(dist, bad, p), null, bad);
    for (const bad of ['/../secret', '/..%2fsecret', '/%2e%2e/secret', '/a/../../b', '//etc/passwd', '/../../windows/win.ini']) {
      const f = resolveStaticPath(dist, bad, p);
      assert.ok(f === null || f.startsWith(dist + p.sep), `${bad} → ${f}`);
    }
  }
});
