import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi, endpoints } from '../api/api';
import { DarumaIcon } from '../components/JapaneseIcons';
import { ArrowLeft, Calendar } from 'lucide-react';

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

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-20 px-4 text-center">
        <div className="font-serif text-3xl text-accent animate-pulse mb-2" style={{ fontFamily: "'Noto Serif JP', serif" }}>
          受験記録
        </div>
        <p className="text-text-muted text-sm font-medium">Đang tải lịch sử thi cử...</p>
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

  const average =
    results.length > 0
      ? (results.reduce((sum, r) => sum + r.score, 0) / results.length).toFixed(1)
      : 0;

  const highestScore =
    results.length > 0 ? Math.max(...results.map((r) => r.score)) : 0;

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

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-serif text-accent font-bold text-sm" style={{ fontFamily: "'Noto Serif JP', serif" }}>
            受験記録 • JUKEN KIROKU
          </span>
          <span className="text-text-faint">•</span>
          <span className="text-xs text-text-muted">{results.length} lần làm bài</span>
        </div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-text">
          Lịch sử làm bài thi
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Theo dõi sự tiến bộ và điểm số qua các đợt luyện tập trắc nghiệm JLPT
        </p>
      </div>

      {results.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-2xl border border-border p-8">
          <DarumaIcon className="w-12 h-12 mx-auto mb-3 opacity-60" />
          <p className="text-text-muted text-sm">Bạn chưa tham gia bài kiểm tra nào.</p>
          <Link
            to="/quizzes"
            className="inline-block mt-4 text-xs font-semibold text-accent hover:underline"
          >
            Bắt đầu làm bài kiểm tra đầu tiên →
          </Link>
        </div>
      ) : (
        <>
          {/* Stats overview cards */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="jp-card p-4 text-center">
              <p
                className="font-serif text-3xl font-extrabold text-accent"
                style={{ fontFamily: "'Noto Serif JP', serif" }}
              >
                {results.length}
              </p>
              <p className="text-xs font-semibold text-text mt-1">Lần làm bài</p>
              <p className="text-[10px] text-text-muted">Tổng số lượt thi</p>
            </div>
            <div className="jp-card p-4 text-center">
              <p
                className="font-serif text-3xl font-extrabold text-matcha"
                style={{ fontFamily: "'Noto Serif JP', serif" }}
              >
                {average}
              </p>
              <p className="text-xs font-semibold text-text mt-1">Điểm TB</p>
              <p className="text-[10px] text-text-muted">Thang điểm 10</p>
            </div>
            <div className="jp-card p-4 text-center">
              <p
                className="font-serif text-3xl font-extrabold text-gold"
                style={{ fontFamily: "'Noto Serif JP', serif" }}
              >
                {highestScore}
              </p>
              <p className="text-xs font-semibold text-text mt-1">Điểm cao nhất</p>
              <p className="text-[10px] text-text-muted">Kỷ lục của bạn</p>
            </div>
          </div>

          {/* Results List */}
          <div className="space-y-3">
            {results.map((r) => {
              const isPass = r.score >= 5;
              return (
                <div
                  key={r.id}
                  className="jp-card p-4 sm:p-5 flex items-center justify-between gap-4 group hover:border-accent"
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-serif text-xs font-bold shrink-0 ${
                        isPass ? 'bg-matcha-soft text-matcha' : 'bg-accent-soft text-accent'
                      }`}
                      style={{ fontFamily: "'Noto Serif JP', serif" }}
                    >
                      {isPass ? '合格' : '努力'}
                    </div>
                    <div>
                      <Link
                        to={`/quizzes/${r.quiz}`}
                        className="font-bold text-sm sm:text-base text-text group-hover:text-accent transition"
                      >
                        {r.quiz_title}
                      </Link>
                      <div className="flex items-center gap-2 text-xs text-text-muted mt-0.5">
                        <Calendar className="w-3 h-3 text-text-faint" />
                        <span>{new Date(r.completed_at).toLocaleString('vi-VN')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-xl font-extrabold font-serif ${
                        isPass ? 'text-matcha' : 'text-accent'
                      }`}
                      style={{ fontFamily: "'Noto Serif JP', serif" }}
                    >
                      {r.score}
                    </span>
                    <span className="text-xs text-text-muted font-normal"> / 10</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}