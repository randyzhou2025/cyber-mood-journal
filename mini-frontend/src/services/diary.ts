import Taro from '@tarojs/taro';
import { request } from './request';

export interface DiaryEntry {
  id: string;
  title: string;
  content: string;
  location?: string;
  tags?: string[];
  images?: string[];
  happenedAt?: string;
  createdAt?: string;
}

export interface CreateDiaryDto {
  title: string;
  content: string;
  location?: string;
  tags?: string[];
  images?: string[];
  happenedAt?: string;
}

export function fetchDiaryList() {
  return request<null, DiaryEntry[]>({ url: '/diary' });
}

export function createDiary(payload: CreateDiaryDto) {
  return request<CreateDiaryDto, DiaryEntry>({ url: '/diary', method: 'POST', data: payload });
}

export function removeDiary(id: string) {
  return request<null, DiaryEntry>({ url: `/diary/${id}`, method: 'DELETE' });
}

const baseUrl =
  (Taro.getApp?.()?.globalData as any)?.apiBase ||
  (Taro.getEnv() === Taro.ENV_TYPE.WEB && (globalThis as any)?.process?.env?.TARO_APP_API_BASE
    ? (globalThis as any).process.env.TARO_APP_API_BASE
    : '') ||
  'http://localhost:3001';

export async function uploadImage(filePath: string): Promise<string> {
  const res = await Taro.uploadFile({
    url: `${baseUrl}/upload`,
    filePath,
    name: 'file'
  });
  const data = JSON.parse(res.data || '{}');
  return data.url;
}
