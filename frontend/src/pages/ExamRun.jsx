import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlarmClock, Check, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { authApi, endpoints } from '../api/api';
import { formatDuration } from '../utils/formatTime';
import { HankoBadge } from '../components/JapaneseIcons';

const SERIF = { fontFamily: "'Noto Serif JP', serif" };
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

function Result({ data }) {
  const [onlyWrong, setOnlyWrong] = useState(false);
  const mood =
    data.percent >= 80
      ? 'Xuất sắc! Bạn nắm rất chắc phần này.'
      : data.percent >= 60
        ? 'Khá tốt, ôn thêm các câu sai là sẽ vững hơn.'
        : 'Cần ôn thêm. Xem lại các câu sai bên dưới nhé.';
  const shown = onlyWrong ? data.questions.filter((q) => !q.is_correct) : data.questions;

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 space-y-6">
      <Link to="/exam" className="text-sm text-accent hover:underline">
        ← Quay lại thi thử
      </Link>

      <div className="jp-card p-6 text-center">
        <div className="flex items-center justify-center gap-2">
          <HankoBadge text={data.level} />
          <span className="text-sm text-text-muted">Kết quả bài thi</span>
        </div>
        <p className="mt-2 font-display text-6xl font-extrabold text-accent">{data.percent}%</p>
        <p className="mt-1 text-sm text-text">
          {data.correct_count}/{data.total} câu đúng
        </p>
        <p className="mt-1 text-sm text-text-muted">{mood}</p>
        <p className="mt-3 text-xs text-text-faint">
          Thời gian: {formatDuration(data.time_used_seconds)} / {formatDuration(data.duration_seconds)}
        </p>
        {data.late && (
          <p className="mt-3 rounded-xl bg-accent-soft p-3 text-xs text-accent">
            Bài này được nộp quá giờ nên không được cộng điểm.
          </p>
        )}
        <Link
          to="/exam"
          className="mt-4 inline-flex rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white transition hover:bg-accent-hover"
        >
          Làm đề khác
        </Link>
      </div>

      <div className="jp-card p-6">
        <h2 className="font-display font-bold text-lg text-text">Theo từng phần</h2>
        <div className="mt-4 space-y-3">
          {data.sections.map((s) => (
            <div key={s.key}>
              <div className="mb-1 flex justify-between text-xs">
                <span className="font-semibold text-text">{s.label}</span>
                <span className="text-text-muted">
                  {s.correct}/{s.total}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-border/60">
                <div className="h-full bg-accent" style={{ width: `${(s.correct / s.total) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-lg text-text">Xem lại bài làm</h2>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-text-muted">
          <input type="checkbox" checked={onlyWrong} onChange={(e) => setOnlyWrong(e.target.checked)} />
          Chỉ xem câu sai
        </label>
      </div>

      {shown.length === 0 ? (
        <p className="jp-card p-6 text-center text-sm text-text-muted">Bạn đã làm đúng tất cả các câu!</p>
      ) : (
        <div className="space-y-4">
          {shown.map((q) => (
            <div key={q.id} className="jp-card p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-text-muted">
                  Câu {q.id + 1} • {q.section_label}
                </p>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                    q.is_correct ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                  }`}
                >
                  {q.is_correct ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  {q.is_correct ? 'Đúng' : q.your_answer == null ? 'Chưa trả lời' : 'Sai'}
                </span>
              </div>
              <p className="mt-2 font-medium text-text" style={SERIF}>
                {q.prompt}
              </p>
              <div className="mt-3 space-y-2">
                {q.choices.map((choice, i) => {
                  let style = 'border-border bg-surface text-text';
                  if (i === q.correct) style = 'border-green-600 bg-green-50 text-green-800';
                  else if (i === q.your_answer) style = 'border-red-500 bg-red-50 text-red-700';
                  return (
                    <div key={i} className={`rounded-xl border px-3 py-2 text-sm ${style}`}>
                      <span className="mr-2 font-bold">{LETTERS[i]}.</span>
                      {choice}
                      {i === q.your_answer && i !== q.correct && (
                        <span className="ml-2 text-xs">(bạn chọn)</span>
                      )}
                    </div>
                  );
                })}
              </div>
              {q.explanation && (
                <p className="mt-3 rounded-xl bg-surface-subtle p-3 text-xs leading-relaxed text-text-muted">
                  {q.explanation}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ExamRun() {
  const { id } = useParams();
  const storageKey = `exam_answers_${id}`;
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [answers, setAnswers] = useState({});
  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const endAt = useRef(0);
  const answersRef = useRef({});
  const submittingRef = useRef(false);

  useEffect(() => {
    let ignore = false;
    setData(null);
    setError('');
    submittingRef.current = false;

    authApi
      .get(`${endpoints['exams']}${id}/`)
      .then((res) => {
        if (ignore) return;
        if (res.data.status === 'in_progress') {
          endAt.current = Date.now() + res.data.remaining_seconds * 1000;
          setRemaining(res.data.remaining_seconds);
          let saved = {};
          try {
            saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
          } catch {
            saved = {};
          }
          answersRef.current = saved;
          setAnswers(saved);
          setIndex(0);
        }
        setData(res.data);
      })
      .catch(() => {
        if (!ignore) setError('Không tải được bài thi này.');
      });
    return () => {
      ignore = true;
    };
  }, [id, storageKey]);

  const choose = (questionId, choice) => {
    const next = { ...answersRef.current, [questionId]: choice };
    answersRef.current = next;
    setAnswers(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // bỏ qua nếu trình duyệt chặn localStorage
    }
  };

  const submit = useCallback(async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await authApi.post(`${endpoints['exams']}${id}/submit/`, {
        answers: answersRef.current,
      });
      try {
        localStorage.removeItem(storageKey);
      } catch {
        // bỏ qua
      }
      setData(res.data);
      window.scrollTo({ top: 0 });
    } catch {
      submittingRef.current = false;
      setSubmitError('Nộp bài thất bại, hãy kiểm tra kết nối mạng rồi bấm "Nộp bài" lại.');
    } finally {
      setSubmitting(false);
      setConfirmOpen(false);
    }
  }, [id, storageKey]);

  const inProgress = data?.status === 'in_progress';

  // Đồng hồ: tính từ thời gian còn lại do server báo, hết giờ thì tự nộp bài
  useEffect(() => {
    if (!inProgress) return undefined;
    const timer = setInterval(() => {
      const left = Math.max(0, Math.ceil((endAt.current - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) {
        clearInterval(timer);
        submit();
      }
    }, 500);
    return () => clearInterval(timer);
  }, [inProgress, submit]);

  if (error) {
    return (
      <div className="max-w-3xl mx-auto py-20 px-4 text-center">
        <p className="text-sm font-medium text-accent">{error}</p>
        <Link to="/exam" className="mt-3 inline-block text-sm text-accent hover:underline">
          ← Quay lại thi thử
        </Link>
      </div>
    );
  }
  if (!data) {
    return <div className="max-w-3xl mx-auto py-20 px-4 text-center text-sm text-text-muted">Đang tải đề thi...</div>;
  }
  if (data.status === 'finished') return <Result data={data} />;

  const q = data.questions[index];
  const answered = Object.keys(answers).length;
  const unanswered = data.total - answered;
  const low = remaining <= 60;

  return (
    <div className="max-w-3xl mx-auto px-4 pb-10 sm:px-6">
      {/* Thanh đồng hồ luôn nằm trên cùng khi cuộn */}
      <div className="sticky top-0 z-20 -mx-4 mb-6 border-b border-border bg-surface/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <HankoBadge text={data.level} />
            <span className="text-sm text-text-muted">
              Đã làm {answered}/{data.total}
            </span>
          </div>
          <div
            className={`flex items-center gap-2 rounded-full px-3 py-1.5 font-display text-lg font-bold tabular-nums ${
              low ? 'animate-pulse bg-accent text-white' : 'bg-accent-soft text-accent'
            }`}
          >
            <AlarmClock className="h-5 w-5" />
            {formatDuration(remaining)}
          </div>
        </div>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-border/60">
          <div className="h-full bg-accent transition-all" style={{ width: `${(answered / data.total) * 100}%` }} />
        </div>
      </div>

      {/* Bảng chuyển câu */}
      <div className="mb-5 flex flex-wrap gap-1.5">
        {data.questions.map((item, i) => (
          <button
            key={item.id}
            onClick={() => setIndex(i)}
            aria-label={`Câu ${i + 1}`}
            className={`h-8 w-8 rounded-lg border text-xs font-semibold transition cursor-pointer ${
              i === index
                ? 'border-accent bg-accent text-white'
                : answers[item.id] !== undefined
                  ? 'border-accent/50 bg-accent-soft text-accent'
                  : 'border-border bg-surface text-text-muted hover:border-accent'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Câu hỏi */}
      <div className="jp-card p-6">
        <p className="text-xs font-semibold text-text-muted">
          Câu {index + 1}/{data.total} • {q.section_label}
        </p>
        <p className="mt-3 text-xl font-semibold leading-relaxed text-text" style={SERIF}>
          {q.prompt}
        </p>
        <div className="mt-5 space-y-2.5">
          {q.choices.map((choice, i) => {
            const selected = answers[q.id] === i;
            return (
              <button
                key={i}
                onClick={() => choose(q.id, i)}
                className={`flex w-full items-start gap-3 rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition cursor-pointer ${
                  selected
                    ? 'border-accent bg-accent-soft text-text'
                    : 'border-border bg-surface text-text hover:border-accent'
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    selected ? 'bg-accent text-white' : 'bg-border/50 text-text-muted'
                  }`}
                >
                  {LETTERS[i]}
                </span>
                <span className="pt-0.5">{choice}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <button
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-4 py-2 text-sm text-text-muted transition hover:border-accent hover:text-accent disabled:opacity-40 cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
          Câu trước
        </button>

        <button
          onClick={() => setConfirmOpen(true)}
          className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white transition hover:bg-accent-hover cursor-pointer"
        >
          Nộp bài
        </button>

        <button
          onClick={() => setIndex((i) => Math.min(data.total - 1, i + 1))}
          disabled={index === data.total - 1}
          className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-4 py-2 text-sm text-text-muted transition hover:border-accent hover:text-accent disabled:opacity-40 cursor-pointer"
        >
          Câu sau
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {submitError && <p className="mt-3 text-center text-sm font-medium text-accent">{submitError}</p>}

      {confirmOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
          onClick={() => !submitting && setConfirmOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className="jp-card w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-lg font-bold text-text">Nộp bài?</h2>
            <p className="mt-2 text-sm text-text-muted">
              {unanswered > 0
                ? `Bạn còn ${unanswered} câu chưa trả lời. Các câu đó sẽ tính là sai.`
                : 'Bạn đã trả lời tất cả các câu. Nộp bài để xem kết quả.'}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setConfirmOpen(false)}
                disabled={submitting}
                className="rounded-full border border-border bg-surface px-4 py-2 text-sm text-text-muted transition hover:border-accent cursor-pointer"
              >
                Làm tiếp
              </button>
              <button
                onClick={submit}
                disabled={submitting}
                className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white transition hover:bg-accent-hover disabled:opacity-60 cursor-pointer"
              >
                {submitting ? 'Đang nộp...' : 'Nộp bài'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}