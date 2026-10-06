import test from 'node:test';
import assert from 'node:assert/strict';
import { formatUploadError } from '../src/utils/imageUploadErrors.js';

const translate = (key, values) => values ? `${values.names}: ${values.reason}` : key;
const files = [{ name: 'primera.jpg' }, { name: 'segunda.jpg' }];

test('vincula índice del backend con archivo enviado', () => {
  const error = { response: { data: { error: 'Error uploading images', details: ['Error subiendo imagen 2: Cloudinary falló'] } } };
  assert.equal(formatUploadError(error, files, translate), 'segunda.jpg: Cloudinary falló');
});

test('acepta detalle con nombre y no atribuye error general a una imagen', () => {
  const named = { response: { data: { details: [{ fileName: 'primera.jpg', errors: ['Formato inválido'] }] } } };
  assert.equal(formatUploadError(named, files, translate), 'primera.jpg: Formato inválido');
  const generic = { response: { data: { error: 'Servidor sin memoria' } } };
  assert.equal(formatUploadError(generic, files, translate), 'primera.jpg, segunda.jpg: Servidor sin memoria');
});
