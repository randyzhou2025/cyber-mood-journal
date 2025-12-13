import Taro from '@tarojs/taro';

const runtimeBase =
  (Taro.getApp?.()?.globalData as any)?.apiBase ||
  (Taro.getEnv() === Taro.ENV_TYPE.WEAPP ? '' : '');

const envBase =
  Taro.getEnv() === Taro.ENV_TYPE.WEB && (globalThis as any)?.process?.env?.TARO_APP_API_BASE
    ? ((globalThis as any).process.env.TARO_APP_API_BASE as string)
    : '';

const BASE_URL = runtimeBase || envBase || 'http://localhost:3001';

interface RequestOptions<T> {
  url: string;
  method?: 'GET' | 'POST' | 'DELETE';
  data?: T;
  header?: Record<string, string>;
}

export async function request<TReq = any, TRes = any>(options: RequestOptions<TReq>): Promise<TRes> {
  const { url, method = 'GET', data, header } = options;
  const res = await Taro.request<TRes>({
    url: `${BASE_URL}${url}`,
    method,
    data,
    header: {
      'Content-Type': 'application/json',
      ...(header || {})
    },
    enableHttp2: true
  });
  return res.data as TRes;
}
