import { useEffect, useState } from 'react';
import api, { endpoints, authApi } from '../api/api';
import { useAuth } from '../context/AuthContext';
import LevelFilter from '../components/LevelFilter';
import { HankoBadge } from '../components/JapaneseIcons';
import { speakJapanese } from '../utils/speak';
import { Volume2, Star, Search, BookOpen, Sparkles } from 'lucide-react';

export default function Vocabulary() {
  const { user } = useAuth();
  const [words, setWords] = useState([]);
  const [level, setLevel] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarkMap, setBookmarkMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVocabulary = async () => {
      try {
        const res = await api.get(endpoints['vocabulary']);
        setWords(res.data);
      } catch (err) {
        setError('Không tải được danh sách từ vựng');
      } finally {
        setLoading(false);
      }
    };
    fetchVocabulary();
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
          .filter((b) => b.content_type === 'vocabulary')
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

  const toggleBookmark = async (wordId) => {
    const existingId = bookmarkMap[wordId];
    try {
      if (existingId) {
        await authApi.delete(`${endpoints['bookmarks']}${existingId}/`);
        setBookmarkMap((prev) => {
          const copy = { ...prev };
          delete copy[wordId];
          return copy;
        });
      } else {
        const res = await authApi.post(endpoints['bookmarks'], {
          content_type: 'vocabulary',
          object_id: wordId,
        });
        setBookmarkMap((prev) => ({ ...prev, [wordId]: res.data.id }));
      }
    } catch (err) {
      console.error('Lỗi khi đánh dấu bookmark', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <div className="inline-block animate-spin text-accent mb-3">
          <BookOpen className="w-8 h-8" />
        </div>
        <p className="text-text-muted text-sm font-medium">Đang chuẩn bị kho từ vựng...</p>
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

  const filteredWords = words.filter((w) => {
    const matchesLevel = level === 'all' || w.level === level;
    const query = searchQuery.trim().toLowerCase();
    if (!query) return matchesLevel;
    const matchesQuery =
      (w.word && w.word.toLowerCase().includes(query)) ||
      (w.kana && w.kana.toLowerCase().includes(query)) ||
      (w.romaji && w.romaji.toLowerCase().includes(query)) ||
      (w.meaning && w.meaning.toLowerCase().includes(query));
    return matchesLevel && matchesQuery;
  });

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
      {/* Header section with Japanese aesthetic banner */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-serif text-accent font-bold text-sm" style={{ fontFamily: "'Noto Serif JP', serif" }}>
            語彙の森 • GOI NO MORI
          </span>
          <span className="text-text-faint">•</span>
          <span className="text-xs text-text-muted">Tổng cộng {words.length} từ vựng</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-text tracking-tight">
          Kho Từ vựng tiếng Nhật
        </h1>
        <p className="text-sm text-text-muted mt-2 max-w-xl">
          Tra cứu, luyện phát âm chuẩn bản xứ và lưu từ vựng vào kho cá nhân để ôn tập định kỳ theo phương pháp SRS.
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
            placeholder="Tìm theo Kanji (本), Kana (ほん), Romaji (hon), hoặc nghĩa tiếng Việt (sách)..."
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

      {/* Words Grid */}
      {filteredWords.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-2xl border border-border">
          <p className="font-serif text-2xl text-text-faint mb-2" style={{ fontFamily: "'Noto Serif JP', serif" }}>
            該当なし
          </p>
          <p className="text-text-muted text-sm">
            {searchQuery
              ? `Không tìm thấy từ vựng nào phù hợp với từ khóa "${searchQuery}".`
              : `Chưa có từ vựng nào thuộc cấp độ ${level}.`}
          </p>
        </div>
      ) : (
        <div className="grid gap-3.5 sm:grid-cols-2">
          {filteredWords.map((word) => {
            const isBookmarked = !!bookmarkMap[word.id];
            return (
              <div
                key={word.id}
                className="jp-card p-5 relative flex flex-col justify-between group hover:border-accent/80"
              >
                <div>
                  {/* Top bar: Level stamp & actions */}
                  <div className="flex items-center justify-between mb-2">
                    <HankoBadge text={word.level} />

                    <div className="flex items-center gap-1.5">
                      {/* Audio Button */}
                      <button
                        onClick={() => speakJapanese(word.kana || word.word)}
                        className="p-1.5 rounded-full text-text-muted hover:text-accent hover:bg-accent-soft transition cursor-pointer"
                        title="Nghe phát âm tiếng Nhật"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>

                      {/* Bookmark button */}
                      {user && (
                        <button
                          onClick={() => toggleBookmark(word.id)}
                          className={`p-1.5 rounded-full transition cursor-pointer ${
                            isBookmarked
                              ? 'text-accent hover:bg-accent-soft'
                              : 'text-text-faint hover:text-accent hover:bg-accent-soft/40'
                          }`}
                          title={isBookmarked ? 'Bỏ lưu' : 'Lưu từ này'}
                        >
                          <Star className={`w-4 h-4 ${isBookmarked ? 'fill-accent text-accent' : ''}`} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Main Word Display */}
                  <div className="flex items-baseline gap-2.5 flex-wrap mt-1">
                    <span
                      className="text-2xl font-bold text-text group-hover:text-accent transition font-serif"
                      style={{ fontFamily: "'Noto Serif JP', serif" }}
                    >
                      {word.word}
                    </span>
                    <span className="text-sm font-medium text-text-muted bg-surface-subtle px-2 py-0.5 rounded-full border border-border/60">
                      {word.kana}
                    </span>
                    {word.romaji && (
                      <span className="text-xs text-text-faint">[{word.romaji}]</span>
                    )}
                  </div>

                  {/* Meaning */}
                  <p className="text-sm text-text font-medium mt-2 leading-relaxed">
                    {word.meaning}
                  </p>
                </div>

                {/* Example sentence */}
                {word.example_sentence && (
                  <div className="mt-3.5 pt-3 border-t border-border/70 text-xs">
                    <div className="bg-surface-subtle/80 rounded-xl p-2.5 border-l-2 border-accent/70">
                      <p
                        className="font-serif text-text font-medium leading-relaxed"
                        style={{ fontFamily: "'Noto Serif JP', serif" }}
                      >
                        {word.example_sentence}
                      </p>
                      {word.example_meaning && (
                        <p className="text-text-muted mt-1 leading-normal italic">
                          {word.example_meaning}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}