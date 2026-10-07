import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api, { endpoints } from "../api/api";

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

  if (loading)
    return <p className="text-center mt-10 text-text-muted">Đang tải...</p>;
  if (error) return <p className="text-center mt-10 text-accent">{error}</p>;

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4 space-y-10">
      <div>
        <Link to="/courses" className="text-accent hover:underline text-sm">
          ← Quay lại khoá học
        </Link>
        <h1 className="font-display text-2xl font-bold mt-4">{lesson.title}</h1>
        {lesson.content && (
          <p className="text-text-muted mt-3">{lesson.content}</p>
        )}
      </div>

      {lesson.vocabularies.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Từ vựng</h2>
          <div className="grid gap-2">
            {lesson.vocabularies.map((v) => (
              <div
                key={v.id}
                className="bg-surface border border-border rounded-card p-3"
              >
                <div className="flex items-baseline gap-3">
                  <span className="font-semibold">{v.word}</span>
                  <span className="text-text-muted text-sm">{v.kana}</span>
                </div>
                <p className="text-sm text-text-muted">{v.meaning}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {lesson.grammars.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Ngữ pháp</h2>
          <div className="grid gap-2">
            {lesson.grammars.map((g) => (
              <div
                key={g.id}
                className="bg-surface border border-border rounded-card p-3"
              >
                <p className="font-semibold">{g.title}</p>
                <p className="text-sm text-text-muted mt-1">{g.explanation}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {lesson.quizzes.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Kiểm tra</h2>
          <div className="grid gap-2">
            {lesson.quizzes.map((q) => (
              <Link
                key={q.id}
                to={`/quizzes/${q.id}`}
                className="block bg-surface border border-border rounded-card p-3 hover:border-accent transition"
              >
                {q.title}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}