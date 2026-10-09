import { useEffect, useState } from 'react';
import { authApi, endpoints } from '../api/api';
import { HankoBadge } from '../components/JapaneseIcons';
import { speakJapanese } from '../utils/speak';
import { Star, Volume2, Bookmark } from 'lucide-react';

const TABS = [
  { key: 'vocabulary', label: 'Từ vựng', kanji: '語彙' },
  { key: 'kanji', label: 'Kanji', kanji: '漢字' },
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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <div className="font-serif text-3xl text-accent animate-pulse mb-2" style={{ fontFamily: "'Noto Serif JP', serif" }}>
          保存項目
        </div>
        <p className="text-text-muted text-sm font-medium">Đang tải mục đã lưu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <p className="text-accent text-sm font-medium">{error}</p>
      </div>
    );
  }

  const items = bookmarks.filter((b) => b.content_type === tab);

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
      {/* Header section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-serif text-accent font-bold text-sm" style={{ fontFamily: "'Noto Serif JP', serif" }}>
            お気に入り • OKINIIRI
          </span>
          <span className="text-text-faint">•</span>
          <span className="text-xs text-text-muted">{bookmarks.length} mục đã đánh dấu</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-text tracking-tight">
          Kho lưu trữ cá nhân
        </h1>
        <p className="text-sm text-text-muted mt-2 max-w-xl">
          Các từ vựng và Kanji bạn đã đánh dấu sao để tập trung ôn luyện nhanh.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2.5 mb-8">
        {TABS.map((t) => {
          const isActive = tab === t.key;
          const count = bookmarks.filter((b) => b.content_type === t.key).length;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? 'bg-accent text-white border-accent shadow-xs scale-102 font-semibold'
                  : 'bg-surface text-text-muted border-border hover:border-accent/60 hover:text-text'
              }`}
            >
              <span>{t.label}</span>
              <span
                className={`text-[10px] font-serif ${isActive ? 'text-white/80' : 'text-accent'}`}
                style={{ fontFamily: "'Noto Serif JP', serif" }}
              >
                {t.kanji}
              </span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ml-1 ${
                isActive ? 'bg-white/25 text-white' : 'bg-surface-subtle text-text-muted'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Items Grid */}
      {items.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-2xl border border-border p-8">
          <Bookmark className="w-10 h-10 text-accent/40 mx-auto mb-3" />
          <p className="text-text-muted text-sm">
            Bạn chưa lưu {tab === 'vocabulary' ? 'từ vựng' : 'kanji'} nào.
          </p>
          <p className="text-xs text-text-faint mt-1">
            Bấm biểu tượng ★ ở trang {tab === 'vocabulary' ? 'Từ vựng' : 'Kanji'} để đưa vào danh sách này.
          </p>
        </div>
      ) : (
        <div className="grid gap-3.5 sm:grid-cols-2">
          {items.map((b) => (
            <div
              key={b.id}
              className="jp-card p-5 relative flex flex-col justify-between group hover:border-accent"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <HankoBadge text={b.content.level} />
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => speakJapanese(b.content.reading || b.content.front)}
                      className="p-1 rounded-full text-text-muted hover:text-accent hover:bg-accent-soft transition cursor-pointer"
                      title="Nghe phát âm"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRemove(b.id)}
                      className="p-1 rounded-full text-accent hover:bg-accent-soft transition cursor-pointer"
                      title="Bỏ lưu khỏi danh sách"
                    >
                      <Star className="w-4 h-4 fill-accent" />
                    </button>
                  </div>
                </div>

                <div className="flex items-baseline gap-2.5 flex-wrap mt-1">
                  <span
                    className="text-2xl font-bold text-text group-hover:text-accent transition font-serif"
                    style={{ fontFamily: "'Noto Serif JP', serif" }}
                  >
                    {b.content.front}
                  </span>
                  {b.content.reading && (
                    <span className="text-xs font-medium text-text-muted bg-surface-subtle px-2 py-0.5 rounded-full border border-border/60">
                      {b.content.reading}
                    </span>
                  )}
                </div>

                <p className="text-sm text-text font-medium mt-2 leading-relaxed">
                  {b.content.back}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}