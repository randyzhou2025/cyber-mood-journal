import { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, Input, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { fetchDiaryList, DiaryEntry, uploadImage, createDiary } from '../../services/diary';
import './index.scss';

const demoData: DiaryEntry[] = [
  {
    id: '1',
    title: '清晨的冷光',
    content: '街道安静，咖啡香混着雾气，思绪被拉回到昨晚的片段。',
    location: '上海 · 浦东',
    tags: ['CALM', 'THINKING'],
    images: [],
    happenedAt: '2025-12-07 07:40'
  },
  {
    id: '2',
    title: '霓虹雨幕',
    content: '雨滴敲击雨棚，霓虹映在水面，情绪像波纹一圈圈散开。',
    location: '成都 · 锦江',
    tags: ['RAIN', 'CITY'],
    images: [
      'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=600&q=80'
    ],
    happenedAt: '2025-12-06 22:10'
  }
];

const API_BASE =
  (Taro.getApp?.()?.globalData as any)?.apiBase ||
  (Taro.getEnv() === Taro.ENV_TYPE.WEB && (globalThis as any)?.process?.env?.TARO_APP_API_BASE
    ? (globalThis as any).process.env.TARO_APP_API_BASE
    : '') ||
  'http://localhost:3001';
const buildImageUrl = (url: string) => (url.startsWith('http') ? url : `${API_BASE}${url}`);

export default function IndexPage() {
  const [list, setList] = useState<DiaryEntry[]>(demoData);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    content: '',
    location: '',
    tags: '',
    images: [] as string[]
  });
  const [submitting, setSubmitting] = useState(false);
  const [locLoading, setLocLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchDiaryList();
        if (data && Array.isArray(data) && data.length > 0) {
          setList(data);
        } else {
          setList(demoData);
          Taro.showToast({ title: '暂无数据，展示示例', icon: 'none' });
        }
      } catch (e) {
        console.log('fetch diary list fallback to demo', e);
        Taro.showToast({ title: '使用示例数据', icon: 'none' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleFormChange = (key: keyof typeof form, value: string | string[]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleUploadToForm = async () => {
    try {
      setUploading(true);
      const media = await Taro.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sourceType: ['album', 'camera']
      });
      const filePath = media.tempFiles?.[0]?.tempFilePath;
      if (!filePath) return;
      const url = await uploadImage(filePath);
      setForm((prev) => ({ ...prev, images: [...prev.images, url] }));
      Taro.showToast({ title: '上传成功', icon: 'success' });
    } catch (e) {
      console.error(e);
      Taro.showToast({ title: '上传失败', icon: 'none' });
    } finally {
      setUploading(false);
    }
  };

  const handleGetLocation = () => {
    setLocLoading(true);
    Taro.getLocation({
      type: 'wgs84',
      success: async (res) => {
        const coord = `lat:${res.latitude.toFixed(5)}, lng:${res.longitude.toFixed(5)}`;
        handleFormChange('location', coord);
        try {
          const geo = await Taro.request({
            url: `${API_BASE}/geocode`,
            method: 'GET',
            data: { lat: res.latitude, lng: res.longitude }
          });
          if ((geo.data as any)?.address) {
            handleFormChange('location', (geo.data as any).address as string);
          }
        } catch (e) {
          console.error('geocode failed', e);
        } finally {
          setLocLoading(false);
        }
      },
      fail: (err) => {
        console.error(err);
        Taro.showToast({ title: '定位失败', icon: 'none' });
        setLocLoading(false);
      }
    });
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      Taro.showToast({ title: '标题和内容必填', icon: 'none' });
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        title: form.title.trim(),
        content: form.content.trim(),
        location: form.location.trim() || undefined,
        tags: form.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        images: form.images,
        happenedAt: new Date().toISOString()
      };
      const created = await createDiary(payload);
      setList((prev) => [{ ...created }, ...prev]);
      setModalOpen(false);
      setForm({ title: '', content: '', location: '', tags: '', images: [] });
      Taro.showToast({ title: '已记录', icon: 'success' });
    } catch (e) {
      console.error(e);
      Taro.showToast({ title: '提交失败', icon: 'none' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView className="scroll-container" scrollY enableFlex>
      <View className="page" style={{ padding: '16px 14px 24px' }}>
        <View className="top">
          <View className="top-left">
            <Text className="eyebrow">CYBER MOOD JOURNAL</Text>
          </View>
          <View className="actions">
            <View className="primary-btn" hoverClass="action-hover" onClick={() => setModalOpen(true)}>
              + 记录新情绪
            </View>
          </View>
        </View>

        <View className="timeline">
          <View className="timeline-line" />
          {list.map((item) => (
            <View className="row" key={item.id}>
              <View className="dot" />
              <View className="time">{item.happenedAt || item.createdAt || ''}</View>
              <View className="card">
                <View className="card-head">
                  <View>
                    <View className="card-title">{item.title}</View>
                    {item.location && <View className="location">📍 {item.location}</View>}
                  </View>
                  <View className="tags">
                    {item.tags?.map((t) => (
                      <Text className="tag" key={t}>
                        {t}
                      </Text>
                    ))}
                  </View>
                </View>
                <View className="content">{item.content}</View>
                {item.images && item.images.length > 0 && (
                  <View className="gallery">
                    {item.images.map((img) => (
                      <Image key={img} src={buildImageUrl(img)} mode="aspectFill" className="photo" />
                    ))}
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>

        {loading && <View className="loading">加载中...</View>}
        {!loading && list.length === 0 && <View className="loading">暂无数据</View>}

        {modalOpen && (
          <View className="modal-overlay" onClick={() => setModalOpen(false)}>
            <View className="modal" onClick={(e) => e.stopPropagation()}>
              <View className="modal-header">
                <View className="modal-title">记录新情绪</View>
                <View className="modal-close" onClick={() => setModalOpen(false)}>
                  ✕
                </View>
              </View>
              <View className="modal-body">
                <View className="form-item">
                  <Text className="label">标题*</Text>
                  <Input
                    value={form.title}
                    onInput={(e) => handleFormChange('title', e.detail.value)}
                    placeholder="今天的情绪标题"
                  />
                </View>
                <View className="form-item">
                  <Text className="label">内容*</Text>
                  <Textarea
                    value={form.content}
                    onInput={(e) => handleFormChange('content', e.detail.value)}
                    placeholder="描述当时的感受与场景..."
                    className="textarea"
                  />
                </View>
                <View className="form-item">
                  <Text className="label">地点</Text>
                  <View className="location-row">
                    <Input
                      value={form.location}
                      onInput={(e) => handleFormChange('location', e.detail.value)}
                      placeholder="如 上海 · 浦东 或 自动定位"
                      className="flex-1"
                    />
                    <View
                      className="ghost-btn"
                      onClick={handleGetLocation}
                      hoverClass="action-hover"
                    >
                      {locLoading ? '定位中...' : '获取定位'}
                    </View>
                  </View>
                </View>
                <View className="form-item">
                  <Text className="label">标签（用逗号分隔）</Text>
                  <Input
                    value={form.tags}
                    onInput={(e) => handleFormChange('tags', e.detail.value)}
                    placeholder="CALM, THINKING"
                  />
                </View>
                <View className="form-item">
                  <Text className="label">图片</Text>
                  <View className="upload-row">
                    <View className="ghost-btn" onClick={handleUploadToForm} hoverClass="action-hover">
                      {uploading ? '上传中...' : '选择并上传'}
                    </View>
                  </View>
                  {form.images.length > 0 && (
                    <View className="chips">
                      {form.images.map((img) => (
                        <View className="chip" key={img}>
                          <Text className="chip-text">{img}</Text>
                          <View
                            className="chip-close"
                            onClick={() =>
                              setForm((prev) => ({
                                ...prev,
                                images: prev.images.filter((i) => i !== img)
                              }))
                            }
                          >
                            ✕
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </View>
              <View className="modal-footer">
                <View className="ghost-btn" onClick={() => setModalOpen(false)} hoverClass="action-hover">
                  取消
                </View>
                <View
                  className="primary-btn"
                  onClick={handleSubmit}
                  hoverClass="action-hover"
                >
                  {submitting ? '提交中...' : '提交'}
                </View>
              </View>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
