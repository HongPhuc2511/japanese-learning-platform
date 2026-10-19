import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw, X } from 'lucide-react';

const SERIF = { fontFamily: "'Noto Serif JP', serif" };
const STROKE_MS = 700; // thời gian vẽ một nét ở tốc độ thường
const GAP_MS = 250; // nghỉ giữa hai nét
const SPEEDS = [
  { label: 'Chậm', value: 0.6 },
  { label: 'Thường', value: 1 },
  { label: 'Nhanh', value: 1.8 },
];
const iconBtn =
  'p-2 rounded-full border border-border bg-surface text-text-muted transition hover:border-accent hover:text-accent cursor-pointer';

const cache = new Map();

function loadStrokes(character) {
  if (cache.has(character)) return cache.get(character);
  const hex = character.codePointAt(0).toString(16).padStart(5, '0');
  const request = fetch(`/kanjivg/${hex}.json`)
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => (data && Array.isArray(data.strokes) && data.strokes.length ? data.strokes : null))
    // Không có file, hoặc dev server trả về trang HTML thay cho JSON
    .catch(() => null);
  cache.set(character, request);
  return request;
}

export default function KanjiStrokeOrder({ kanji, onClose }) {
  const { character } = kanji;
  const [strokes, setStrokes] = useState(null); // null: đang tải
  const [missing, setMissing] = useState(false);
  const [current, setCurrent] = useState(0); // nét đang vẽ
  const [progress, setProgress] = useState(0); // tiến độ của nét đó, từ 0 đến 1
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [showNumbers, setShowNumbers] = useState(true);

  useEffect(() => {
    let ignore = false;
    setStrokes(null);
    setMissing(false);
    loadStrokes(character).then((data) => {
      if (ignore) return;
      if (!data) {
        setMissing(true);
        return;
      }
      setStrokes(data);
      setCurrent(0);
      setProgress(0);
      setPlaying(true);
    });
    return () => {
      ignore = true;
    };
  }, [character]);

  // Esc để đóng, khoá cuộn trang phía sau
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  const total = strokes ? strokes.length : 0;

  // Vòng lặp hoạt hình: vẽ nét hiện tại, nghỉ một chút rồi sang nét kế tiếp
  useEffect(() => {
    if (!playing || total === 0) return undefined;
    let raf;
    let timer;
    let start = null;
    const duration = STROKE_MS / speed;

    const tick = (now) => {
      if (start === null) start = now;
      const p = Math.min((now - start) / duration, 1);
      setProgress(p);
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        timer = setTimeout(() => {
          if (current < total - 1) {
            setCurrent(current + 1);
            setProgress(0);
          } else {
            setPlaying(false);
          }
        }, GAP_MS / speed);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [playing, current, total, speed]);

  const atEnd = total > 0 && current === total - 1 && progress === 1;
  const drawn = progress > 0 ? current + 1 : current;

  const replay = () => {
    setCurrent(0);
    setProgress(0);
    setPlaying(true);
  };
  const togglePlay = () => {
    if (playing) setPlaying(false);
    else if (atEnd) replay();
    else setPlaying(true);
  };
  const next = () => {
    setPlaying(false);
    if (progress < 1) setProgress(1);
    else if (current < total - 1) {
      setCurrent(current + 1);
      setProgress(1);
    }
  };
  const prev = () => {
    setPlaying(false);
    if (current > 0) {
      setCurrent(current - 1);
      setProgress(1);
    } else {
      setProgress(0);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Thứ tự nét của chữ ${character}`}
    >
      <div
        className="jp-card relative w-full max-w-sm max-h-[92vh] overflow-y-auto p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Đóng"
          className="absolute right-3 top-3 rounded-full p-1.5 text-text-muted transition hover:bg-accent-soft hover:text-accent cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="pr-8">
          <p className="text-xs font-bold text-accent" style={SERIF}>
            筆順 • THỨ TỰ NÉT
          </p>
          <h2 className="font-display text-xl font-bold text-text">{kanji.meaning}</h2>
          <p className="mt-0.5 text-xs text-text-muted">
            {kanji.onyomi && `On: ${kanji.onyomi}`}
            {kanji.onyomi && kanji.kunyomi && ' • '}
            {kanji.kunyomi && `Kun: ${kanji.kunyomi}`}
            {total > 0 && ` • ${total} nét`}
          </p>
        </div>

        <div className="mx-auto mt-4 aspect-square w-64 max-w-full">
          {missing ? (
            <div className="flex h-full items-center justify-center rounded-xl border border-border bg-surface p-4 text-center">
              <div>
                <p className="text-5xl font-bold text-text" style={SERIF}>
                  {character}
                </p>
                <p className="mt-3 text-sm text-text-muted">Chưa có dữ liệu thứ tự nét cho chữ này.</p>
              </div>
            </div>
          ) : !strokes ? (
            <div className="flex h-full items-center justify-center rounded-xl border border-border bg-surface text-sm text-text-muted">
              Đang tải...
            </div>
          ) : (
            <svg
              viewBox="0 0 109 109"
              className="h-full w-full rounded-xl bg-surface"
              role="img"
              aria-label={`Hoạt hình thứ tự nét của chữ ${character}`}
            >
              {/* Ô ly */}
              <rect x="1" y="1" width="107" height="107" rx="6" className="fill-none stroke-border" strokeWidth="1" />
              <line x1="54.5" y1="1" x2="54.5" y2="108" className="stroke-border" strokeWidth="0.6" strokeDasharray="3 3" />
              <line x1="1" y1="54.5" x2="108" y2="54.5" className="stroke-border" strokeWidth="0.6" strokeDasharray="3 3" />

              {/* Hình mờ của cả chữ để thấy trước đích đến */}
              <g fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="text-border" opacity="0.6">
                {strokes.map((s, i) => (
                  <path key={i} d={s.d} />
                ))}
              </g>

              {/* Các nét đã vẽ; nét đang vẽ có màu nhấn */}
              <g fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                {strokes.map((s, i) => {
                  if (i > current) return null;
                  const isCurrent = i === current;
                  const partial = isCurrent && progress < 1;
                  if (partial && progress <= 0) return null;
                  return (
                    <path
                      key={i}
                      d={s.d}
                      pathLength="1"
                      stroke="currentColor"
                      className={isCurrent ? 'text-accent' : 'text-text'}
                      strokeDasharray={partial ? '1 1' : undefined}
                      strokeDashoffset={partial ? 1 - progress : undefined}
                    />
                  );
                })}
              </g>

              {/* Số thứ tự nét */}
              {showNumbers &&
                strokes.map((s, i) =>
                  s.n && (i < current || (i === current && progress > 0)) ? (
                    <text key={i} x={s.n[0]} y={s.n[1]} fontSize="7" fontWeight="bold" className="fill-accent">
                      {i + 1}
                    </text>
                  ) : null
                )}
            </svg>
          )}
        </div>

        {strokes && (
          <>
            <div className="mt-4 flex items-center justify-center gap-2">
              <button onClick={prev} aria-label="Nét trước" className={iconBtn}>
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={togglePlay}
                className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-hover cursor-pointer"
              >
                {playing ? (
                  <>
                    <Pause className="h-4 w-4" /> Tạm dừng
                  </>
                ) : atEnd ? (
                  <>
                    <RotateCcw className="h-4 w-4" /> Phát lại
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" /> Phát
                  </>
                )}
              </button>
              <button onClick={next} aria-label="Nét sau" className={iconBtn}>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-3 text-center text-xs text-text-muted">
              Nét {drawn}/{total}
            </p>

            <div className="mt-3 flex items-center justify-between gap-2 text-xs text-text-muted">
              <div className="flex gap-1">
                {SPEEDS.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setSpeed(s.value)}
                    className={`rounded-full border px-2.5 py-1 transition cursor-pointer ${
                      speed === s.value
                        ? 'border-accent bg-accent text-white'
                        : 'border-border bg-surface hover:border-accent'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <label className="flex cursor-pointer items-center gap-1.5">
                <input type="checkbox" checked={showNumbers} onChange={(e) => setShowNumbers(e.target.checked)} />
                Hiện số nét
              </label>
            </div>
          </>
        )}

        <p className="mt-4 border-t border-border/70 pt-3 text-center text-[11px] leading-relaxed text-text-faint">
          Dữ liệu thứ tự nét:{' '}
          <a href="https://kanjivg.tagaini.net/" target="_blank" rel="noreferrer" className="underline hover:text-accent">
            KanjiVG
          </a>{' '}
          © Ulrich Apel, giấy phép{' '}
          <a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noreferrer" className="underline hover:text-accent">
            CC BY-SA 3.0
          </a>
        </p>
      </div>
    </div>
  );
}