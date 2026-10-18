import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Brain, Flame, Star, User as UserIcon} from 'lucide-react';
import { authApi, endpoints } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { HankoBadge } from '../components/JapaneseIcons';
import KanaTables from '../components/KanaTables';

const SERIF = { fontFamily: "'Noto Serif JP', serif" };

function greeting() {
  const hour = new Date().getHours();
  if (hour < 11) return { jp: 'おはよう', vi: 'Chào buổi sáng' };
  if (hour < 18) return { jp: 'こんにちは', vi: 'Chào buổi chiều' };
  return { jp: 'こんばんは', vi: 'Chào buổi tối' };
}

function ProgressBar({ value, total }) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-border/60">
      <div className="h-full bg-accent transition-all" style={{ width: `${percent}%` }} />
    </div>
  );
}

function StatCard({ icon: Icon, value, label }) {
  return (
    <div className="jp-card p-4 text-center">
      <Icon className="mx-auto mb-1 h-5 w-5 text-accent" />
      <p className="font-display text-2xl font-bold text-text">{value}</p>
      <p className="text-xs text-text-muted">{label}</p>
    </div>
  );
}

function CardTitle({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-2 text-sm font-semibold text-accent">
      <Icon className="h-4 w-4" />
      {children}
    </div>
  );
}

function ActionLink({ to, children }) {
  return (
    <Link
      to={to}
      className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white transition hover:bg-accent-hover"
    >
      {children}
      <ArrowRight className="h-4 w-4" />
    </Link>
  );
}

