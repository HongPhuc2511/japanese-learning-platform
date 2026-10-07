import { useEffect, useState } from 'react';
import { authApi, endpoints } from '../api/api';

const QUALITY_OPTIONS = [
  { label: 'Lại', value: 0, color: 'bg-bg text-text-muted border-border hover:border-text-faint' },
  { label: 'Khó', value: 3, color: 'bg-accent-soft text-accent border-accent' },
  { label: 'Tốt', value: 4, color: 'bg-accent text-white border-accent' },
  { label: 'Dễ', value: 5, color: 'bg-text text-white border-text' },
];

export default function Flashcards() {
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDueCards = async () => {
      try {
        const res = await authApi.get(`${endpoints['flashcards']}due/`);
        setCards(res.data.filter((c) => c.content !== null));
      } catch (err) {
        setError('Không tải được danh sách thẻ cần ôn');
      } finally {
        setLoading(false);
      }
    };
    fetchDueCards();
  }, []);

  const currentCard = cards[currentIndex];

  const handleReview = async (quality) => {
    try {
      await authApi.post(`${endpoints['flashcards']}${currentCard.id}/review/`, {
        quality,
      });
      setFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    } catch (err) {
      console.error('Lỗi khi ghi nhận kết quả ôn', err);
    }
  };

  if (loading) return <p className="text-center mt-10 text-text-muted">Đang tải...</p>;
  if (error) return <p className="text-center mt-10 text-accent">{error}</p>;

  if (cards.length === 0) {
    return (
      <div className="max-w-md mx-auto mt-20 px-4 text-center">
        <p className="text-text-muted">Chưa có thẻ nào cần ôn tập hôm nay.</p>
      </div>
    );
  }

  if (currentIndex >= cards.length) {
    return (
      <div className="max-w-md mx-auto mt-20 px-4 text-center">
        <h1 className="font-display text-2xl font-bold mb-2">Hoàn thành!</h1>
        <p className="text-text-muted">Bạn đã ôn hết {cards.length} thẻ hôm nay.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 px-4">
      <p className="text-center text-sm text-text-faint mb-6">
        Thẻ {currentIndex + 1}/{cards.length}
      </p>

      <div
        onClick={() => setFlipped(!flipped)}
        className="bg-surface border border-border rounded-card p-10 min-h-[200px] flex flex-col items-center justify-center text-center cursor-pointer hover:border-accent transition"
      >
        {!flipped ? (
          <>
            <p className="text-4xl font-bold">{currentCard.content.front}</p>
            {currentCard.content.kana && (
              <p className="text-text-muted mt-2">{currentCard.content.kana}</p>
            )}
            <p className="text-text-faint text-xs mt-6">(Bấm để xem đáp án)</p>
          </>
        ) : (
          <p className="text-2xl">{currentCard.content.back}</p>
        )}
      </div>

      {flipped && (
        <div className="grid grid-cols-4 gap-2 mt-6">
          {QUALITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleReview(opt.value)}
              className={`border rounded-button py-2 text-sm font-medium transition ${opt.color}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}