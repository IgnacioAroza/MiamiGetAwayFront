import { useRef, useState } from 'react';
import { compressImage, MAX_BYTES } from '../utils/compressImage.js';

export function createImageFileQueue({ limit, process = compressImage, allowPdf = false, onChange = () => {} }) {
  let files = [];
  let issues = [];
  let pending = 0;
  let processing = false;
  let done = 0;
  let total = 0;
  let generation = 0;
  let tail = Promise.resolve();
  const snapshot = () => ({ files: [...files], issues: [...issues], pending, processing, done, total });
  const emit = () => onChange(snapshot());
  const reset = () => {
    generation++;
    files = [];
    issues = [];
    pending = done = total = 0;
    processing = false;
    tail = Promise.resolve();
    emit();
  };
  const setFiles = (next) => { files = [...next]; emit(); };
  const add = (selected, existingCount = 0) => {
    const batch = Array.from(selected || []);
    issues = [];
    const available = Math.max(0, limit - existingCount - files.length - pending);
    const accepted = batch.slice(0, available);
    for (const rejected of batch.slice(available)) issues.push({ name: rejected.name, code: 'limit', limit });
    if (!accepted.length) { emit(); return tail; }
    pending += accepted.length;
    total += accepted.length;
    processing = true;
    emit();
    const currentGeneration = generation;
    tail = tail.then(async () => {
      for (const file of accepted) {
        await new Promise(resolve => setTimeout(resolve, 0));
        if (generation !== currentGeneration) return;
        try {
          let result;
          if (allowPdf && file.type === 'application/pdf') {
            if (file.size > MAX_BYTES) throw { code: 'tooLarge' };
            result = file;
          } else {
            result = await process(file);
          }
          if (generation !== currentGeneration) return;
          files.push(result);
        } catch (error) {
          if (generation !== currentGeneration) return;
          issues.push({ name: file.name, code: error?.code || 'decode' });
        }
        pending--;
        done++;
        processing = pending > 0;
        emit();
      }
    });
    return tail;
  };
  return { snapshot, add, reset, setFiles, remove: index => setFiles(files.filter((_, i) => i !== index)), clearIssues: () => { issues = []; emit(); } };
}

export default function useImageFiles(options) {
  const [state, setState] = useState({ files: [], issues: [], pending: 0, processing: false, done: 0, total: 0 });
  const queueRef = useRef(null);
  if (!queueRef.current) queueRef.current = createImageFileQueue({ ...options, onChange: setState });
  const queue = queueRef.current;
  return {
    ...state,
    addFiles: queue.add,
    resetFiles: queue.reset,
    setFiles: queue.setFiles,
    removeFile: queue.remove,
    clearIssues: queue.clearIssues,
    canSubmit: () => !queue.snapshot().processing && queue.snapshot().issues.length === 0,
  };
}
