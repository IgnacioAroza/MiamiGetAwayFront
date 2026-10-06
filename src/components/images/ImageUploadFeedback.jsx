import { Alert, Box, Button, LinearProgress, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

export default function ImageUploadFeedback({ processing, done = 0, total = 0, issues = [], clearIssues }) {
  const { t } = useTranslation(undefined, { lng: 'en' });
  if (!processing && !issues.length) return null;
  return <Box sx={{ mt: 1 }}>
    {processing && <>
      <Typography variant="caption">{t('imageUpload.processing', { done, total })}</Typography>
      <LinearProgress variant="determinate" value={total ? 100 * done / total : 0} />
    </>}
    {issues.map((issue, index) => <Alert key={`${issue.name}-${index}`} severity="error" sx={{ mt: 1 }}>
      {issue.name}: {t(`imageUpload.errors.${issue.code}`, { limit: issue.limit, defaultValue: t('imageUpload.errors.decode') })}
    </Alert>)}
    {issues.length > 0 && clearIssues && <Button size="small" onClick={clearIssues} sx={{ mt: 1 }}>{t('imageUpload.dismiss')}</Button>}
  </Box>;
}
