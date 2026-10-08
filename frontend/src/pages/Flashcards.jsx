import { useEffect, useState } from 'react';
import { authApi, endpoints } from '../api/api';

const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];

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
    }, 1000);
  };

  const handleLevelChange = (newLevel) => {
    setLevel(newLevel);
    setCurrentIndex(0);
  };

  if (loading) return <p className="text-center mt-10 text-text-muted">Đang tải...</p>;
  if (error) return <p className="text-center mt-10 text-accent">{error}</p>;

  return (
    <div className="max-w-md mx-auto mt-10 px-4">
      <div className="flex items-center justify-center gap-2 mb-8">
        {LEVELS.map((l) => (
          <button
            key={l}
            onClick={() => handleLevelChange(l)}
            className={`text-sm px-3 py-1.5 rounded-full border transition ${
              level === l
                ? 'bg-accent text-white border-accent'
                : 'bg-surface text-text-muted border-border hover:border-accent'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {cards.length === 0 ? (
        <p className="text-center text-text-muted">
          Không có thẻ nào cần ôn ở cấp độ {level}.
        </p>
      ) : currentIndex >= cards.length ? (
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold mb-2">Hoàn thành!</h1>
          <p className="text-text-muted">Bạn đã ôn hết {cards.length} thẻ cấp {level}.</p>
        </div>
      ) : (
        <>
          <p className="text-center text-sm text-text-faint mb-6">
            Thẻ {currentIndex + 1}/{cards.length}
          </p>

          <div className="bg-surface border border-border rounded-card p-10 text-center">
            <p className="text-4xl font-bold">{currentCard.content.front}</p>
            {currentCard.content.kana && (
              <p className="text-text-muted mt-2">{currentCard.content.kana}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6">
            {options.map((opt) => {
              let style = 'border-border hover:border-accent bg-surface';

              if (selected) {
                const isCorrectOption = opt === currentCard.content.back;
                const isSelectedOption = opt === selected;

                if (isCorrectOption) {
                  style = 'border-green-500 bg-green-50 text-green-700';
                } else if (isSelectedOption) {
                  style = 'border-red-500 bg-red-50 text-red-700';
                } else {
                  style = 'border-border bg-surface opacity-50';
                }
              }

              return (
                <button
                  key={opt}
                  onClick={() => handleSelect(opt)}
                  disabled={!!selected}
                  className={`border rounded-card py-4 px-3 text-sm font-medium transition ${style}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}