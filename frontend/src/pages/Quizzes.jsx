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

  if (loading) return <p className="text-center mt-10">Đang tải...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Bài kiểm tra</h1>
      {quizzes.length === 0 ? (
        <p className="text-gray-500">Chưa có bài kiểm tra nào.</p>
      ) : (
        <div className="grid gap-3">
          {quizzes.map((quiz) => (
            <Link
              key={quiz.id}
              to={`/quizzes/${quiz.id}`}
              className="block border rounded-lg p-4 hover:shadow-md transition"
            >
              <h2 className="text-lg font-semibold">{quiz.title}</h2>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}