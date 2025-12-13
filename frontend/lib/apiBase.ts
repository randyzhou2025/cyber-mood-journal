let cached: string | null = null;

export function getApiBase(): string {
  if (cached) return cached;

  // SSR / build 阶段兜底（防止 next build 崩）
  if (typeof window === 'undefined') {
    return '';
  }

  const { hostname } = window.location;

  // ===== 本地开发 =====
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1'
  ) {
    cached = 'http://localhost:3001';
    return cached;
  }

  // ===== CloudBase 线上 =====
  if (hostname.endsWith('.run.tcloudbase.com')) {
    cached = 'https://cyber-backend-187701-4-1307478258.sh.run.tcloudbase.com';
    return cached;
  }

  // ===== 兜底（防止未知环境）=====
  console.error('Unknown host:', hostname);
  return '';
}
