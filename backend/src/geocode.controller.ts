import { Controller, Get, Query } from '@nestjs/common';
import { setTimeout as sleep } from 'timers/promises';

@Controller('geocode')
export class GeocodeController {
  private async requestJson(url: string) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'cyber-mood-journal/1.0 (demo)'
        },
        signal: controller.signal
      });
      if (!res.ok) {
        return { ok: false, error: `status ${res.status}` };
      }
      const data = await res.json();
      return { ok: true, data };
    } catch (e: any) {
      return { ok: false, error: e?.message || 'request failed' };
    } finally {
      clearTimeout(timer);
    }
  }

  @Get()
  async reverse(@Query('lat') lat?: string, @Query('lng') lng?: string) {
    if (!lat || !lng) {
      return { address: '', displayName: '', error: 'lat,lng required' };
    }
    const numLat = Number(lat);
    const numLng = Number(lng);
    const urls = [
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=zh-CN`,
      `https://nominatim.qwant.com/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=zh-CN`
    ];
    for (const url of urls) {
      const res = await this.requestJson(url);
      if (res.ok && res.data) {
        const displayName =
          (res.data as any).display_name ||
          (res.data as any).address?.city ||
          '';
        if (displayName) {
          return { address: displayName, displayName };
        }
      }
      // avoid hitting providers too quickly
      await sleep(200);
    }
    // fallback: simple bounding-box heuristic for常见城市，避免完全失败
    const heuristic = this.coarseCity(numLat, numLng);
    if (heuristic) {
      return { address: heuristic, displayName: heuristic, error: 'geocode failed (fallback city)' };
    }
    return { address: `坐标(${lat},${lng})`, displayName: `坐标(${lat},${lng})`, error: 'geocode failed' };
  }

  private coarseCity(lat: number, lng: number): string | null {
    if (isNaN(lat) || isNaN(lng)) return null;
    if (lat > 30 && lat < 32 && lng > 120 && lng < 122.5) return '上海市';
    if (lat > 39 && lat < 41.5 && lng > 115 && lng < 117.5) return '北京市';
    if (lat > 22 && lat < 23.3 && lng > 113.7 && lng < 114.6) return '深圳市';
    if (lat > 22.4 && lat < 23.7 && lng > 112.8 && lng < 114.3) return '广州市';
    if (lat > 30 && lat < 31.5 && lng > 103.3 && lng < 104.8) return '成都市';
    if (lat > 29 && lat < 31 && lng > 120 && lng < 121.5) return '杭州市';
    if (lat > 31 && lat < 33 && lng > 118 && lng < 120) return '南京市';
    if (lat > 22.1 && lat < 22.7 && lng > 113.8 && lng < 114.3) return '香港';
    return null;
  }
}
