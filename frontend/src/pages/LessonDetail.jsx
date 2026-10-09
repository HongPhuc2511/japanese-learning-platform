import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api, { endpoints } from "../api/api";
import { speakJapanese } from "../utils/speak";
import { ArrowLeft, BookOpen, Layers, Volume2, HelpCircle, ChevronRight } from "lucide-react";

export default function LessonDetail() {
  const { id } = useParams();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const res = await api.get(`${endpoints["lessons"]}${id}/`);
        setLesson(res.data);
      } catch (err) {
        setError("Không tìm thấy bài học");
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <div className="font-serif text-3xl text-accent animate-pulse mb-2" style={{ fontFamily: "'Noto Serif JP', serif" }}>
          授業詳細
        </div>
        <p className="text-text-muted text-sm font-medium">Đang tải nội dung bài học...</p>
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

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 space-y-10">
      {/* Back button */}
      <div>
        <Link
          to="/courses"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-accent transition mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách khoá học</span>
        </Link>
        
        {/* Lesson Header Card */}
        <div className="jp-card p-6 sm:p-8">
          <span className="text-xs font-bold text-accent uppercase tracking-wider bg-accent-soft px-2.5 py-1 rounded-full inline-block mb-3">
            Bài giảng • 授業
          </span>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-text">
            {lesson.title}
          </h1>
          {lesson.content && (
            <p className="text-sm text-text-muted mt-3 leading-relaxed">
              {lesson.content}
            </p>
          )}
        </div>
      </div>

      {/* Vocabularies in this lesson */}
      {lesson.vocabularies && lesson.vocabularies.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-accent" />
            <h2 className="font-display font-bold text-xl text-text">
              Từ vựng bài học
            </h2>
            <span
              className="text-xs font-serif text-accent"
              style={{ fontFamily: "'Noto Serif JP', serif" }}
            >
              語彙 ({lesson.vocabularies.length})
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {lesson.vocabularies.map((v) => (
              <div
                key={v.id}
                className="jp-card p-4 flex items-center justify-between gap-3 group hover:border-accent"
              >
                <div>
                  <div className="flex items-baseline gap-2">
                    <span
                      className="font-bold text-lg text-text group-hover:text-accent transition font-serif"
                      style={{ fontFamily: "'Noto Serif JP', serif" }}
                    >
                      {v.word}
                    </span>
                    <span className="text-xs text-text-muted bg-surface-subtle px-1.5 py-0.2 rounded border border-border/60">
                      {v.kana}
                    </span>
                  </div>
                  <p className="text-xs text-text font-medium mt-1">{v.meaning}</p>
                </div>
                <button
                  onClick={() => speakJapanese(v.kana || v.word)}
                  className="p-1.5 rounded-full text-text-muted hover:text-accent hover:bg-accent-soft transition cursor-pointer shrink-0"
                  title="Nghe phát âm"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Grammars in this lesson */}
      {lesson.grammars && lesson.grammars.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-matcha" />
            <h2 className="font-display font-bold text-xl text-text">
              Ngữ pháp trọng tâm
            </h2>
            <span
              className="text-xs font-serif text-matcha"
              style={{ fontFamily: "'Noto Serif JP', serif" }}
            >
              文法 ({lesson.grammars.length})
            </span>
          </div>

          <div className="grid gap-3">
            {lesson.grammars.map((g) => (
              <div
                key={g.id}
                className="jp-card p-5 group hover:border-matcha"
              >
                <div className="flex items-baseline justify-between gap-2 mb-2">
                  <h3
                    className="font-bold text-base text-text group-hover:text-matcha transition font-serif"
                    style={{ fontFamily: "'Noto Serif JP', serif" }}
                  >
                    {g.title}
                  </h3>
                </div>
                <p className="text-xs text-text-muted leading-relaxed whitespace-pre-line">
                  {g.explanation}
                </p>
                {g.example_sentence && (
                  <div className="mt-3 pt-2.5 border-t border-border/70 flex items-start justify-between gap-2 text-xs">
                    <p
                      className="font-serif text-text italic"
                      style={{ fontFamily: "'Noto Serif JP', serif" }}
                    >
                      「{g.example_sentence}」
                    </p>
                    <button
                      onClick={() => speakJapanese(g.example_sentence)}
                      className="text-text-muted hover:text-accent p-1 rounded-full shrink-0 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Quizzes in this lesson */}
      {lesson.quizzes && lesson.quizzes.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-gold" />
            <h2 className="font-display font-bold text-xl text-text">
              Bài tập kiểm tra
            </h2>
            <span
              className="text-xs font-serif text-gold"
              style={{ fontFamily: "'Noto Serif JP', serif" }}
            >
              演習 ({lesson.quizzes.length})
            </span>
          </div>

          <div className="grid gap-3">
            {lesson.quizzes.map((q) => (
              <Link
                key={q.id}
                to={`/quizzes/${q.id}`}
                className="jp-card p-4 flex items-center justify-between group hover:border-accent"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent-soft text-accent flex items-center justify-center">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-text group-hover:text-accent transition">
                    {q.title}
                  </h3>
                </div>
                <span className="text-xs text-accent font-semibold flex items-center gap-1">
                  <span>Làm bài</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}