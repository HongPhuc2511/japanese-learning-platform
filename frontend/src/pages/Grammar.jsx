import { useEffect, useState } from 'react';
import api, { endpoints } from '../api/api';

export default function Grammar() {
  const [grammars, setGrammars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGrammar = async () => {
      try {
        const res = await api.get(endpoints['grammar']);
        setGrammars(res.data);
      } catch (err) {
        setError('Không tải được danh sách ngữ pháp');
      } finally {
        setLoading(false);
      }
    };
    fetchGrammar();
  }, []);

  if (loading) return <p className="text-center mt-10 text-text-muted">Đang tải...</p>;
  if (error) return <p className="text-center mt-10 text-accent">{error}</p>;

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4">
      <h1 className="font-display text-2xl font-bold mb-6">Ngữ pháp</h1>
      {grammars.length === 0 ? (
        <p className="text-text-muted">Chưa có ngữ pháp nào.</p>
      ) : (
        <div className="grid gap-3">
          {grammars.map((g) => (
            <div key={g.id} className="bg-surface border border-border rounded-card p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{g.title}</h2>
                <span className="text-xs bg-accent-soft text-accent px-2 py-0.5 rounded-button">
                  {g.level}
                </span>
              </div>
              <p className="text-text-muted mt-2">{g.explanation}</p>
              {g.example_sentence && (
                <p className="text-sm text-text-faint mt-2 italic">
                  Ví dụ: {g.example_sentence}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}