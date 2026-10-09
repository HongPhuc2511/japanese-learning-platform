const OPTIONS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'N5', label: 'N5' },
  { value: 'N4', label: 'N4' },
  { value: 'N3', label: 'N3' },
  { value: 'N2', label: 'N2' },
  { value: 'N1', label: 'N1' },
];

export default function LevelFilter({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`text-sm px-3 py-1.5 rounded-full border transition ${
            value === opt.value
              ? 'bg-accent text-white border-accent'
              : 'bg-surface text-text-muted border-border hover:border-accent'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}