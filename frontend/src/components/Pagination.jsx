import { ChevronLeft, ChevronRight } from 'lucide-react';

function getPages(page, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(total - 1, page + 1);
  if (start > 2) pages.push('gap-start');
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < total - 1) pages.push('gap-end');
  pages.push(total);
  return pages;
}

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const base =
    'min-w-9 h-9 px-2 inline-flex items-center justify-center rounded-full border text-sm transition cursor-pointer';
  const idle = 'border-border bg-surface text-text-muted hover:border-accent hover:text-accent';
  const disabled =
    'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:text-text-muted';

  return (
    <nav className="flex flex-wrap items-center justify-center gap-1.5 mt-8" aria-label="Phân trang">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        aria-label="Trang trước"
        className={`${base} ${idle} ${disabled}`}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {getPages(page, totalPages).map((p) =>
        typeof p === 'string' ? (
          <span key={p} className="px-1 text-text-faint">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={`${base} ${
              p === page ? 'bg-accent border-accent text-white font-semibold' : idle
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Trang sau"
        className={`${base} ${idle} ${disabled}`}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
}