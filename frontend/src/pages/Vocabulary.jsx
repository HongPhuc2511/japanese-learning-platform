import { useEffect, useState } from 'react';
import api, { endpoints } from '../api/api';

export default function Vocabulary() {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVocabulary = async () => {
      try {
        const res = await api.get(endpoints['vocabulary']);
        setWords(res.data);
      } catch (err) {
        setError('Không tải được danh sách từ vựng');
      } finally {
        setLoading(false);
      }
    };
    fetchVocabulary();
  }, []);

  if (loading) return <p className="text-center mt-10">Đang tải...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Từ vựng</h1>
      {words.length === 0 ? (
        <p className="text-gray-500">Chưa có từ vựng nào.</p>
      ) : (
        <div className="grid gap-3">
          {words.map((word) => (
            <div key={word.id} className="border rounded-lg p-4">
              <div className="flex items-baseline gap-3">
                <span className="text-xl font-semibold">{word.word}</span>
                <span className="text-gray-500">{word.kana}</span>
                {word.romaji && (
                  <span className="text-gray-400 text-sm">({word.romaji})</span>
                )}
              </div>
              <p className="text-gray-700 mt-1">{word.meaning}</p>
              {word.example_sentence && (
                <p className="text-sm text-gray-500 mt-2 italic">
                  {word.example_sentence}
                  {word.example_meaning && ` — ${word.example_meaning}`}
                </p>
              )}
              <span className="inline-block mt-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                {word.level}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}