import { useEffect, useState } from 'react';
import { authApi, endpoints } from '../api/api';

const TABS = [
  { key: 'vocabulary', label: 'Từ vựng' },
  { key: 'kanji', label: 'Kanji' },
];

export default function SavedItems() {
  const [bookmarks, setBookmarks] = useState([]);
  const [tab, setTab] = useState('vocabulary');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const res = await authApi.get(endpoints['bookmarks']);
        setBookmarks(res.data.filter((b) => b.content !== null));
      } catch (err) {
        setError('Không tải được danh sách đã lưu');
      } finally {
        setLoading(false);
      }
    };
    fetchBookmarks();
  }, []);

  const handleRemove = async (bookmarkId) => {
    try {
      await authApi.delete(`${endpoints['bookmarks']}${bookmarkId}/`);
      setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId));
    } catch (err) {
      console.error('Lỗi khi bỏ lưu', err);
    }
  };

  if (loading) return <p className="text-center mt-10 text-text-muted">Đang tải...</p>;
  if (error) return <p className="text-center mt-10 text-accent">{error}</p>;

  const items = bookmarks.filter((b) => b.content_type === tab);

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4">
      <h1 className="font-display text-2xl font-bold mb-6">Đã lưu</h1>

      <div className="flex gap-2 mb-6">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`text-sm px-4 py-1.5 rounded-full border transition ${
              tab === t.key
                ? 'bg-accent text-white border-accent'
                : 'bg-surface text-text-muted border-border hover:border-accent'
            }`}
          >
            {t.label} ({bookmarks.filter((b) => b.content_type === t.key).length})
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <p className="text-text-muted">
          Bạn chưa lưu {tab === 'vocabulary' ? 'từ vựng' : 'kanji'} nào. Bấm ☆ ở trang
          {tab === 'vocabulary' ? ' Từ vựng ' : ' Kanji '}
          để lưu.
        </p>
      ) : (
        <div className="grid gap-3">
          {items.map((b) => (
            <div
              key={b.id}
              className="bg-surface border border-border rounded-card p-4 relative"
            >
              <button
                onClick={() => handleRemove(b.id)}
                className="absolute top-3 right-3 text-xl text-accent"
                title="Bỏ lưu"
              >
                ★
              </button>

              <div className="flex items-baseline gap-3 pr-8">
                <span className="text-xl font-semibold">{b.content.front}</span>
                <span className="text-text-muted text-sm">{b.content.reading}</span>
              </div>
              <p className="text-text-muted mt-1">{b.content.back}</p>
              <span className="inline-block mt-2 text-xs bg-accent-soft text-accent px-2 py-0.5 rounded-button">
                {b.content.level}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}