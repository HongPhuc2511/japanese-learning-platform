import { useEffect, useState } from "react";
import api, { endpoints, authApi } from "../api/api";
import { useAuth } from "../context/AuthContext";
import LevelFilter from "../components/LevelFilter";
import Pagination from "../components/Pagination";
import useDebounce from "../hooks/useDebounce";
import { HankoBadge } from "../components/JapaneseIcons";
import { speakJapanese } from "../utils/speak";
import { Volume2, Star, Search, Pencil } from "lucide-react";
import KanjiStrokeOrder from "../components/KanjiStrokeOrder";

const PAGE_SIZE = 24;

export default function Kanji() {
  const { user } = useAuth();
  const [kanjiList, setKanjiList] = useState([]);
  const [count, setCount] = useState(0);
  const [filters, setFilters] = useState({ level: "all", query: "", page: 1 });
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 400);
  const [bookmarkMap, setBookmarkMap] = useState({});
  const [strokeKanji, setStrokeKanji] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setFilters((f) => {
      const query = debouncedSearch.trim();
      return f.query === query ? f : { ...f, query, page: 1 };
    });
  }, [debouncedSearch]);

  useEffect(() => {
    let ignore = false;

    const fetchKanji = async () => {
      setFetching(true);
      setError("");
      try {
        const params = { page: filters.page, page_size: PAGE_SIZE };
        if (filters.level !== "all") params.level = filters.level;
        if (filters.query) params.search = filters.query;

        const res = await api.get(endpoints["kanji"], { params });
        if (ignore) return;
        setKanjiList(res.data.results);
        setCount(res.data.count);
      } catch (err) {
        if (ignore) return;
        if (err.response?.status === 404 && filters.page > 1) {
          setFilters((f) => ({ ...f, page: 1 }));
          return;
        }
        setError("Không tải được danh sách kanji");
      } finally {
        if (!ignore) {
          setLoading(false);
          setFetching(false);
        }
      }
    };

    fetchKanji();
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
        const res = await authApi.get(endpoints["bookmarks"]);
        const map = {};
        res.data
          .filter((b) => b.content_type === "kanji")
          .forEach((b) => {
            map[b.object_id] = b.id;
          });
        setBookmarkMap(map);
      } catch (err) {
        console.error("Không tải được bookmark", err);
      }
    };
    fetchBookmarks();
  }, [user]);

  const toggleBookmark = async (kanjiId) => {
    const existingId = bookmarkMap[kanjiId];
    try {
      if (existingId) {
        await authApi.delete(`${endpoints["bookmarks"]}${existingId}/`);
        setBookmarkMap((prev) => {
          const copy = { ...prev };
          delete copy[kanjiId];
          return copy;
        });
      } else {
        const res = await authApi.post(endpoints["bookmarks"], {
          content_type: "kanji",
          object_id: kanjiId,
        });
        setBookmarkMap((prev) => ({ ...prev, [kanjiId]: res.data.id }));
      }
    } catch (err) {
      console.error("Lỗi khi đánh dấu bookmark", err);
    }
  };

  const handleLevelChange = (value) =>
    setFilters((f) =>
      f.level === value ? f : { ...f, level: value, page: 1 },
    );

  const goToPage = (page) => {
    setFilters((f) => ({ ...f, page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <div
          className="font-serif text-3xl text-accent animate-pulse mb-2"
          style={{ fontFamily: "'Noto Serif JP', serif" }}
        >
          漢字
        </div>
        <p className="text-text-muted text-sm font-medium">
          Đang chuẩn bị bảng Hán tự...
        </p>
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6">
      {/* Header section with Japanese aesthetic banner */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="font-serif text-accent font-bold text-sm"
            style={{ fontFamily: "'Noto Serif JP', serif" }}
          >
            漢字の道 • KANJI NO MICHI
          </span>
          <span className="text-text-faint">•</span>
          <span className="text-xs text-text-muted">
            {filters.level === "all" && !filters.query
              ? "Tổng cộng"
              : "Tìm thấy"}{" "}
            {count} chữ Hán tự
          </span>
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-text tracking-tight">
          Hán tự Kanji Nhật Bản
        </h1>
        <p className="text-sm text-text-muted mt-2 max-w-xl">
          Học Kanji theo mô phỏng giấy ô ly thư pháp (原稿用紙), phân biệt rõ
          ràng âm On (Katakana) và âm Kun (Hiragana).
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
            placeholder="Tìm theo chữ Hán (日), âm đọc (にち, ひ), hoặc nghĩa tiếng Việt (mặt trời, ngày)..."
            className="w-full bg-surface border border-border rounded-full pl-11 pr-4 py-3 text-sm text-text placeholder:text-text-faint focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition shadow-xs"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-text-muted hover:text-text"
            >
              Xoá
            </button>
          )}
        </div>

        <LevelFilter value={filters.level} onChange={handleLevelChange} />
      </div>

      {error ? (
        <div className="text-center py-16 bg-surface rounded-2xl border border-border">
          <p className="text-accent text-sm font-medium">{error}</p>
        </div>
      ) : kanjiList.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-2xl border border-border">
          <p
            className="font-serif text-2xl text-text-faint mb-2"
            style={{ fontFamily: "'Noto Serif JP', serif" }}
          >
            該当なし
          </p>
          <p className="text-text-muted text-sm">
            {filters.query
              ? `Không tìm thấy Kanji nào với từ khóa "${filters.query}".`
              : filters.level === "all"
                ? "Chưa có chữ Hán tự nào."
                : `Chưa có chữ Hán tự nào ở cấp độ ${filters.level}.`}
          </p>
        </div>
      ) : (
        <>
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 transition-opacity ${
              fetching ? "opacity-60" : ""
            }`}
          >
            {kanjiList.map((k) => {
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
                        onClick={() =>
                          speakJapanese(k.kunyomi || k.onyomi || k.character)
                        }
                        className="p-1 rounded-full text-text-muted hover:text-accent hover:bg-accent-soft transition cursor-pointer"
                        title="Nghe phát âm"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setStrokeKanji(k)}
                        className="p-1 rounded-full text-text-muted hover:text-accent hover:bg-accent-soft transition cursor-pointer"
                        title="Xem thứ tự nét"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      {user && (
                        <button
                          onClick={() => toggleBookmark(k.id)}
                          className={`p-1 rounded-full transition cursor-pointer ${
                            isBookmarked
                              ? "text-accent hover:bg-accent-soft"
                              : "text-text-faint hover:text-accent hover:bg-accent-soft/40"
                          }`}
                          title={isBookmarked ? "Bỏ lưu" : "Lưu Kanji này"}
                        >
                          <Star
                            className={`w-4 h-4 ${isBookmarked ? "fill-accent text-accent" : ""}`}
                          />
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

          <Pagination
            page={filters.page}
            totalPages={totalPages}
            onChange={goToPage}
          />
        </>
      )}
      {strokeKanji && (
        <KanjiStrokeOrder
          kanji={strokeKanji}
          onClose={() => setStrokeKanji(null)}
        />
      )}
    </div>
  );
}
