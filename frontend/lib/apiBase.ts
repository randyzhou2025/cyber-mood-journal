let cached: string | null = null;

export function getApiBase(): string {
  if (cached) return cached;

  // SSR / build 阶段兜底
  if (typeof window === 'undefined') {
    return '';
  }

  // ✅ 统一使用 nginx 反代
  cached = '/api';
  return cached;
}
