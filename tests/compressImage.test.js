import test from 'node:test';
import assert from 'node:assert/strict';
import { compressImage, ImageProcessingError } from '../src/utils/compressImage.js';

const file = (name, type, size) => ({ name, type, size, lastModified: 1 });
const harness = (width, height, sizes) => {
  const calls = [];
  let closed = false;
  const canvas = {
    width: 0, height: 0,
    getContext: () => ({ fillRect() {}, drawImage() {} }),
    toBlob(callback, type, quality) {
      calls.push({ width: canvas.width, height: canvas.height, type, quality });
      callback({ size: sizes.shift() ?? 500_000 });
    },
  };
  return {
    options: { decode: async () => ({ width, height, close() { closed = true; } }), createCanvas: () => canvas },
    calls,
    isClosed: () => closed,
  };
};

test('conserva archivo chico sin recodificar', async () => {
  const h = harness(1200, 900, []);
  const original = file('foto.jpg', 'image/jpeg', 500_000);
  assert.equal(await compressImage(original, h.options), original);
  assert.equal(h.calls.length, 0);
  assert.equal(h.isClosed(), true);
});

test('redimensiona lado mayor, ajusta calidad y libera bitmap', async () => {
  const oldFile = globalThis.File;
  globalThis.File = class { constructor(parts, name, options) { this.size = parts[0].size; this.name = name; this.type = options.type; } };
  try {
    const h = harness(4000, 3000, [2_000_000, 900_000]);
    const result = await compressImage(file('foto.jpeg', 'image/jpeg', 4_000_000), h.options);
    assert.deepEqual(h.calls.map(x => [x.width, x.height, x.quality]), [[1920, 1440, 0.85], [1920, 1440, 0.72]]);
    assert.equal(result.size, 900_000);
    assert.equal(result.name, 'foto.jpg');
    assert.equal(h.isClosed(), true);
  } finally { globalThis.File = oldFile; }
});

test('PNG conserva transparencia y reduce escala hasta el objetivo', async () => {
  const oldFile = globalThis.File;
  globalThis.File = class { constructor(parts, name, options) { this.size = parts[0].size; this.name = name; this.type = options.type; } };
  try {
    const h = harness(3000, 2000, [2_000_000, 800_000]);
    const result = await compressImage(file('plano.png', 'image/png', 3_000_000), h.options);
    assert.equal(h.calls[0].type, 'image/png');
    assert.equal(h.calls[1].width, 1536);
    assert.equal(result.type, 'image/png');
  } finally { globalThis.File = oldFile; }
});

test('rechaza HEIC ilegible, GIF grande y resultado sobre 10 MiB', async () => {
  await assert.rejects(compressImage(file('iphone.heic', 'image/heic', 3_000_000), { decode: async () => { throw Error(); } }), { code: 'heic' });
  await assert.rejects(compressImage(file('animado.gif', 'image/gif', 2_000_000), harness(2000, 1000, []).options), { code: 'animatedGif' });
  await assert.rejects(compressImage(file('grande.png', 'image/png', 12_000_000), harness(2000, 1000, Array(6).fill(11_000_000)).options), { code: 'tooLarge' });
});
