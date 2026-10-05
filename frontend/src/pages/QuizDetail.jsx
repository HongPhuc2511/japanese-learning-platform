import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { endpoints, authApi } from '../api/api';

export default function QuizDetail() {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [selected, setSelected] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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
    if (result) return;
    setSelected((prev) => ({ ...prev, [questionId]: answerId }));
  };

  const handleSubmit = async () => {
    const answers = Object.entries(selected).map(([questionId, answerId]) => ({
      question: Number(questionId),
      answer: answerId,
    }));

    setSubmitting(true);
    try {
      const res = await authApi.post(
        `${endpoints['quizzes']}${id}/submit/`,
        { answers }
      );
      setResult(res.data);
    } catch (err) {
      setError('Nộp bài thất bại, thử lại sau');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-center mt-10 text-text-muted">Đang tải...</p>;
  if (error) return <p className="text-center mt-10 text-accent">{error}</p>;

  const getResultFor = (questionId) =>
    result?.results.find((r) => r.question === questionId);

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4">
      <Link to="/quizzes" className="text-accent hover:underline text-sm">
        ← Quay lại danh sách
      </Link>

      <h1 className="font-display text-2xl font-bold mt-4 mb-6">{quiz.title}</h1>

      {result && (
        <div className="bg-accent-soft border border-accent rounded-card p-4 mb-6">
          <p className="font-semibold text-accent">
            Điểm: {result.score}/10 ({result.correct_count}/{result.total} câu đúng)
          </p>
        </div>
      )}

      <div className="space-y-6">
        {quiz.questions.map((q, index) => {
          const questionResult = getResultFor(q.id);

          return (
            <div key={q.id} className="bg-surface border border-border rounded-card p-4">
              <p className="font-semibold">
                Câu {index + 1}: {q.question_text}
              </p>

              <div className="mt-3 space-y-2">
                {q.answers.map((a) => {
                  const isSelected = selected[q.id] === a.id;
                  let style = 'border-border hover:border-accent';

                  if (result && isSelected) {
                    style = questionResult?.is_correct
                      ? 'border-accent bg-accent-soft'
                      : 'border-text-faint bg-bg';
                  } else if (isSelected) {
                    style = 'border-accent bg-accent-soft';
                  }

                  return (
                    <label
                      key={a.id}
                      className={`flex items-center gap-2 border rounded-button p-2 cursor-pointer transition ${style}`}
                    >
                      <input
                        type="radio"
                        name={`question-${q.id}`}
                        checked={isSelected}
                        onChange={() => handleSelect(q.id, a.id)}
                        disabled={!!result}
                      />
                      {a.answer_text}
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {!result && (
        <button
          onClick={handleSubmit}
          disabled={submitting || Object.keys(selected).length === 0}
          className="mt-6 w-full bg-accent text-white py-2 rounded-button hover:bg-accent-hover transition disabled:opacity-50"
        >
          {submitting ? 'Đang nộp...' : 'Nộp bài'}
        </button>
      )}
    </div>
  );
}