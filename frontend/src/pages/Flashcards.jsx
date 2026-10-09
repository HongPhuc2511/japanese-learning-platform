import { useEffect, useState } from 'react';
import { authApi, endpoints } from '../api/api';
import { HankoBadge, DarumaIcon, ToriiIcon } from '../components/JapaneseIcons';
import { speakJapanese } from '../utils/speak';
import { Volume2, CheckCircle2, XCircle, RotateCcw, Brain, Sparkles, Award } from 'lucide-react';

const LEVELS = [
  { value: 'N5', label: 'N5', kanji: '初級' },
  { value: 'N4', label: 'N4', kanji: '基礎' },
  { value: 'N3', label: 'N3', kanji: '中級' },
  { value: 'N2', label: 'N2', kanji: '上級' },
  { value: 'N1', label: 'N1', kanji: '極' },
];

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

export default function Flashcards() {
  const [allCards, setAllCards] = useState([]);
  const [level, setLevel] = useState('N5');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [correctCount, setCorrectCount] = useState(0);

  useEffect(() => {
    const fetchDueCards = async () => {
      try {
        const res = await authApi.get(`${endpoints['flashcards']}due/`);
        setAllCards(res.data.filter((c) => c.content !== null));
      } catch (err) {
        setError('Không tải được danh sách thẻ cần ôn');
      } finally {
        setLoading(false);
      }
    };
    fetchDueCards();
  }, []);

  const cards = allCards.filter((c) => c.content.level === level);
  const currentCard = cards[currentIndex];

  useEffect(() => {
    if (!currentCard) return;

    const distractorPool = cards
      .filter((c) => c.content.back !== currentCard.content.back)
      .map((c) => c.content.back);
    const uniqueDistractors = [...new Set(distractorPool)];
    const wrongAnswers = shuffle(uniqueDistractors).slice(0, 3);

    const finalOptions = shuffle([currentCard.content.back, ...wrongAnswers]);
    setOptions(finalOptions);
    setSelected(null);
  }, [currentIndex, level, allCards]);

  const handleSelect = async (option) => {
    if (selected) return;
    setSelected(option);

    const isCorrect = option === currentCard.content.back;
    if (isCorrect) setCorrectCount((prev) => prev + 1);
    const quality = isCorrect ? 4 : 1;

    try {
      await authApi.post(`${endpoints['flashcards']}${currentCard.id}/review/`, {
        quality,
      });
    } catch (err) {
      console.error('Lỗi khi ghi nhận kết quả ôn', err);
    }

    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 1100);
  };

  const handleLevelChange = (newLevel) => {
    setLevel(newLevel);
    setCurrentIndex(0);
    setCorrectCount(0);
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <div className="font-serif text-3xl text-accent animate-pulse mb-2" style={{ fontFamily: "'Noto Serif JP', serif" }}>
          記憶反復
        </div>
        <p className="text-text-muted text-sm font-medium">Đang tải thẻ ôn tập SRS...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <p className="text-accent text-sm font-medium">{error}</p>
      </div>
    );
  }

  const progressPercent = cards.length > 0 ? Math.round((currentIndex / cards.length) * 100) : 0;

  return (
    <div className="max-w-lg mx-auto py-10 px-4 sm:px-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 bg-accent-soft px-3 py-1 rounded-full text-accent text-xs font-semibold mb-2">
          <Brain className="w-3.5 h-3.5" />
          <span>Thuật toán lặp lại ngắt quãng SRS • 間隔反復</span>
        </div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-text">
          Thẻ ghi nhớ Flashcard
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Chọn nghĩa chính xác để củng cố ký ức dài hạn
        </p>
      </div>

      {/* Level Selector */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {LEVELS.map((l) => {
          const isActive = level === l.value;
          return (
            <button
              key={l.value}
              onClick={() => handleLevelChange(l.value)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1 cursor-pointer ${
                isActive
                  ? 'bg-accent text-white border-accent shadow-xs scale-105'
                  : 'bg-surface text-text-muted border-border hover:border-accent/60'
              }`}
            >
              <span>{l.label}</span>
              <span
                className={`text-[10px] font-serif ${isActive ? 'text-white/80' : 'text-accent'}`}
                style={{ fontFamily: "'Noto Serif JP', serif" }}
              >
                {l.kanji}
              </span>
            </button>
          );
        })}
      </div>

      {cards.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-2xl border border-border p-8">
          <div className="w-14 h-14 mx-auto rounded-full bg-matcha-soft text-matcha flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="font-bold text-lg text-text mb-2">Tuyệt vời! Đã hoàn thành</h2>
          <p className="text-text-muted text-xs leading-relaxed max-w-xs mx-auto">
            Không có thẻ nào cần ôn ở cấp độ {level} vào lúc này. Các thẻ đã học sẽ xuất hiện lại khi đến chu kỳ ôn tập tiếp theo.
          </p>
        </div>
      ) : currentIndex >= cards.length ? (
        <div className="text-center py-12 bg-surface rounded-2xl border border-border p-8 shadow-xs">
          <div className="w-16 h-16 mx-auto rounded-full bg-accent-soft text-accent flex items-center justify-center mb-4">
            <DarumaIcon className="w-9 h-9" />
          </div>
          <p className="text-xs font-bold text-accent uppercase tracking-wider mb-1">
            お疲れ様でした • Hoàn thành xuất sắc!
          </p>
          <h2 className="font-display font-extrabold text-2xl text-text mb-2">
            Đã hoàn thành buổi ôn tập
          </h2>
          <p className="text-xs text-text-muted mb-6">
            Bạn đã ôn tập xong tất cả {cards.length} thẻ ở cấp {level}.
          </p>

          <div className="bg-surface-subtle border border-border rounded-xl p-4 mb-6 grid grid-cols-2 gap-3 text-center">
            <div>
              <span className="text-2xl font-bold text-accent">{cards.length}</span>
              <p className="text-[11px] text-text-muted mt-0.5">Tổng số thẻ</p>
            </div>
            <div>
              <span className="text-2xl font-bold text-matcha">{correctCount}</span>
              <p className="text-[11px] text-text-muted mt-0.5">Số câu chính xác</p>
            </div>
          </div>

          <button
            onClick={() => {
              setCurrentIndex(0);
              setCorrectCount(0);
            }}
            className="inline-flex items-center gap-2 bg-accent text-white text-xs font-semibold px-6 py-2.5 rounded-full hover:bg-accent-hover transition shadow-xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Ôn tập lại vòng này</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Progress bar */}
          <div>
            <div className="flex items-center justify-between text-xs text-text-muted mb-2">
              <span className="font-medium">
                Thẻ {currentIndex + 1} / {cards.length}
              </span>
              <span className="text-accent font-semibold">{progressPercent}%</span>
            </div>
            <div className="h-2 bg-surface border border-border rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-accent to-accent-hover transition-all duration-300 rounded-full"
                style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Main Flashcard Card */}
          <div className="bg-surface border border-border rounded-2xl p-8 text-center shadow-xs relative overflow-hidden group">
            {/* Top right pronunciation */}
            <button
              onClick={() => speakJapanese(currentCard.content.kana || currentCard.content.front)}
              className="absolute top-4 right-4 p-2 rounded-full text-text-muted hover:text-accent hover:bg-accent-soft transition cursor-pointer"
              title="Phát âm tiếng Nhật"
            >
              <Volume2 className="w-5 h-5" />
            </button>

            {/* Top left Hanko badge */}
            <div className="absolute top-4 left-4">
              <HankoBadge text={level} />
            </div>

            <div className="py-6">
              <p
                className="text-4xl sm:text-5xl font-extrabold text-text tracking-wide font-serif"
                style={{ fontFamily: "'Noto Serif JP', serif" }}
              >
                {currentCard.content.front}
              </p>
              {currentCard.content.kana && (
                <p className="text-sm font-medium text-text-muted mt-3 bg-surface-subtle inline-block px-3 py-1 rounded-full border border-border/60">
                  {currentCard.content.kana}
                </p>
              )}
            </div>
          </div>

          {/* Answer Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {options.map((opt) => {
              let btnStyle = 'border-border bg-surface text-text hover:border-accent hover:bg-surface-subtle';

              if (selected) {
                const isCorrectOption = opt === currentCard.content.back;
                const isSelectedOption = opt === selected;

                if (isCorrectOption) {
                  btnStyle = 'border-matcha bg-matcha-soft text-matcha font-bold shadow-xs scale-[1.02]';
                } else if (isSelectedOption) {
                  btnStyle = 'border-accent bg-accent-soft text-accent font-semibold';
                } else {
                  btnStyle = 'border-border bg-surface opacity-40';
                }
              }

              return (
                <button
                  key={opt}
                  onClick={() => handleSelect(opt)}
                  disabled={!!selected}
                  className={`border rounded-xl py-4 px-4 text-sm font-medium transition-all duration-200 text-center cursor-pointer ${btnStyle}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}