import { useEffect, useState } from 'react';
import api, { endpoints, authApi } from '../api/api';
import { useAuth } from '../context/AuthContext';
import LevelFilter from '../components/LevelFilter';
import { HankoBadge } from '../components/JapaneseIcons';
import { speakJapanese } from '../utils/speak';
import { Volume2, Star, Search } from 'lucide-react';

export default function Kanji() {
  const { user } = useAuth();
  const [kanjiList, setKanjiList] = useState([]);
  const [level, setLevel] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarkMap, setBookmarkMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchKanji = async () => {
      try {
        const res = await api.get(endpoints['kanji']);
        setKanjiList(res.data);
      } catch (err) {
        setError('Không tải được danh sách kanji');
      } finally {
        setLoading(false);
      }
    };
    fetchKanji();
  }, []);

  useEffect(() => {
    if (!user) {
      setBookmarkMap({});
      return;
    }
    const fetchBookmarks = async () => {
      try {
        const res = await authApi.get(endpoints['bookmarks']);
        const map = {};
        res.data
          .filter((b) => b.content_type === 'kanji')
          .forEach((b) => {
            map[b.object_id] = b.id;
          });
        setBookmarkMap(map);
      } catch (err) {
        console.error('Không tải được bookmark', err);
      }
    };
    fetchBookmarks();
  }, [user]);

  const toggleBookmark = async (kanjiId) => {
    const existingId = bookmarkMap[kanjiId];
    try {
      if (existingId) {
        await authApi.delete(`${endpoints['bookmarks']}${existingId}/`);
        setBookmarkMap((prev) => {
          const copy = { ...prev };
          delete copy[kanjiId];
          return copy;
        });
      } else {
        const res = await authApi.post(endpoints['bookmarks'], {
          content_type: 'kanji',
          object_id: kanjiId,
        });
        setBookmarkMap((prev) => ({ ...prev, [kanjiId]: res.data.id }));
      }
    } catch (err) {
      console.error('Lỗi khi đánh dấu bookmark', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <div className="font-serif text-3xl text-accent animate-pulse mb-2" style={{ fontFamily: "'Noto Serif JP', serif" }}>
          漢字
        </div>
        <p className="text-text-muted text-sm font-medium">Đang chuẩn bị bảng Hán tự...</p>
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

  const filteredKanji = kanjiList.filter((k) => {
    const matchesLevel = level === 'all' || k.jlpt_level === level;
    const query = searchQuery.trim().toLowerCase();
    if (!query) return matchesLevel;
    const matchesQuery =
      (k.character && k.character.toLowerCase().includes(query)) ||
      (k.meaning && k.meaning.toLowerCase().includes(query)) ||
      (k.onyomi && k.onyomi.toLowerCase().includes(query)) ||
      (k.kunyomi && k.kunyomi.toLowerCase().includes(query));
    return matchesLevel && matchesQuery;
  });

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6">
      {/* Header section with Japanese aesthetic banner */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-serif text-accent font-bold text-sm" style={{ fontFamily: "'Noto Serif JP', serif" }}>
            漢字の道 • KANJI NO MICHI
          </span>
          <span className="text-text-faint">•</span>
          <span className="text-xs text-text-muted">Tổng cộng {kanjiList.length} chữ Hán tự</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-text tracking-tight">
          Hán tự Kanji Nhật Bản
        </h1>
        <p className="text-sm text-text-muted mt-2 max-w-xl">
          Học Kanji theo mô phỏng giấy ô ly thư pháp (原稿用紙), phân biệt rõ ràng âm On (Katakana) và âm Kun (Hiragana).
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="space-y-4 mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo chữ Hán (日), âm đọc (にち, ひ), hoặc nghĩa tiếng Việt (mặt trời, ngày)..."
            className="w-full bg-surface border border-border rounded-full pl-11 pr-4 py-3 text-sm text-text placeholder:text-text-faint focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-text-muted hover:text-text"
            >
              Xoá
            </button>
          )}
        </div>

        <LevelFilter value={level} onChange={setLevel} />
      </div>

      {filteredKanji.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-2xl border border-border">
          <p className="font-serif text-2xl text-text-faint mb-2" style={{ fontFamily: "'Noto Serif JP', serif" }}>
            該当なし
          </p>
          <p className="text-text-muted text-sm">
            {searchQuery
              ? `Không tìm thấy Kanji nào với từ khóa "${searchQuery}".`
              : `Chưa có chữ Hán tự nào ở cấp độ ${level}.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredKanji.map((k) => {
            const isBookmarked = !!bookmarkMap[k.id];
            return (
              <div
                key={k.id}
                className="jp-card p-5 relative flex flex-col justify-between group hover:border-accent"
              >
                {/* Header card actions */}
                <div className="flex items-center justify-between mb-3">
                  <HankoBadge text={k.jlpt_level} />
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => speakJapanese(k.kunyomi || k.onyomi || k.character)}
                      className="p-1 rounded-full text-text-muted hover:text-accent hover:bg-accent-soft transition cursor-pointer"
                      title="Nghe phát âm"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    {user && (
                      <button
                        onClick={() => toggleBookmark(k.id)}
                        className={`p-1 rounded-full transition cursor-pointer ${
                          isBookmarked
                            ? 'text-accent hover:bg-accent-soft'
                            : 'text-text-faint hover:text-accent hover:bg-accent-soft/40'
                        }`}
                        title={isBookmarked ? 'Bỏ lưu' : 'Lưu Kanji này'}
                      >
                        <Star className={`w-4 h-4 ${isBookmarked ? 'fill-accent text-accent' : ''}`} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Genko Yoshi Calligraphy Box for Kanji */}
                <div className="w-24 h-24 mx-auto my-2 rounded-xl border border-border/80 kanji-box-grid flex items-center justify-center shadow-inner group-hover:border-accent/40 transition">
                  <span
                    className="text-5xl font-extrabold text-text group-hover:text-accent transition-colors font-serif select-all"
                    style={{ fontFamily: "'Noto Serif JP', serif" }}
                  >
                    {k.character}
                  </span>
                </div>

                {/* Meaning */}
                <div className="text-center mt-3">
                  <h3 className="font-bold text-text text-base">
                    {k.meaning}
                  </h3>
                </div>

                {/* On / Kun Readings */}
                <div className="mt-4 pt-3 border-t border-border/70 space-y-1.5 text-xs">
                  {k.onyomi && (
                    <div className="flex items-baseline justify-between gap-1">
                      <span className="text-[10px] uppercase font-bold text-indigo bg-indigo-soft px-1.5 py-0.2 rounded font-mono">
                        On
                      </span>
                      <span className="font-medium text-text text-right truncate">
                        {k.onyomi}
                      </span>
                    </div>
                  )}
                  {k.kunyomi && (
                    <div className="flex items-baseline justify-between gap-1">
                      <span className="text-[10px] uppercase font-bold text-matcha bg-matcha-soft px-1.5 py-0.2 rounded font-mono">
                        Kun
                      </span>
                      <span className="font-medium text-text text-right truncate">
                        {k.kunyomi}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}