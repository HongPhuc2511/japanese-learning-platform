import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { endpoints } from '../api/api';

export default function Quizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await api.get(endpoints['quizzes']);
        setQuizzes(res.data);
      } catch (err) {
        setError('Không tải được danh sách bài kiểm tra');
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  if (loading) return <p className="text-center mt-10 text-text-muted">Đang tải...</p>;
  if (error) return <p className="text-center mt-10 text-accent">{error}</p>;

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4">
      <h1 className="font-display text-2xl font-bold mb-6">Bài kiểm tra</h1>
      {quizzes.length === 0 ? (
        <p className="text-text-muted">Chưa có bài kiểm tra nào.</p>
      ) : (
        <div className="grid gap-3">
          {quizzes.map((quiz) => (
            <Link
              key={quiz.id}
              to={`/quizzes/${quiz.id}`}
              className="block bg-surface border border-border rounded-card p-4 hover:border-accent transition"
            >
              <h2 className="text-lg font-semibold">{quiz.title}</h2>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}