import { useEffect, useState } from 'react';
import api, { endpoints, authApi } from '../api/api';
import { useAuth } from '../context/AuthContext';
import LevelFilter from '../components/LevelFilter';
import Pagination from '../components/Pagination';
import useDebounce from '../hooks/useDebounce';
import { HankoBadge } from '../components/JapaneseIcons';
import { speakJapanese } from '../utils/speak';
import { Volume2, Star, Search, BookOpen, Sparkles } from 'lucide-react';

const PAGE_SIZE = 24;

export default function Vocabulary() {
  const { user } = useAuth();
  const [words, setWords] = useState([]);
  const [count, setCount] = useState(0);
  // Một object duy nhất để đổi cấp độ, từ khoá và trang cùng lúc chỉ gây một lần gọi API
  const [filters, setFilters] = useState({ level: 'all', query: '', page: 1 });
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 400);
  const [bookmarkMap, setBookmarkMap] = useState({});
  const [loading, setLoading] = useState(true); // chỉ cho lần tải đầu tiên
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');

  // Ô tìm kiếm ngừng thay đổi thì áp dụng từ khoá và về trang 1
  useEffect(() => {
    setFilters((f) => {
      const query = debouncedSearch.trim();
      return f.query === query ? f : { ...f, query, page: 1 };
    });
  }, [debouncedSearch]);

  useEffect(() => {
    let ignore = false; // bỏ qua kết quả cũ nếu người dùng đã đổi bộ lọc trong lúc chờ

    const fetchVocabulary = async () => {
      setFetching(true);
      setError('');
      try {
        const params = { page: filters.page, page_size: PAGE_SIZE };
        if (filters.level !== 'all') params.level = filters.level;
        if (filters.query) params.search = filters.query;

        const res = await api.get(endpoints['vocabulary'], { params });
        if (ignore) return;
        setWords(res.data.results);
        setCount(res.data.count);
      } catch (err) {
        if (ignore) return;
        if (err.response?.status === 404 && filters.page > 1) {
          setFilters((f) => ({ ...f, page: 1 })); // trang không còn tồn tại, quay về trang 1
          return;
        }
        setError('Không tải được danh sách từ vựng');
      } finally {
        if (!ignore) {
          setLoading(false);
          setFetching(false);
        }
      }
    };

    fetchVocabulary();
    return () => {
      ignore = true;
    };
  }, [filters]);

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

  const handleLevelChange = (value) =>
    setFilters((f) => (f.level === value ? f : { ...f, level: value, page: 1 }));

  const goToPage = (page) => {
    setFilters((f) => ({ ...f, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
      {/* Header section with Japanese aesthetic banner */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-serif text-accent font-bold text-sm" style={{ fontFamily: "'Noto Serif JP', serif" }}>
            語彙の森 • GOI NO MORI
          </span>
          <span className="text-text-faint">•</span>
          <span className="text-xs text-text-muted">
            {filters.level === 'all' && !filters.query ? 'Tổng cộng' : 'Tìm thấy'} {count} từ vựng
          </span>
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
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm theo Kanji (本), Kana (ほん), Romaji (hon), hoặc nghĩa tiếng Việt (sách)..."
            className="w-full bg-surface border border-border rounded-full pl-11 pr-4 py-3 text-sm text-text placeholder:text-text-faint focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition shadow-xs"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-text-muted hover:text-text"
            >
              Xoá
            </button>
          )}
        </div>

        <LevelFilter value={filters.level} onChange={handleLevelChange} />
      </div>

      {/* Words Grid */}
      {error ? (
        <div className="text-center py-16 bg-surface rounded-2xl border border-border">
          <p className="text-accent text-sm font-medium">{error}</p>
        </div>
      ) : words.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-2xl border border-border">
          <p className="font-serif text-2xl text-text-faint mb-2" style={{ fontFamily: "'Noto Serif JP', serif" }}>
            該当なし
          </p>
          <p className="text-text-muted text-sm">
            {filters.query
              ? `Không tìm thấy từ vựng nào phù hợp với từ khóa "${filters.query}".`
              : filters.level === 'all'
                ? 'Chưa có từ vựng nào.'
                : `Chưa có từ vựng nào thuộc cấp độ ${filters.level}.`}
          </p>
        </div>
      ) : (
        <>
          <div className={`grid gap-3.5 sm:grid-cols-2 transition-opacity ${fetching ? 'opacity-60' : ''}`}>
            {words.map((word) => {
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

          <Pagination page={filters.page} totalPages={totalPages} onChange={goToPage} />
        </>
      )}
    </div>
  );
}