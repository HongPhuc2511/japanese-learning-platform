import { useEffect, useState } from 'react';
import api, { endpoints, authApi } from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function Vocabulary() {
  const { user } = useAuth();
  const [words, setWords] = useState([]);
  const [bookmarkMap, setBookmarkMap] = useState({});
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

  useEffect(() => {
    if (!user) return;
    const fetchBookmarks = async () => {
      try {
        const res = await authApi.get(endpoints['bookmarks']);
        const map = {};
        res.data
          .filter((b) => b.content_type === 'vocabulary')
          .forEach((b) => {
            map[b.object_id] = b.id;
          });
        setBookmarkMap(map);
      } catch (err) {
        console.error('Không tải được bookmark', err);
      }
    };
    fetchBookmarks();
  }, [user]);

  const toggleBookmark = async (wordId) => {
    const existingId = bookmarkMap[wordId];
    try {
      if (existingId) {
        await authApi.delete(`${endpoints['bookmarks']}${existingId}/`);
        setBookmarkMap((prev) => {
          const copy = { ...prev };
          delete copy[wordId];
          return copy;
        });
      } else {
        const res = await authApi.post(endpoints['bookmarks'], {
          content_type: 'vocabulary',
          object_id: wordId,
        });
        setBookmarkMap((prev) => ({ ...prev, [wordId]: res.data.id }));
      }
    } catch (err) {
      console.error('Lỗi khi đánh dấu bookmark', err);
    }
  };

  if (loading) return <p className="text-center mt-10 text-text-muted">Đang tải...</p>;
  if (error) return <p className="text-center mt-10 text-accent">{error}</p>;

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4">
      <h1 className="font-display text-2xl font-bold mb-6">Từ vựng</h1>
      {words.length === 0 ? (
        <p className="text-text-muted">Chưa có từ vựng nào.</p>
      ) : (
        <div className="grid gap-3">
          {words.map((word) => (
            <div key={word.id} className="bg-surface border border-border rounded-card p-4 relative">
              {user && (
                <button
                  onClick={() => toggleBookmark(word.id)}
                  className="absolute top-3 right-3 text-xl text-accent"
                >
                  {bookmarkMap[word.id] ? '★' : '☆'}
                </button>
              )}
              <div className="flex items-baseline gap-3 pr-8">
                <span className="text-xl font-semibold">{word.word}</span>
                <span className="text-text-muted">{word.kana}</span>
                {word.romaji && (
                  <span className="text-text-faint text-sm">({word.romaji})</span>
                )}
              </div>
              <p className="text-text-muted mt-1">{word.meaning}</p>
              {word.example_sentence && (
                <p className="text-sm text-text-faint mt-2 italic">
                  {word.example_sentence}
                  {word.example_meaning && ` — ${word.example_meaning}`}
                </p>
              )}
              <span className="inline-block mt-2 text-xs bg-accent-soft text-accent px-2 py-0.5 rounded-button">
                {word.level}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}