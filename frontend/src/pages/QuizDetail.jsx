import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { endpoints } from '../api/api';

export default function QuizDetail() {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [selected, setSelected] = useState({}); // { questionId: answerId }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await api.get(`${endpoints['quizzes']}${id}/`);
        setQuiz(res.data);
      } catch (err) {
        setError('Không tìm thấy bài kiểm tra');
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id]);

  const handleSelect = (questionId, answerId) => {
    setSelected((prev) => ({ ...prev, [questionId]: answerId }));
  };

  if (loading) return <p className="text-center mt-10">Đang tải...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4">
      <Link to="/quizzes" className="text-blue-600 hover:underline text-sm">
        ← Quay lại danh sách
      </Link>

      <h1 className="text-2xl font-bold mt-4 mb-6">{quiz.title}</h1>

      {quiz.questions.length === 0 ? (
        <p className="text-gray-500">Bài kiểm tra này chưa có câu hỏi.</p>
      ) : (
        <div className="space-y-6">
          {quiz.questions.map((q, index) => (
            <div key={q.id} className="border rounded-lg p-4">
              <p className="font-semibold">
                Câu {index + 1}: {q.question_text}
              </p>

              {q.audio && (
                <audio controls src={q.audio} className="mt-2 w-full" />
              )}

              <div className="mt-3 space-y-2">
                {q.answers.map((a) => (
                  <label
                    key={a.id}
                    className={`flex items-center gap-2 border rounded-md p-2 cursor-pointer ${
                      selected[q.id] === a.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${q.id}`}
                      checked={selected[q.id] === a.id}
                      onChange={() => handleSelect(q.id, a.id)}
                    />
                    {a.answer_text}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}