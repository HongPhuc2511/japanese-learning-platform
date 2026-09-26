import { useEffect, useState } from 'react';
import api, { endpoints } from '../api/api';

export default function Kanji() {
  const [kanjiList, setKanjiList] = useState([]);
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

  if (loading) return <p className="text-center mt-10">Đang tải...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Kanji</h1>
      {kanjiList.length === 0 ? (
        <p className="text-gray-500">Chưa có kanji nào.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {kanjiList.map((k) => (
            <div key={k.id} className="border rounded-lg p-4 text-center">
              <div className="text-4xl font-bold">{k.character}</div>
              <p className="text-gray-700 mt-2">{k.meaning}</p>
              <p className="text-xs text-gray-500 mt-1">
                On: {k.onyomi} | Kun: {k.kunyomi}
              </p>
              <span className="inline-block mt-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                {k.jlpt_level}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}