import { getApiBase } from './apiBase';

let cachedBase: string | null = null;

function getBaseOnce(): string {
  if (!cachedBase) {
    cachedBase = getApiBase();
  }
  return cachedBase;
}

export async function apiFetch(
  path: string,
  options?: RequestInit
) {
  const base = getBaseOnce();

  return fetch(`${base}${path}`, {
    ...options,
    headers: {
      ...(options?.headers || {}),
    },
  });
}
