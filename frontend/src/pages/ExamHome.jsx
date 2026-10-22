import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, History, Play } from 'lucide-react';
import { authApi, endpoints } from '../api/api';
import { formatDuration } from '../utils/formatTime';
import { HankoBadge } from '../components/JapaneseIcons';

const SERIF = { fontFamily: "'Noto Serif JP', serif" };
const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];
const COUNTS = [10, 20, 30];

function Pill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-4 py-1.5 text-sm font-medium transition cursor-pointer ${
        active
          ? 'border-accent bg-accent text-white'
          : 'border-border bg-surface text-text-muted hover:border-accent'
      }`}
    >
      {children}
    </button>
  );
}

export default function ExamHome() {
  const navigate = useNavigate();
  const [active, setActive] = useState(null);
  const [perQuestion, setPerQuestion] = useState(45);
  const [history, setHistory] = useState(null);
  const [level, setLevel] = useState('N5');
  const [count, setCount] = useState(20);
  const [starting, setStarting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    Promise.all([authApi.get(`${endpoints['exams']}active/`), authApi.get(endpoints['exams'])])
      .then(([a, h]) => {
        if (ignore) return;
        setActive(a.data.attempt);
        setPerQuestion(a.data.seconds_per_question || 45);
        setHistory(h.data);
      })
      .catch(() => {
        if (!ignore) setError('Không tải được dữ liệu thi thử, bạn thử tải lại trang nhé.');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  const start = async () => {
    setStarting(true);
    setError('');
    try {
      const res = await authApi.post(endpoints['exams'], { level, count });
      navigate(`/exam/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Không tạo được đề thi, bạn thử lại nhé.');
      setStarting(false);
    }
  };

  if (loading) {
    return <div className="max-w-3xl mx-auto py-20 px-4 text-center text-sm text-text-muted">Đang tải...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 space-y-6">
      <div>
        <p className="text-sm font-bold text-accent" style={SERIF}>
          模擬試験 • MOSHI SHIKEN
        </p>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-text tracking-tight">
          Thi thử có bấm giờ
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Bài trắc nghiệm gồm từ vựng, Hán tự và ngữ pháp, tự tạo từ kho dữ liệu của web. Đây là bài luyện
          tập, không phải đề thi chính thức.
        </p>
      </div>

      {error && <p className="text-sm font-medium text-accent">{error}</p>}

      {active ? (
        <div className="jp-card p-6">
          <div className="flex items-center gap-2">
            <HankoBadge text={active.level} />
            <h2 className="font-display font-bold text-lg text-text">Bạn có một bài thi chưa nộp</h2>
          </div>
          <p className="mt-2 text-sm text-text-muted">
            {active.total} câu • còn khoảng {formatDuration(active.remaining_seconds)}. Thời gian vẫn
            đang chạy.
          </p>
          <Link
            to={`/exam/${active.id}`}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white transition hover:bg-accent-hover"
          >
            <Play className="h-4 w-4" />
            Tiếp tục làm bài
          </Link>
        </div>
      ) : (
        <div className="jp-card p-6">
          <h2 className="font-display font-bold text-lg text-text">Tạo đề mới</h2>

          <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">Cấp độ</p>
          <div className="flex flex-wrap gap-2">
            {LEVELS.map((l) => (
              <Pill key={l} active={level === l} onClick={() => setLevel(l)}>
                {l}
              </Pill>
            ))}
          </div>

          <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">Số câu</p>
          <div className="flex flex-wrap gap-2">
            {COUNTS.map((c) => (
              <Pill key={c} active={count === c} onClick={() => setCount(c)}>
                {c} câu
              </Pill>
            ))}
          </div>

          <p className="mt-5 flex items-center gap-2 text-sm text-text-muted">
            <Clock className="h-4 w-4 text-accent" />
            Thời gian làm bài: <strong className="text-text">{formatDuration(count * perQuestion)}</strong>{' '}
            ({perQuestion} giây mỗi câu)
          </p>

          <button
            onClick={start}
            disabled={starting}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-hover disabled:opacity-60 cursor-pointer"
          >
            <Play className="h-4 w-4" />
            {starting ? 'Đang tạo đề...' : 'Bắt đầu làm bài'}
          </button>
        </div>
      )}

      <div className="jp-card p-6">
        <h2 className="flex items-center gap-2 font-display font-bold text-lg text-text">
          <History className="h-5 w-5 text-accent" />
          Lịch sử thi thử
        </h2>
        {!history || history.length === 0 ? (
          <p className="mt-3 text-sm text-text-muted">Bạn chưa nộp bài thi thử nào.</p>
        ) : (
          <div className="mt-3 divide-y divide-border/70">
            {history.map((h) => (
              <Link
                key={h.id}
                to={`/exam/${h.id}`}
                className="flex items-center justify-between gap-3 py-3 transition hover:text-accent"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <HankoBadge text={h.level} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text">
                      {h.correct_count}/{h.total} câu đúng
                      {h.late && <span className="ml-2 text-xs text-accent">(nộp quá giờ)</span>}
                    </p>
                    <p className="text-xs text-text-faint">
                      {new Date(h.created_at).toLocaleString('vi-VN')} • {formatDuration(h.time_used_seconds)}
                    </p>
                  </div>
                </div>
                <span className="font-display text-lg font-bold text-accent">{h.percent}%</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}