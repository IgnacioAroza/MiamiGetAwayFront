import test from 'node:test';
import assert from 'node:assert/strict';
import { runLocked, isLocked } from '../src/hooks/useSubmitLock.js';

test('dos submits seguidos envían una sola request', async () => {
  let calls = 0;
  let finish;
  const send = () => { calls++; return new Promise(resolve => { finish = resolve; }); };
  const first = runLocked('villa', send);
  const second = runLocked('villa', send);
  assert.equal(isLocked('villa'), true);
  assert.equal(await second, undefined);
  finish('ok');
  assert.equal(await first, 'ok');
  assert.equal(calls, 1);
  assert.equal(isLocked('villa'), false);
});

test('se rehabilita tras un error y permite reintentar', async () => {
  await assert.rejects(runLocked('auto', async () => { throw new Error('boom'); }), /boom/);
  assert.equal(isLocked('auto'), false);
  assert.equal(await runLocked('auto', async () => 'reintento'), 'reintento');
});

test('claves distintas no se bloquean entre sí', async () => {
  let finish;
  const a = runLocked('yate', () => new Promise(resolve => { finish = resolve; }));
  assert.equal(await runLocked('experiencia', async () => 'libre'), 'libre');
  finish();
  await a;
});
