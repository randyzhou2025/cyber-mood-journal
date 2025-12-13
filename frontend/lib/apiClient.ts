import { getApiBase } from './apiBase';

export async function apiFetch(path: string, options?: RequestInit) {
  const base = getApiBase();
  if (!base) {
    throw new Error('API base not ready');
  }

  return fetch(`${base}${path}`, options);
}
