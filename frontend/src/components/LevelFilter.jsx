import React from 'react';

const OPTIONS = [
  { value: 'all', label: 'Tất cả', kanji: '全級' },
  { value: 'N5', label: 'N5', kanji: '初級' },
  { value: 'N4', label: 'N4', kanji: '基礎' },
  { value: 'N3', label: 'N3', kanji: '中級' },
  { value: 'N2', label: 'N2', kanji: '上級' },
  { value: 'N1', label: 'N1', kanji: '極' },
];

export default function LevelFilter({ value, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      <span className="text-xs font-semibold text-text-muted flex items-center gap-1.5 mr-1">
        <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
        Cấp độ JLPT:
      </span>
      {OPTIONS.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`group relative inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-full transition-all duration-200 border cursor-pointer ${
              isActive
                ? 'bg-accent text-white border-accent shadow-sm shadow-accent/20 scale-[1.02]'
                : 'bg-surface text-text-muted border-border hover:border-accent/60 hover:text-text hover:bg-surface-subtle'
            }`}
          >
            <span>{opt.label}</span>
            <span
              className={`text-[10px] font-serif px-1 py-0.2 rounded ${
                isActive
                  ? 'bg-white/20 text-white'
                  : 'bg-accent-soft/60 text-accent group-hover:bg-accent-soft'
              }`}
              style={{ fontFamily: "'Noto Serif JP', serif" }}
            >
              {opt.kanji}
            </span>
          </button>
        );
      })}
    </div>
  );
}