import Head from 'next/head';
import { useEffect, useState } from 'react';

interface MoodEntry {
  id: string;
  time?: string;
  happenedAt?: string;
  createdAt?: string;
  title: string;
  content: string;
  location?: string;
  tags?: string[];
  images?: string[];
}

const demoData: MoodEntry[] = [
  {
    id: '1',
    time: '2025-12-07 09:30',
    title: '日出前的静谧',
    content: '凌晨的空气带着冷意，街灯像像素点一样闪烁。闭上眼，只有心跳的节奏和远处的发动机声。',
    location: '上海 · 浦东',
    tags: ['CALM', 'THINKING'],
    images: ['https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80']
  },
  {
    id: '2',
    time: '2025-12-06 22:10',
    title: '霓虹下的雨',
    content: '地面映出招牌的反光，像被切分的玻璃。雨声和电子乐混在一起，城市的情绪很复杂。',
    location: '成都 · 太古里',
    tags: ['RAIN', 'CITY'],
    images: [
      'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    id: '3',
    time: '2025-12-05 18:55',
    title: '地铁上的陌生人',
    content: '大家都盯着屏幕，偶尔眼神交错，就像不同频道的信号碰巧重叠。',
    location: '深圳 · 3号线',
    tags: ['METRO'],
    images: []
  }
];

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';
const buildImageUrl = (url: string) =>
  url.startsWith('http') ? url : `${API_BASE}${url}`;
const formatLocation = (loc?: string) => {
  if (!loc) return '';
  if (loc.startsWith('lat:') || loc.startsWith('纬度')) {
    return `定位坐标：${loc}`;
  }
  return loc;
};

export default function HomePage() {
  const [entries, setEntries] = useState<MoodEntry[]>(demoData);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    content: '',
    location: '',
    tags: '',
    images: [] as string[]
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [locLoading, setLocLoading] = useState(false);

  const fetchEntries = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/diary`);
      if (!res.ok) {
        throw new Error(`请求失败 ${res.status}`);
      }
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const mapped: MoodEntry[] = data.map((item: any) => ({
          id: item.id,
          title: item.title,
          content: item.content,
          location: item.location,
          tags: item.tags,
          images: item.images,
          happenedAt: item.happenedAt,
          createdAt: item.createdAt,
          time: item.happenedAt || item.createdAt
        }));
        setEntries(mapped);
      } else {
        setEntries(demoData);
        setError('暂无数据，展示示例');
      }
    } catch (e) {
      console.error(e);
      setEntries(demoData);
      setError('加载失败，展示示例数据');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleFormChange = (key: keyof typeof form, value: string | string[]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleUploadFile = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];
    const formData = new FormData();
    formData.append('file', file);
    setUploadingFile(true);
    try {
      const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData
      });
      if (!res.ok) {
        throw new Error(`上传失败 ${res.status}`);
      }
      const data = await res.json();
      if (data?.url) {
        setForm((prev) => ({ ...prev, images: [...prev.images, data.url] }));
      }
    } catch (e) {
      console.error(e);
      alert('上传失败，请重试');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleGetLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      alert('当前环境不支持定位');
      return;
    }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const coord = `lat:${latitude.toFixed(5)}, lng:${longitude.toFixed(5)}`;
        handleFormChange('location', coord);
        try {
          const res = await fetch(`${API_BASE}/geocode?lat=${latitude}&lng=${longitude}`);
          const data = await res.json();
          if (data?.address) {
            handleFormChange('location', data.address);
          }
        } catch (e) {
          console.error('geocode failed', e);
        } finally {
          setLocLoading(false);
        }
      },
      (err) => {
        console.error(err);
        alert('获取定位失败');
        setLocLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      alert('标题和内容必填');
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
      const res = await fetch(`${API_BASE}/diary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        throw new Error(`创建失败 ${res.status}`);
      }
      const created = await res.json();
      setEntries((prev) => [
        {
          ...created,
          time: created.happenedAt || created.createdAt
        },
        ...prev
      ]);
      setModalOpen(false);
      setForm({
        title: '',
        content: '',
        location: '',
        tags: '',
        images: []
      });
    } catch (e) {
      console.error(e);
      alert('创建失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Cyber Mood Journal</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="timeline-container">
        <div className="header">
          <div className="logo">CYBER MOOD JOURNAL</div>
          <button className="add-btn" onClick={() => setModalOpen(true)}>
            + 记录新情绪
          </button>
        </div>
        {error && <div className="error-tip">{error}</div>}
        {loading && <div className="loading-tip">加载中...</div>}
        <section className="timeline">
          {entries.map((entry) => (
            <article className="timeline-item" key={entry.id}>
              <div className="timeline-badge" />
              <div className="time-label">{entry.time || entry.happenedAt || entry.createdAt}</div>
              <div className="card">
                <div className="card-header">
                  <div>
                    <div style={{ color: '#fff', fontWeight: 700 }}>{entry.title}</div>
                    {entry.location && <div className="location">📍 {formatLocation(entry.location)}</div>}
                  </div>
                  <div className="mood-tags">
                    {entry.tags?.map((tag) => (
                      <span className="tag" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="content">{entry.content}</div>
                {entry.images && entry.images.length > 0 && (
                  <div className="gallery">
                    {entry.images.map((img) => (
                      <img key={img} src={buildImageUrl(img)} alt={entry.title} />
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}
        </section>
        <p className="footer-hint">提示：上线后这里会展示你真实的心情日记，支持上传图片和地点标记。</p>
        {modalOpen && (
          <div className="modal-overlay" onClick={() => setModalOpen(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-title">记录新情绪</div>
                <button className="modal-close" onClick={() => setModalOpen(false)}>
                  ✕
                </button>
              </div>
              <div className="modal-body">
                <label>
                  <span>标题*</span>
                  <input
                    value={form.title}
                    onChange={(e) => handleFormChange('title', e.target.value)}
                    placeholder="今天的情绪标题"
                  />
                </label>
                <label>
                  <span>内容*</span>
                  <textarea
                    rows={3}
                    value={form.content}
                    onChange={(e) => handleFormChange('content', e.target.value)}
                    placeholder="描述当时的感受与场景..."
                  />
                </label>
                <label>
                  <span>地点</span>
                  <div className="location-row">
                    <input
                      value={form.location}
                      onChange={(e) => handleFormChange('location', e.target.value)}
                      placeholder="如 上海 · 浦东 或 获取定位"
                    />
                    <button
                      type="button"
                      className="ghost-btn"
                      onClick={handleGetLocation}
                      disabled={locLoading}
                    >
                      {locLoading ? '定位中...' : '获取定位'}
                    </button>
                  </div>
                </label>
                <label>
                  <span>标签（用逗号分隔）</span>
                  <input
                    value={form.tags}
                    onChange={(e) => handleFormChange('tags', e.target.value)}
                    placeholder="CALM, THINKING"
                  />
                </label>
                <label>
                  <span>图片</span>
                  <div className="upload-row">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleUploadFile(e.target.files)}
                      disabled={uploadingFile}
                    />
                    {uploadingFile && <span className="muted-text">上传中...</span>}
                  </div>
                  {form.images.length > 0 && (
                    <div className="chips">
                      {form.images.map((img) => (
                        <span className="chip" key={img}>
                          {img}
                          <button
                            type="button"
                            onClick={() =>
                              setForm((prev) => ({
                                ...prev,
                                images: prev.images.filter((i) => i !== img)
                              }))
                            }
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </label>
              </div>
              <div className="modal-footer">
                <button className="ghost-btn" onClick={() => setModalOpen(false)}>
                  取消
                </button>
                <button className="primary-btn" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? '提交中...' : '提交'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
