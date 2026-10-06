import test from 'node:test';
import assert from 'node:assert/strict';
import { createImageFileQueue } from '../src/hooks/useImageFiles.js';

const f = name => ({ name, type: 'image/jpeg', size: 20 });

test('respeta límite contando existentes y tandas; conserva orden', async () => {
  const queue = createImageFileQueue({ limit: 3, process: async file => ({ ...file, processed: true }) });
  const first = queue.add([f('a'), f('b')], 1);
  queue.add([f('c')], 1);
  assert.equal(queue.snapshot().processing, true);
  assert.deepEqual(queue.snapshot().issues.map(x => x.name), ['c']);
  await first;
  assert.deepEqual(queue.snapshot().files.map(x => x.name), ['a', 'b']);
  assert.equal(queue.snapshot().processing, false);
  queue.setFiles([...queue.snapshot().files].reverse());
  assert.deepEqual(queue.snapshot().files.map(x => x.name), ['b', 'a']);
});

test('errores por archivo y PDF intacto', async () => {
  const pdf = { name: 'comprobante.pdf', type: 'application/pdf', size: 100 };
  const queue = createImageFileQueue({ limit: 5, allowPdf: true, process: async file => { throw { code: 'heic' }; } });
  await queue.add([pdf, f('error.heic')]);
  assert.equal(queue.snapshot().files[0], pdf);
  assert.deepEqual(queue.snapshot().issues, [{ name: 'error.heic', code: 'heic' }]);
});

test('reset descarta resultados pendientes de formulario cerrado', async () => {
  let finish;
  const queue = createImageFileQueue({ limit: 1, process: () => new Promise(resolve => { finish = resolve; }) });
  const job = queue.add([f('vieja')]);
  await new Promise(resolve => setTimeout(resolve, 5));
  queue.reset();
  finish(f('vieja'));
  await job;
  assert.deepEqual(queue.snapshot().files, []);
  assert.equal(queue.snapshot().processing, false);
});

test('30 fotos se procesan en orden, con progreso y sin exceder límite', async () => {
  const states = [];
  const queue = createImageFileQueue({ limit: 30, process: async file => file, onChange: state => states.push(state) });
  await queue.add(Array.from({ length: 30 }, (_, i) => f(String(i + 1))));
  assert.deepEqual(queue.snapshot().files.map(x => x.name), Array.from({ length: 30 }, (_, i) => String(i + 1)));
  assert.equal(queue.snapshot().done, 30);
  assert.equal(states.some(x => x.processing && x.pending > 0), true);
  assert.equal(states.at(-1).processing, false);
  await queue.add([f('31')]);
  assert.deepEqual(queue.snapshot().issues, [{ name: '31', code: 'limit', limit: 30 }]);
  queue.clearIssues();
  assert.deepEqual(queue.snapshot().issues, []);
});

test('PDF de más de 10 MiB se identifica y no se agrega', async () => {
  const queue = createImageFileQueue({ limit: 5, allowPdf: true });
  await queue.add([{ name: 'pesado.pdf', type: 'application/pdf', size: 11 * 1024 * 1024 }]);
  assert.deepEqual(queue.snapshot().files, []);
  assert.deepEqual(queue.snapshot().issues, [{ name: 'pesado.pdf', code: 'tooLarge' }]);
});

test('aplica máximos 20, 5 y 1 sin cortar en silencio', async () => {
  for (const limit of [20, 5, 1]) {
    const queue = createImageFileQueue({ limit, process: async file => file });
    await queue.add(Array.from({ length: limit + 1 }, (_, i) => f(String(i + 1))));
    assert.equal(queue.snapshot().files.length, limit);
    assert.deepEqual(queue.snapshot().issues, [{ name: String(limit + 1), code: 'limit', limit }]);
  }
});
