import { useSyncExternalStore } from 'react';

// Lock por clave a nivel de módulo: sobrevive a cerrar/reabrir el modal mientras la request sigue en vuelo.
const inFlight = new Set();
const listeners = new Set();
const notify = () => listeners.forEach(l => l());
const subscribe = l => { listeners.add(l); return () => listeners.delete(l); };

export const isLocked = key => inFlight.has(key);

// Ejecuta fn solo si no hay otra en vuelo con la misma clave. Devuelve undefined si quedó bloqueada.
export async function runLocked(key, fn) {
  if (inFlight.has(key)) return undefined;
  inFlight.add(key);
  notify();
  try {
    return await fn();
  } finally {
    inFlight.delete(key);
    notify();
  }
}

export default function useSubmitLock(key) {
  const submitting = useSyncExternalStore(subscribe, () => inFlight.has(key));
  return { submitting, run: fn => runLocked(key, fn) };
}
