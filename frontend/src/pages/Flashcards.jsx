import { useCallback, useEffect, useRef, useState } from 'react';
import { authApi, endpoints } from '../api/api';
import { HankoBadge } from '../components/JapaneseIcons';
import { speakJapanese } from '../utils/speak';
import { Brain, Volume2 } from 'lucide-react';

const SERIF = { fontFamily: "'Noto Serif JP', serif" };

const LEVELS = [
  { value: 'all', label: 'Tất cả', jp: '全' },
  { value: 'N5', label: 'N5', jp: '初級' },
  { value: 'N4', label: 'N4', jp: '基礎' },
  { value: 'N3', label: 'N3', jp: '中級' },
  { value: 'N2', label: 'N2', jp: '上級' },
  { value: 'N1', label: 'N1', jp: '極' },
];

function shuffle(array) {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Mỗi lần một từ xuất hiện (kể cả khi bị xếp lại sau câu sai) có uid riêng và 4 đáp án xáo lại
function prepare(item, attempt = 0) {
  return {
    ...item,
    attempt,
    uid: `${item.content_type}-${item.object_id}-${attempt}`,
    options: shuffle([item.content.back, ...item.distractors]),
  };
}

function QuestionCard({ item, onAnswer, onNext }) {
  const [selected, setSelected] = useState(null);
  const timer = useRef(null);
  const { content } = item;

  useEffect(() => () => clearTimeout(timer.current), []);

  const handleSelect = (option) => {
    if (selected !== null) return;
    setSelected(option);
    const correct = option === content.back;
    onAnswer(correct);
    // Sai thì dừng lâu hơn một chút để kịp đọc đáp án đúng
    timer.current = setTimeout(() => onNext(correct), correct ? 900 : 1600);
  };

  return (
    <div className="jp-card p-6 sm:p-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <HankoBadge text={content.level} />
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              item.is_new ? 'bg-matcha-soft text-matcha' : 'bg-accent-soft text-accent'
            }`}
          >
            {item.is_new ? 'Từ mới' : 'Ôn lại'}
          </span>
        </div>
        <button
          onClick={() => speakJapanese(content.kana || content.front)}
          className="p-1.5 rounded-full text-text-muted hover:text-accent hover:bg-accent-soft transition cursor-pointer"
          title="Nghe phát âm"
        >
          <Volume2 className="w-5 h-5" />
        </button>
      </div>

      <div className="text-center py-6">
        <p className="text-5xl sm:text-6xl font-bold text-text" style={SERIF}>
          {content.front}
        </p>
        {content.kana && <p className="text-text-muted mt-3 text-lg">{content.kana}</p>}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {item.options.map((option) => {
          let style = 'border-border bg-surface hover:border-accent';
          if (selected !== null) {
            if (option === content.back) style = 'border-green-600 bg-green-50 text-green-800';
            else if (option === selected) style = 'border-red-500 bg-red-50 text-red-700';
            else style = 'border-border bg-surface opacity-50';
          }
          return (
            <button
              key={option}
              onClick={() => handleSelect(option)}
              disabled={selected !== null}
              className={`rounded-xl border-2 px-4 py-3.5 text-left text-sm font-medium transition cursor-pointer disabled:cursor-default ${style}`}
            >
              {option}
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <p
          className={`mt-4 text-center text-sm font-medium ${
            selected === content.back ? 'text-green-700' : 'text-red-600'
          }`}
        >
          {selected === content.back ? 'Chính xác!' : `Chưa đúng. Đáp án: ${content.back}`}
        </p>
      )}
    </div>
  );
}

function Message({ children, tone = 'muted' }) {
  return (
    <div className="jp-card p-10 text-center">
      <p className={`text-sm font-medium ${tone === 'error' ? 'text-accent' : 'text-text-muted'}`}>
        {children}
      </p>
    </div>
  );
}

export default function Flashcards() {
  const [mode, setMode] = useState('study'); // 'study' | 'reviewed'
  const [level, setLevel] = useState('all');

  // Mục "Cần ôn"
  const [queue, setQueue] = useState([]);
  const [batchTotal, setBatchTotal] = useState(0);
  const [meta, setMeta] = useState({ due: 0, fresh: 0 });
  const [loadingQueue, setLoadingQueue] = useState(true);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [error, setError] = useState('');

  // Mục "Đã ôn"
  const [reviewed, setReviewed] = useState(null);
  const [loadingReviewed, setLoadingReviewed] = useState(false);
  const [practice, setPractice] = useState(null);
  const [notice, setNotice] = useState('');

  const [saveError, setSaveError] = useState(false);
  const pendingRef = useRef(Promise.resolve()); // lần lưu kết quả gần nhất
  const queueRequest = useRef(0);
  const reviewedRequest = useRef(0);

  const saveAnswer = (item, correct) => {
    pendingRef.current = authApi
      .post(`${endpoints['flashcards']}answer/`, {
        content_type: item.content_type,
        object_id: item.object_id,
        quality: correct ? 4 : 1,
      })
      .then(() => setSaveError(false))
      .catch(() => setSaveError(true));
  };

  const loadQueue = useCallback(async () => {
    const id = ++queueRequest.current;
    setLoadingQueue(true);
    setError('');
    try {
      await pendingRef.current; // đợi câu vừa trả lời được lưu xong rồi mới lấy lượt mới
      const res = await authApi.get(`${endpoints['flashcards']}queue/`, {
        params: level === 'all' ? {} : { level },
      });
      if (id !== queueRequest.current) return;
      setQueue(res.data.items.map((item) => prepare(item)));
      setBatchTotal(res.data.items.length);
      setMeta({ due: res.data.due_count, fresh: res.data.new_count });
    } catch (err) {
      if (id !== queueRequest.current) return;
      setError('Không tải được danh sách thẻ ôn tập');
    } finally {
      if (id === queueRequest.current) setLoadingQueue(false);
    }
  }, [level]);

  const loadReviewed = useCallback(async () => {
    const id = ++reviewedRequest.current;
    setLoadingReviewed(true);
    setError('');
    try {
      await pendingRef.current;
      const res = await authApi.get(`${endpoints['flashcards']}reviewed/`, {
        params: level === 'all' ? {} : { level },
      });
      if (id !== reviewedRequest.current) return;
      setReviewed(res.data);
    } catch (err) {
      if (id !== reviewedRequest.current) return;
      setError('Không tải được danh sách từ đã ôn');
    } finally {
      if (id === reviewedRequest.current) setLoadingReviewed(false);
    }
  }, [level]);

  useEffect(() => {
    setPractice(null);
    setNotice('');
    if (mode === 'study') loadQueue();
    else loadReviewed();
  }, [mode, loadQueue, loadReviewed]);

  // Trả lời đúng thì bỏ khỏi lượt; sai thì xếp xuống cuối lượt để gặp lại
  const handleNext = (correct) => {
    const [current, ...rest] = queue;
    const next = correct ? rest : [...rest, prepare(current, current.attempt + 1)];
    setQueue(next);
    if (correct) setSessionCorrect((n) => n + 1);
    if (next.length === 0) loadQueue(); // hết lượt thì lấy lượt tiếp theo
  };

  const handlePracticeNext = async (correct) => {
    setNotice(correct ? '' : 'Từ này đã quay lại mục "Cần ôn" để bạn học lại.');
    setPractice(null);
    await loadReviewed();
  };

  const done = batchTotal - queue.length;
  const percent = batchTotal ? Math.round((done / batchTotal) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6">
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
          <Brain className="w-3.5 h-3.5" />
          Thuật toán lặp lại ngắt quãng SRS • 間隔反復
        </span>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-text tracking-tight mt-3">
          Thẻ ghi nhớ Flashcard
        </h1>
        <p className="text-sm text-text-muted mt-1">Chọn nghĩa chính xác để củng cố ký ức dài hạn</p>
      </div>

      {/* Chuyển giữa Cần ôn và Đã ôn */}
      <div className="flex justify-center mb-4">
        <div className="inline-flex rounded-full border border-border bg-surface p-1">
          {[
            ['study', 'Cần ôn'],
            ['reviewed', reviewed ? `Đã ôn (${reviewed.count})` : 'Đã ôn'],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setMode(key)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition cursor-pointer ${
                mode === key ? 'bg-accent text-white' : 'text-text-muted hover:text-accent'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Chọn cấp độ, mặc định "Tất cả" đi từ N5 lên N1 */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {LEVELS.map((l) => (
          <button
            key={l.value}
            onClick={() => setLevel(l.value)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition cursor-pointer ${
              level === l.value
                ? 'border-accent bg-accent text-white'
                : 'border-border bg-surface text-text-muted hover:border-accent'
            }`}
          >
            {l.label}{' '}
            <span className={`text-xs ${level === l.value ? 'text-white/80' : 'text-accent/80'}`}>
              {l.jp}
            </span>
          </button>
        ))}
      </div>

      {saveError && (
        <p className="text-center text-xs text-accent mb-3">
          Không lưu được kết quả lần trả lời gần nhất, hãy kiểm tra kết nối mạng.
        </p>
      )}

      {/* ===== Cần ôn ===== */}
      {mode === 'study' &&
        (error ? (
          <Message tone="error">{error}</Message>
        ) : loadingQueue ? (
          <Message>Đang chuẩn bị thẻ ôn tập...</Message>
        ) : queue.length === 0 ? (
          <div className="jp-card p-10 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
              <svg viewBox="0 0 24 24" className="h-8 w-8 text-green-700" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="m8 12.5 3 3 5-6" />
              </svg>
            </div>
            <h2 className="font-display font-bold text-xl text-text">Tuyệt vời! Đã hoàn thành</h2>
            <p className="text-sm text-text-muted mt-2 max-w-sm mx-auto leading-relaxed">
              {level === 'all'
                ? 'Bạn đã ôn hết các từ đến hạn và học hết từ mới hiện có. Từ đã ôn sẽ quay lại khi đến chu kỳ ôn tập tiếp theo.'
                : `Không còn từ nào để ôn ở cấp ${level} lúc này. Hãy chọn cấp độ khác hoặc xem mục "Đã ôn".`}
            </p>
            <button
              onClick={() => setMode('reviewed')}
              className="mt-5 rounded-full border border-border bg-surface px-4 py-1.5 text-sm text-text-muted transition hover:border-accent hover:text-accent cursor-pointer"
            >
              Xem các từ đã ôn
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-text-muted mb-1.5">
                <span>
                  Lượt này: {done}/{batchTotal} thẻ
                  {sessionCorrect > 0 && ` • Đã đúng ${sessionCorrect} từ`}
                </span>
                <span>
                  {meta.due} cần ôn lại • {meta.fresh} từ chưa học
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-border/60">
                <div className="h-full bg-accent transition-all" style={{ width: `${percent}%` }} />
              </div>
            </div>
            <QuestionCard
              key={queue[0].uid}
              item={queue[0]}
              onAnswer={(correct) => saveAnswer(queue[0], correct)}
              onNext={handleNext}
            />
          </>
        ))}

      {/* ===== Đã ôn ===== */}
      {mode === 'reviewed' &&
        (practice ? (
          <>
            <button
              onClick={() => setPractice(null)}
              className="mb-4 text-sm text-accent hover:underline cursor-pointer"
            >
              ← Quay lại danh sách
            </button>
            <QuestionCard
              key={practice.uid}
              item={practice}
              onAnswer={(correct) => saveAnswer(practice, correct)}
              onNext={handlePracticeNext}
            />
          </>
        ) : error ? (
          <Message tone="error">{error}</Message>
        ) : !reviewed || loadingReviewed ? (
          <Message>Đang tải các từ đã ôn...</Message>
        ) : (
          <>
            {notice && <p className="mb-3 text-center text-sm text-accent">{notice}</p>}
            {reviewed.items.length === 0 ? (
              <Message>
                {level === 'all'
                  ? 'Bạn chưa ôn xong từ nào. Các từ trả lời đúng ở mục "Cần ôn" sẽ xuất hiện ở đây.'
                  : `Chưa có từ nào ở cấp ${level} nằm trong mục đã ôn.`}
              </Message>
            ) : (
              <>
                <p className="mb-3 text-xs text-text-muted">
                  Bấm vào một từ để ôn lại. Ôn sớm mà trả lời đúng thì chỉ luyện thêm, không đổi lịch ôn.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {reviewed.items.map((item) => (
                    <button
                      key={`${item.content_type}-${item.object_id}`}
                      onClick={() => {
                        setNotice('');
                        setPractice(prepare(item));
                      }}
                      className="jp-card p-4 text-left transition hover:border-accent cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <HankoBadge text={item.content.level} />
                        <span className="text-[11px] text-text-faint">
                          Ôn lại sau {new Date(item.next_review_date).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-2xl font-bold text-text" style={SERIF}>
                          {item.content.front}
                        </span>
                        {item.content.kana && (
                          <span className="text-sm text-text-muted">{item.content.kana}</span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-text-muted">{item.content.back}</p>
                    </button>
                  ))}
                </div>
              </>
            )}
          </>
        ))}
    </div>
  );
}