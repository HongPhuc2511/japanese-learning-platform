import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { endpoints } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { HankoBadge } from '../components/JapaneseIcons';
import { HelpCircle, ChevronRight, History, Award } from 'lucide-react';

export default function Quizzes() {
  const { user } = useAuth();
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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <div className="font-serif text-3xl text-accent animate-pulse mb-2" style={{ fontFamily: "'Noto Serif JP', serif" }}>
          演習問題
        </div>
        <p className="text-text-muted text-sm font-medium">Đang tải danh sách bài thi...</p>
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
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-serif text-accent font-bold text-sm" style={{ fontFamily: "'Noto Serif JP', serif" }}>
              実戦演習 • JISSEN ENSHU
            </span>
            <span className="text-text-faint">•</span>
            <span className="text-xs text-text-muted">Tổng cộng {quizzes.length} đề thi</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-text tracking-tight">
            Bài kiểm tra JLPT
          </h1>
          <p className="text-sm text-text-muted mt-2 max-w-xl">
            Luyện tập trả lời trắc nghiệm theo thời gian thực để đánh giá chính xác năng lực ngôn ngữ.
          </p>
        </div>

        {user && (
          <Link
            to="/quiz-history"
            className="inline-flex items-center gap-2 bg-surface text-text-muted hover:text-accent border border-border hover:border-accent px-4 py-2 rounded-full text-xs font-semibold transition shadow-xs self-start sm:self-end"
          >
            <History className="w-3.5 h-3.5" />
            <span>Lịch sử làm bài</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {quizzes.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-2xl border border-border">
          <p className="text-text-muted text-sm">Chưa có bài kiểm tra nào.</p>
        </div>
      ) : (
        <div className="grid gap-3.5 sm:grid-cols-2">
          {quizzes.map((quiz) => (
            <Link
              key={quiz.id}
              to={`/quizzes/${quiz.id}`}
              className="jp-card p-5 flex items-center justify-between group hover:border-accent"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-accent-soft text-accent flex items-center justify-center group-hover:scale-105 transition-transform">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-text group-hover:text-accent transition">
                    {quiz.title}
                  </h2>
                  <span className="text-xs text-text-muted mt-0.5 block">
                    Đề trắc nghiệm năng lực
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-text-faint group-hover:text-accent group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}