import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi, endpoints } from '../api/api';

export default function QuizHistory() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await authApi.get(endpoints['quiz-results']);
        setResults(res.data);
      } catch (err) {
        setError('Không tải được lịch sử làm bài');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  if (loading) return <p className="text-center mt-10 text-text-muted">Đang tải...</p>;
  if (error) return <p className="text-center mt-10 text-accent">{error}</p>;

  const average =
    results.length > 0
      ? (results.reduce((sum, r) => sum + r.score, 0) / results.length).toFixed(1)
      : 0;

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4">
      <Link to="/quizzes" className="text-accent hover:underline text-sm">
        ← Quay lại bài kiểm tra
      </Link>
      <h1 className="font-display text-2xl font-bold mt-4 mb-6">Lịch sử làm bài</h1>

      {results.length === 0 ? (
        <p className="text-text-muted">Bạn chưa làm bài kiểm tra nào.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-surface border border-border rounded-card p-4 text-center">
              <p className="text-3xl font-bold text-accent">{results.length}</p>
              <p className="text-xs text-text-muted mt-1">Lần làm bài</p>
            </div>
            <div className="bg-surface border border-border rounded-card p-4 text-center">
              <p className="text-3xl font-bold text-accent">{average}</p>
              <p className="text-xs text-text-muted mt-1">Điểm trung bình</p>
            </div>
          </div>

          <div className="grid gap-3">
            {results.map((r) => (
              <div
                key={r.id}
                className="bg-surface border border-border rounded-card p-4 flex items-center justify-between"
              >
                <div>
                  <Link
                    to={`/quizzes/${r.quiz}`}
                    className="font-semibold hover:text-accent transition"
                  >
                    {r.quiz_title}
                  </Link>
                  <p className="text-xs text-text-faint mt-1">
                    {new Date(r.completed_at).toLocaleString('vi-VN')}
                  </p>
                </div>
                <span className="text-lg font-bold text-accent">{r.score}/10</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}