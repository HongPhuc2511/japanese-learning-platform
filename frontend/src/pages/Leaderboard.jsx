import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Trophy } from 'lucide-react';
import { authApi, endpoints } from '../api/api';
import { useAuth } from '../context/AuthContext';

const SERIF = { fontFamily: "'Noto Serif JP', serif" };

function Row({ entry, highlight }) {
  const badge =
    entry.rank === 1
      ? 'bg-accent text-white'
      : entry.rank <= 3
        ? 'bg-accent-soft text-accent'
        : 'bg-border/50 text-text-muted';

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
        highlight ? 'border-accent bg-accent-soft/40' : 'border-border/70 bg-surface'
      }`}
    >
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${badge}`}>
        {entry.rank}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-text">
          {entry.name}
          {highlight && <span className="ml-2 text-xs font-medium text-accent">(Bạn)</span>}
        </p>
        <p className="flex items-center gap-1 text-xs text-text-muted">
          <Flame className="h-3 w-3" />
          {entry.streak} ngày liên tiếp
        </p>
      </div>
      <span className="font-display text-lg font-bold text-accent">
        {entry.points}
        <span className="ml-1 text-xs font-normal text-text-muted">điểm</span>
      </span>
    </div>
  );
}

export default function Leaderboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    authApi
      .get(endpoints['leaderboard'], { params: { limit: 20 } })
      .then((res) => {
        if (!ignore) setData(res.data);
      })
      .catch(() => {
        if (!ignore) setError('Không tải được bảng xếp hạng, bạn thử tải lại trang nhé.');
      });
    return () => {
      ignore = true;
    };
  }, [user?.id]);

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center">
        <p className="text-sm font-medium text-accent">{error}</p>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4 space-y-2 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-14 rounded-xl bg-border/50" />
        ))}
      </div>
    );
  }

  const { top, me, total_players: total } = data;
  const meInTop = top.some((e) => e.is_me);

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 sm:px-6">
      <Link to="/profile" className="text-sm text-accent hover:underline">
        ← Quay lại bảng điều khiển
      </Link>

      <div className="mt-4 mb-6">
        <p className="text-sm font-bold text-accent" style={SERIF}>
          ランキング • RANKING
        </p>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-text tracking-tight flex items-center gap-2">
          <Trophy className="h-7 w-7 text-accent" />
          Bảng xếp hạng
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Xếp theo tổng điểm tích luỹ. {total} học viên đang có điểm.
        </p>
      </div>

      {top.length === 0 ? (
        <div className="jp-card p-8 text-center">
          <p className="text-sm text-text-muted">
            Chưa có ai trên bảng xếp hạng. Hãy ôn tập hoặc làm bài kiểm tra để là người đầu tiên!
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {top.map((entry) => (
            <Row key={`${entry.rank}-${entry.name}-${entry.points}-${entry.streak}`} entry={entry} highlight={entry.is_me} />
          ))}

          {!meInTop && me.rank && (
            <>
              <p className="py-1 text-center text-text-faint">⋯</p>
              <Row entry={me} highlight />
            </>
          )}
        </div>
      )}

      {!me.rank && (
        <p className="mt-6 rounded-xl border border-border/70 bg-surface p-4 text-center text-sm text-text-muted">
          Bạn chưa có điểm. Ôn tập từ vựng hoặc làm bài kiểm tra để lên bảng xếp hạng.
        </p>
      )}
    </div>
  );
}