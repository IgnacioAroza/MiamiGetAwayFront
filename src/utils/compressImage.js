export const TARGET_BYTES = 1024 * 1024;
export const MAX_BYTES = 10 * TARGET_BYTES;
export const MAX_SIDE = 1920;

export class ImageProcessingError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
}

const outputType = (type) => type === 'image/png' ? 'image/png' : type === 'image/webp' ? 'image/webp' : 'image/jpeg';
const outputName = (name, type) => name.replace(/\.[^.]+$/, '') + (type === 'image/png' ? '.png' : type === 'image/webp' ? '.webp' : '.jpg');
const encode = (canvas, type, quality) => new Promise((resolve, reject) => {
  canvas.toBlob(blob => blob ? resolve(blob) : reject(new ImageProcessingError('encode')), type, quality);
});

export async function compressImage(file, options = {}) {
  const decode = options.decode || ((source) => createImageBitmap(source, { imageOrientation: 'from-image' }));
  const makeCanvas = options.createCanvas || (() => document.createElement('canvas'));
  const targetBytes = options.targetBytes || TARGET_BYTES;
  const maxBytes = options.maxBytes || MAX_BYTES;
  const maxSide = options.maxSide || MAX_SIDE;
  let bitmap;

  if (!file?.type?.startsWith('image/')) throw new ImageProcessingError('unsupported');
  try {
    bitmap = await decode(file);
  } catch {
    throw new ImageProcessingError(file.type === 'image/heic' || file.type === 'image/heif' || /\.hei[cf]$/i.test(file.name) ? 'heic' : 'decode');
  }

  try {
    const width = bitmap.width;
    const height = bitmap.height;
    if (!width || !height) throw new ImageProcessingError('decode');
    if (Math.max(width, height) <= maxSide && file.size <= targetBytes) return file;
    if (file.type === 'image/gif') throw new ImageProcessingError('animatedGif');

    const type = outputType(file.type);
    const canvas = makeCanvas();
    const context = canvas.getContext('2d', { alpha: type !== 'image/jpeg' });
    if (!context) throw new ImageProcessingError('encode');
    let scale = Math.min(1, maxSide / Math.max(width, height));
    let blob;
    for (let sizePass = 0; sizePass < 6; sizePass++) {
      canvas.width = Math.max(1, Math.round(width * scale));
      canvas.height = Math.max(1, Math.round(height * scale));
      if (type === 'image/jpeg') {
        context.fillStyle = '#fff';
        context.fillRect(0, 0, canvas.width, canvas.height);
      }
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      for (const quality of type === 'image/png' ? [undefined] : [0.85, 0.72, 0.6, 0.48]) {
        blob = await encode(canvas, type, quality);
        if (blob.size <= targetBytes) break;
      }
      if (blob.size <= targetBytes) break;
      scale *= 0.8;
    }
    canvas.width = canvas.height = 0;
    if (blob.size > maxBytes) throw new ImageProcessingError('tooLarge');
    const actualType = blob.type || type;
    return new File([blob], outputName(file.name, actualType), { type: actualType, lastModified: file.lastModified });
  } finally {
    bitmap?.close?.();
  }
}
