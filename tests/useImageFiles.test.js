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
