import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { endpoints, authApi } from '../api/api';
import { HankoBadge } from '../components/JapaneseIcons';
import { ArrowLeft, CheckCircle2, XCircle, Award, RotateCcw } from 'lucide-react';

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
      setError('Nộp bài thất bại, vui lòng thử lại sau');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-20 px-4 text-center">
        <div className="font-serif text-3xl text-accent animate-pulse mb-2" style={{ fontFamily: "'Noto Serif JP', serif" }}>
          試験中
        </div>
        <p className="text-text-muted text-sm font-medium">Đang chuẩn bị đề thi...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto py-20 px-4 text-center">
        <p className="text-accent text-sm font-medium">{error}</p>
      </div>
    );
  }

  const getResultFor = (questionId) =>
    result?.results?.find((r) => r.question === questionId);

  const answeredCount = Object.keys(selected).length;
  const totalCount = quiz.questions?.length || 0;

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6">
      {/* Back button */}
      <Link
        to="/quizzes"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-accent transition mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại danh sách bài kiểm tra</span>
      </Link>

      {/* Quiz Paper Header */}
      <div className="jp-card p-6 sm:p-8 mb-8 relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-accent uppercase tracking-wider bg-accent-soft px-2.5 py-1 rounded-full">
            Đề thi trắc nghiệm • 演習問題
          </span>
          <span className="text-xs text-text-muted">
            {answeredCount}/{totalCount} câu đã chọn
          </span>
        </div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-text">
          {quiz.title}
        </h1>
        <p className="text-xs text-text-muted mt-2">
          Đọc kỹ câu hỏi và chọn đáp án chính xác nhất. Sau khi nộp bài sẽ hiển thị ngay điểm số và đáp án đúng.
        </p>
      </div>

      {/* Result Certificate Banner */}
      {result && (
        <div className="bg-surface border-2 border-accent/40 rounded-2xl p-6 sm:p-8 mb-8 shadow-xs relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-accent text-white flex items-center justify-center font-serif text-2xl font-bold shrink-0 shadow-sm" style={{ fontFamily: "'Noto Serif JP', serif" }}>
                {result.score >= 5 ? '合格' : '努力'}
              </div>
              <div>
                <span className="text-xs font-bold text-accent uppercase tracking-wider">
                  Kết quả bài kiểm tra • 判定結果
                </span>
                <h2 className="text-2xl font-extrabold text-text mt-0.5">
                  Điểm số: <span className="text-accent">{result.score}</span> / 10
                </h2>
                <p className="text-xs text-text-muted mt-1">
                  Đúng {result.correct_count} / {result.total} câu ({Math.round((result.correct_count / result.total) * 100)}%)
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setResult(null);
                setSelected({});
              }}
              className="inline-flex items-center gap-2 bg-surface text-text border border-border hover:border-accent px-5 py-2.5 rounded-full text-xs font-semibold transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-accent" />
              <span>Làm lại bài thi</span>
            </button>
          </div>
        </div>
      )}

      {/* Questions Sheet */}
      <div className="space-y-6">
        {quiz.questions.map((q, index) => {
          const questionResult = getResultFor(q.id);

          return (
            <div
              key={q.id}
              className={`jp-card p-5 sm:p-6 transition ${
                result
                  ? questionResult?.is_correct
                    ? 'border-matcha/50 bg-matcha-soft/20'
                    : 'border-accent/50 bg-accent-soft/20'
                  : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className="font-serif text-xs font-bold text-accent bg-accent-soft px-2 py-0.5 rounded shrink-0 mt-0.5"
                  style={{ fontFamily: "'Noto Serif JP', serif" }}
                >
                  問 {String(index + 1).padStart(2, '0')}
                </span>
                <p className="font-semibold text-text text-base leading-relaxed">
                  {q.question_text}
                </p>
              </div>

              <div className="mt-4 space-y-2.5 pl-0 sm:pl-9">
                {q.answers.map((a) => {
                  const isSelected = selected[q.id] === a.id;
                  let optStyle = 'border-border bg-surface hover:border-accent/60';

                  if (result) {
                    if (isSelected && questionResult?.is_correct) {
                      optStyle = 'border-matcha bg-matcha-soft text-matcha font-bold';
                    } else if (isSelected && !questionResult?.is_correct) {
                      optStyle = 'border-accent bg-accent-soft text-accent font-semibold';
                    } else {
                      optStyle = 'border-border bg-surface opacity-50';
                    }
                  } else if (isSelected) {
                    optStyle = 'border-accent bg-accent-soft text-accent font-semibold shadow-xs';
                  }

                  return (
                    <label
                      key={a.id}
                      className={`flex items-center gap-3 border rounded-xl p-3.5 cursor-pointer transition text-sm ${optStyle}`}
                    >
                      <input
                        type="radio"
                        name={`question-${q.id}`}
                        checked={isSelected}
                        onChange={() => handleSelect(q.id, a.id)}
                        disabled={!!result}
                        className="accent-accent"
                      />
                      <span>{a.answer_text}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit Button */}
      {!result && (
        <div className="mt-8 pt-4">
          <button
            onClick={handleSubmit}
            disabled={submitting || Object.keys(selected).length === 0}
            className="w-full bg-accent text-white py-3.5 rounded-full font-semibold text-sm hover:bg-accent-hover transition shadow-sm shadow-accent/20 disabled:opacity-50 cursor-pointer"
          >
            {submitting ? 'Đang chấm điểm...' : `Nộp bài thi (${answeredCount}/${totalCount} câu)`}
          </button>
        </div>
      )}
    </div>
  );
}