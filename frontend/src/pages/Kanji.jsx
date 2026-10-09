import { useEffect, useState } from 'react';
import api, { endpoints, authApi } from '../api/api';
import { useAuth } from '../context/AuthContext';
import LevelFilter from '../components/LevelFilter';

export default function Kanji() {
  const { user } = useAuth();
  const [kanjiList, setKanjiList] = useState([]);
  const [level, setLevel] = useState('all');
  const [bookmarkMap, setBookmarkMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchKanji = async () => {
      try {
        const res = await api.get(endpoints['kanji']);
        setKanjiList(res.data);
      } catch (err) {
        setError('Không tải được danh sách kanji');
      } finally {
        setLoading(false);
      }
    };
    fetchKanji();
  }, []);

  useEffect(() => {
    if (!user) {
      setBookmarkMap({});
      return;
    }
    const fetchBookmarks = async () => {
      try {
        const res = await authApi.get(endpoints['bookmarks']);
        const map = {};
        res.data
          .filter((b) => b.content_type === 'kanji')
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

  const toggleBookmark = async (kanjiId) => {
    const existingId = bookmarkMap[kanjiId];
    try {
      if (existingId) {
        await authApi.delete(`${endpoints['bookmarks']}${existingId}/`);
        setBookmarkMap((prev) => {
          const copy = { ...prev };
          delete copy[kanjiId];
          return copy;
        });
      } else {
        const res = await authApi.post(endpoints['bookmarks'], {
          content_type: 'kanji',
          object_id: kanjiId,
        });
        setBookmarkMap((prev) => ({ ...prev, [kanjiId]: res.data.id }));
      }
    } catch (err) {
      console.error('Lỗi khi đánh dấu bookmark', err);
    }
  };

  if (loading) return <p className="text-center mt-10 text-text-muted">Đang tải...</p>;
  if (error) return <p className="text-center mt-10 text-accent">{error}</p>;

  const filteredKanji =
    level === 'all' ? kanjiList : kanjiList.filter((k) => k.jlpt_level === level);

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4">
      <h1 className="font-display text-2xl font-bold mb-6">Kanji</h1>

      <LevelFilter value={level} onChange={setLevel} />

      {filteredKanji.length === 0 ? (
        <p className="text-text-muted">
          {level === 'all' ? 'Chưa có kanji nào.' : `Chưa có kanji cấp ${level}.`}
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {filteredKanji.map((k) => (
            <div
              key={k.id}
              className="bg-surface border border-border rounded-card p-4 text-center relative"
            >
              {user && (
                <button
                  onClick={() => toggleBookmark(k.id)}
                  className="absolute top-2 right-2 text-lg text-accent"
                >
                  {bookmarkMap[k.id] ? '★' : '☆'}
                </button>
              )}
              <div className="text-4xl font-bold">{k.character}</div>
              <p className="text-text-muted mt-2">{k.meaning}</p>
              <p className="text-xs text-text-faint mt-1">
                On: {k.onyomi} | Kun: {k.kunyomi}
              </p>
              <span className="inline-block mt-2 text-xs bg-accent-soft text-accent px-2 py-0.5 rounded-button">
                {k.jlpt_level}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}