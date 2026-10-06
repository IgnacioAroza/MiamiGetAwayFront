import i18next from 'i18next';

export function formatUploadError(error, files = [], t = i18next.getFixedT('en')) {
  const data = error?.response?.data;
  const reason = data?.error || data?.message || (typeof error === 'string' ? error : error?.message) || t('general.error');
  if (!files.length) return reason;
  const details = Array.isArray(data?.details) ? data.details : [];
  const named = details.map(detail => {
    const raw = typeof detail === 'string' ? detail : detail?.message || detail?.error || detail?.errors?.join(', ') || '';
    const numbered = raw.match(/imagen\s+(\d+)\s*:\s*(.*)/i);
    const index = numbered ? Number(numbered[1]) - 1 : Number.isInteger(detail?.fileIndex) ? detail.fileIndex : -1;
    const name = detail?.fileName || files[index]?.name;
    return name ? `${name}: ${numbered ? numbered[2] : raw || reason}` : null;
  }).filter(Boolean);
  if (named.length) return named.join('\n');
  return t('imageUpload.errors.uploadGroup', { names: files.map(file => file.name).join(', '), reason });
}
