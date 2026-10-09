import { useEffect, useState } from 'react';
import api, { endpoints } from '../api/api';
import LevelFilter from '../components/LevelFilter';
import { HankoBadge } from '../components/JapaneseIcons';
import { speakJapanese } from '../utils/speak';
import { Search, Volume2, BookOpen, Layers } from 'lucide-react';

export default function Grammar() {
  const [grammars, setGrammars] = useState([]);
  const [level, setLevel] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGrammar = async () => {
      try {
        const res = await api.get(endpoints['grammar']);
        setGrammars(res.data);
      } catch (err) {
        setError('Không tải được danh sách ngữ pháp');
      } finally {
        setLoading(false);
      }
    };
    fetchGrammar();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <div className="font-serif text-3xl text-accent animate-pulse mb-2" style={{ fontFamily: "'Noto Serif JP', serif" }}>
          文法
        </div>
        <p className="text-text-muted text-sm font-medium">Đang tải hệ thống ngữ pháp...</p>
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

  const filteredGrammars = grammars.filter((g) => {
    const matchesLevel = level === 'all' || g.level === level;
    const query = searchQuery.trim().toLowerCase();
    if (!query) return matchesLevel;
    const matchesQuery =
      (g.title && g.title.toLowerCase().includes(query)) ||
      (g.explanation && g.explanation.toLowerCase().includes(query)) ||
      (g.example_sentence && g.example_sentence.toLowerCase().includes(query));
    return matchesLevel && matchesQuery;
  });

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
      {/* Header section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-serif text-accent font-bold text-sm" style={{ fontFamily: "'Noto Serif JP', serif" }}>
            文法体系 • BUNPO TAIKEI
          </span>
          <span className="text-text-faint">•</span>
          <span className="text-xs text-text-muted">Tổng cộng {grammars.length} điểm ngữ pháp</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-text tracking-tight">
          Hệ thống Ngữ pháp JLPT
        </h1>
        <p className="text-sm text-text-muted mt-2 max-w-xl">
          Nắm vững mẫu câu, ý nghĩa ngữ cảnh và ví dụ minh họa kèm âm thanh đọc câu trực quan.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4 mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo mẫu câu (~てください), cách dùng, hoặc từ khóa ví dụ..."
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

      {filteredGrammars.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-2xl border border-border">
          <p className="font-serif text-2xl text-text-faint mb-2" style={{ fontFamily: "'Noto Serif JP', serif" }}>
            該当なし
          </p>
          <p className="text-text-muted text-sm">
            {searchQuery
              ? `Không tìm thấy ngữ pháp nào khớp với từ khóa "${searchQuery}".`
              : `Chưa có điểm ngữ pháp nào ở cấp độ ${level}.`}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredGrammars.map((g) => (
            <div
              key={g.id}
              className="jp-card p-6 relative group hover:border-accent/80"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2
                    className="text-xl font-bold text-text group-hover:text-accent transition font-serif"
                    style={{ fontFamily: "'Noto Serif JP', serif" }}
                  >
                    {g.title}
                  </h2>
                </div>
                <HankoBadge text={g.level} />
              </div>

              <div className="bg-surface-subtle border border-border/80 rounded-xl p-3.5 mb-3">
                <p className="text-xs text-text-muted font-semibold uppercase tracking-wider mb-1">
                  Ý nghĩa & Giải thích
                </p>
                <p className="text-sm text-text leading-relaxed whitespace-pre-line">
                  {g.explanation}
                </p>
              </div>

              {g.example_sentence && (
                <div className="mt-3 bg-accent-soft/30 border border-accent/20 rounded-xl p-3.5 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-accent uppercase tracking-wider">
                      Ví dụ minh hoạ • 例文
                    </span>
                    <p
                      className="font-serif text-sm font-medium text-text leading-relaxed"
                      style={{ fontFamily: "'Noto Serif JP', serif" }}
                    >
                      「{g.example_sentence}」
                    </p>
                  </div>
                  <button
                    onClick={() => speakJapanese(g.example_sentence)}
                    className="p-1.5 rounded-full text-accent hover:bg-accent-soft transition cursor-pointer shrink-0 mt-2"
                    title="Nghe câu ví dụ"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}