function Skeleton() {
  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 space-y-4 animate-pulse">
      <div className="h-20 rounded-2xl bg-border/50" />
      <div className="grid grid-cols-3 gap-3">
        <div className="h-24 rounded-2xl bg-border/50" />
        <div className="h-24 rounded-2xl bg-border/50" />
        <div className="h-24 rounded-2xl bg-border/50" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-44 rounded-2xl bg-border/50" />
        <div className="h-44 rounded-2xl bg-border/50" />
      </div>
      <div className="h-56 rounded-2xl bg-border/50" />
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    authApi
      .get(endpoints['dashboard'])
      .then((res) => {
        if (!ignore) setData(res.data);
      })
      .catch(() => {
        if (!ignore) setError('Không tải được bảng điều khiển, bạn thử tải lại trang nhé.');
      });
    return () => {
      ignore = true;
    };
  }, [user?.id]);

  if (error) {
    return (
      <div className="max-w-5xl mx-auto py-20 px-4 text-center">
        <p className="text-sm font-medium text-accent">{error}</p>
      </div>
    );
  }
  if (!data || !user) return <Skeleton />;

  const { review, next_lesson: nextLesson, courses, levels, recent_quizzes: quizzes } = data;
  const hello = greeting();
  const name = user.display_name || user.username;
  const visibleLevels = levels.filter((l) => l.total > 0);

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 space-y-6">
      {/* Lời chào */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-bold text-accent" style={SERIF}>
            {hello.jp} • {hello.vi}
          </p>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-text tracking-tight wrap-break-word">
            {name}
          </h1>
        </div>
        <Link
          to="/profile/account"
          className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-text-muted transition hover:border-accent hover:text-accent"
        >
          <UserIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Thông tin tài khoản</span>
          <span className="sm:hidden">Tài khoản</span>
        </Link>
      </div>

      {/* Chỉ số cá nhân */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={Flame} value={user.streak_count ?? 0} label="Ngày liên tiếp" />
        <StatCard icon={Star} value={user.points ?? 0} label="Điểm tích luỹ" />
        <StatCard icon={BookOpen} value={user.level || '—'} label="Trình độ" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Ôn tập hôm nay */}
        <div className="jp-card p-6 flex flex-col">
          <CardTitle icon={Brain}>Ôn tập hôm nay</CardTitle>
          <p className="font-display font-bold text-2xl text-text mt-3">
            {review.due > 0 ? `${review.due} từ cần ôn lại` : 'Chưa có từ nào đến hạn ôn lại'}
          </p>
          <p className="text-sm text-text-muted mt-1">
            {review.new > 0
              ? `Và ${review.new} từ mới đang chờ bạn.`
              : 'Bạn đã học hết toàn bộ từ hiện có.'}
          </p>
          <ActionLink to="/flashcards">
            {review.due > 0 ? 'Bắt đầu ôn tập' : 'Học từ mới'}
          </ActionLink>
        </div>

        {/* Tiếp tục học */}
        <div className="jp-card p-6 flex flex-col">
          <CardTitle icon={BookOpen}>Tiếp tục học</CardTitle>
          {nextLesson ? (
            <>
              <div className="mt-3 flex items-center gap-2">
                <HankoBadge text={nextLesson.level} />
                <span className="text-xs text-text-muted">{nextLesson.course_title}</span>
              </div>
              <p className="font-display font-bold text-xl text-text mt-2">{nextLesson.title}</p>
              <ActionLink to={`/lessons/${nextLesson.id}`}>Vào bài học</ActionLink>
            </>
          ) : (
            <>
              <p className="font-display font-bold text-xl text-text mt-3">
                Bạn đã hoàn thành mọi bài học hiện có
              </p>
              <p className="text-sm text-text-muted mt-1">Ôn lại từ vựng để giữ vững kiến thức nhé.</p>
              <ActionLink to="/courses">Xem các khoá học</ActionLink>
            </>
          )}
        </div>
      </div>

      {/* Tiến độ theo cấp độ */}
      <div className="jp-card p-6">
        <h2 className="font-display font-bold text-lg text-text">Từ vựng và Kanji đã học</h2>
        <p className="text-xs text-text-muted mt-0.5">
          Tính các từ bạn đã trả lời đúng ít nhất một lần và chưa quên.
        </p>
        {visibleLevels.length === 0 ? (
          <p className="text-sm text-text-muted mt-4">Chưa có dữ liệu từ vựng.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {visibleLevels.map((l) => (
              <div key={l.level}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-semibold text-text">{l.level}</span>
                  <span className="text-text-muted">
                    {l.learned}/{l.total}
                  </span>
                </div>
                <ProgressBar value={l.learned} total={l.total} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Khoá học */}
      <div className="jp-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-lg text-text">Khoá học của bạn</h2>
          <Link to="/courses" className="text-sm text-accent hover:underline">
            Xem tất cả
          </Link>
        </div>
        {courses.length === 0 ? (
          <p className="text-sm text-text-muted mt-4">Chưa có khoá học nào.</p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {courses.map((c) => (
              <Link
                key={c.id}
                to={`/courses/${c.id}`}
                className="rounded-xl border border-border/70 bg-surface p-4 transition hover:border-accent"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="min-w-0 truncate text-sm font-semibold text-text">{c.title}</p>
                  <HankoBadge text={c.level} />
                </div>
                <p className="mt-1 mb-2 text-xs text-text-muted">
                  {c.completed}/{c.total} bài học
                </p>
                <ProgressBar value={c.completed} total={c.total} />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Bài kiểm tra gần đây */}
      <div className="jp-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-lg text-text">Bài kiểm tra gần đây</h2>
          <Link to="/quiz-history" className="text-sm text-accent hover:underline">
            Xem lịch sử
          </Link>
        </div>
        {quizzes.length === 0 ? (
          <p className="text-sm text-text-muted mt-4">
            Bạn chưa làm bài kiểm tra nào.{' '}
            <Link to="/quizzes" className="text-accent hover:underline">
              Làm bài ngay
            </Link>
          </p>
        ) : (
          <div className="mt-4 divide-y divide-border/70">
            {quizzes.map((q) => (
              <Link
                key={q.id}
                to={`/quizzes/${q.quiz_id}`}
                className="flex items-center justify-between gap-3 py-3 transition hover:text-accent"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-text">{q.title}</p>
                  <p className="text-xs text-text-faint">
                    {new Date(q.completed_at).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <span className="font-display text-lg font-bold text-accent">{q.score}/10</span>
              </Link>
            ))}
          </div>
        )}
      </div>
      <KanaTables collapsible defaultOpen={false} />
    </div>
  );
}