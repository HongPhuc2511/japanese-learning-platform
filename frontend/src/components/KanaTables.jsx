import { Fragment, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { speakJapanese } from '../utils/speak';
import {
  COLS_5, COLS_3, BASIC_ROWS, DAKUON_ROWS, YOON_ROWS,
  CHOON_RULES, CHOON_KATAKANA, CHOON_PAIRS, SOKUON_EXAMPLES, SOKUON_PAIRS,
} from '../data/kana';

const SERIF = { fontFamily: "'Noto Serif JP', serif" };

const TABS = [
  { key: 'hiragana', label: 'Hiragana', jp: 'ひらがな' },
  { key: 'katakana', label: 'Katakana', jp: 'カタカナ' },
  { key: 'yoon', label: 'Âm ghép', jp: '拗音' },
  { key: 'choon', label: 'Trường âm', jp: '長音' },
  { key: 'sokuon', label: 'Âm ngắt', jp: '促音' },
];

function Section({ title, jp, note, children }) {
  return (
    <section>
      <div className="flex items-baseline gap-2 mb-2">
        <h3 className="font-bold text-text text-base">{title}</h3>
        {jp && (
          <span className="text-xs text-accent" style={SERIF}>
            {jp}
          </span>
        )}
      </div>
      {note && <p className="text-xs text-text-muted leading-relaxed mb-3">{note}</p>}
      {children}
    </section>
  );
}

function KanaCell({ cell, script }) {
  if (!cell) return <div />;
  const [hira, kata, romaji] = cell;
  const kana = script === 'katakana' ? kata : hira;
  return (
    <button
      onClick={() => speakJapanese(kana)}
      title="Bấm để nghe"
      className="group rounded-xl border border-border/70 bg-surface py-2 text-center transition hover:border-accent hover:bg-accent-soft/40 cursor-pointer"
    >
      <span className="block text-2xl font-bold text-text transition group-hover:text-accent" style={SERIF}>
        {kana}
      </span>
      <span className="block text-[11px] text-text-muted mt-0.5">{romaji}</span>
    </button>
  );
}

// Bảng âm ghép hiện cả hiragana và katakana trong cùng một ô
function YoonCell({ cell }) {
  if (!cell) return <div />;
  const [hira, kata, romaji] = cell;
  return (
    <button
      onClick={() => speakJapanese(hira)}
      title="Bấm để nghe"
      className="group rounded-xl border border-border/70 bg-surface py-2 text-center transition hover:border-accent hover:bg-accent-soft/40 cursor-pointer"
    >
      <span className="block text-xl font-bold text-text transition group-hover:text-accent" style={SERIF}>
        {hira}
      </span>
      <span className="block text-sm text-text-muted" style={SERIF}>
        {kata}
      </span>
      <span className="block text-[11px] text-text-faint mt-0.5">{romaji}</span>
    </button>
  );
}

function KanaGrid({ rows, columns, header, script, variant }) {
  const template =
    columns === 5
      ? 'grid-cols-[2.5rem_repeat(5,minmax(0,1fr))]'
      : 'grid-cols-[2.5rem_repeat(3,minmax(0,1fr))]';

  return (
    <div className="overflow-x-auto">
      <div className={`grid ${template} gap-1.5 sm:gap-2 min-w-[19rem]`}>
        <div />
        {header.map((h) => (
          <div key={h} className="text-center text-xs font-semibold uppercase text-text-faint">
            {h}
          </div>
        ))}
        {rows.map((row, r) => (
          <Fragment key={r}>
            <div className="flex items-center justify-center text-xs font-semibold text-accent">
              {row.label}
            </div>
            {row.cells.map((cell, c) =>
              variant === 'yoon' ? (
                <YoonCell key={c} cell={cell} />
              ) : (
                <KanaCell key={c} cell={cell} script={script} />
              )
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

function WordChip({ jp, romaji, vi, fill }) {
  return (
    <button
      onClick={() => speakJapanese(jp)}
      title="Bấm để nghe"
      className={`rounded-xl border border-border/70 bg-surface px-3 py-2 text-left transition hover:border-accent cursor-pointer ${
        fill ? 'w-full' : ''
      }`}
    >
      <span className="block text-lg font-bold text-text" style={SERIF}>
        {jp}
      </span>
      <span className="block text-xs text-text-muted">
        {romaji} · {vi}
      </span>
    </button>
  );
}

function PairList({ pairs }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {pairs.map(([a, b]) => (
        <div key={a.jp} className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <WordChip {...a} fill />
          </div>
          <span className="text-text-faint">≠</span>
          <div className="flex-1 min-w-0">
            <WordChip {...b} fill />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function KanaTables({ collapsible = false, defaultOpen = true }) {
  const [open, setOpen] = useState(collapsible ? defaultOpen : true);
  const [tab, setTab] = useState('hiragana');

  return (
    <div className="jp-card p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-bold text-sm text-accent" style={SERIF}>
            かな表 • KANA
          </p>
          <h2 className="font-display font-bold text-xl text-text">
            Bảng chữ cái và quy tắc phát âm
          </h2>
        </div>

        {collapsible && (
          <button
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-text-muted transition hover:border-accent hover:text-accent cursor-pointer"
          >
            {open ? 'Thu gọn' : 'Xem bảng'}
            <ChevronDown className={`w-4 h-4 transition ${open ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {open && (
        <>
          <div role="tablist" className="flex flex-wrap gap-2 mt-4 mb-5">
            {TABS.map((t) => (
              <button
                key={t.key}
                role="tab"
                aria-selected={tab === t.key}
                onClick={() => setTab(t.key)}
                className={`rounded-full border px-3 py-1.5 text-sm transition cursor-pointer ${
                  tab === t.key
                    ? 'border-accent bg-accent text-white'
                    : 'border-border bg-surface text-text-muted hover:border-accent'
                }`}
              >
                {t.label} <span className="text-xs opacity-80">{t.jp}</span>
              </button>
            ))}
          </div>

          <p className="text-xs text-text-faint mb-4">Bấm vào chữ hoặc từ để nghe phát âm.</p>

          {(tab === 'hiragana' || tab === 'katakana') && (
            <div className="space-y-6">
              <Section
                title="Âm cơ bản"
                jp="清音"
                note={
                  tab === 'hiragana'
                    ? 'Hiragana dùng cho từ thuần Nhật và ngữ pháp. Lưu ý: は, へ, を khi làm trợ từ đọc là “wa”, “e”, “o”.'
                    : 'Katakana thường dùng cho từ mượn nước ngoài, tên riêng và từ tượng thanh.'
                }
              >
                <KanaGrid rows={BASIC_ROWS} columns={5} header={COLS_5} script={tab} />
              </Section>

              <Section
                title="Âm đục và bán đục"
                jp="濁音・半濁音"
                note="Thêm dấu ゛ (đục) hoặc ゜ (bán đục) vào chữ gốc. ぢ và づ đọc giống じ và ず, rất ít dùng."
              >
                <KanaGrid rows={DAKUON_ROWS} columns={5} header={COLS_5} script={tab} />
              </Section>
            </div>
          )}

          {tab === 'yoon' && (
            <Section
              title="Âm ghép"
              jp="拗音"
              note="Chữ ở cột い (き, し, ち, に, ひ, み, り, ぎ, じ, び, ぴ) ghép với ゃ, ゅ, ょ viết nhỏ thì đọc liền thành một âm, chỉ chiếm một nhịp. Ví dụ: きや (ki-ya, 2 nhịp) khác きゃ (kya, 1 nhịp). Mỗi ô hiện hiragana, katakana và romaji."
            >
              <KanaGrid rows={YOON_ROWS} columns={3} header={COLS_3} variant="yoon" />
            </Section>
          )}

          {tab === 'choon' && (
            <div className="space-y-6">
              <Section
                title="Trường âm"
                jp="長音"
                note="Trường âm là nguyên âm được kéo dài gấp đôi (2 nhịp). Đọc ngắn hay dài sẽ đổi nghĩa của từ."
              >
                <div className="space-y-2">
                  {CHOON_RULES.map((r) => (
                    <div
                      key={r.long}
                      className="flex items-start gap-3 rounded-xl border border-border/70 bg-surface-subtle p-3"
                    >
                      <div className="w-10 shrink-0 text-center text-xl font-bold text-accent">
                        {r.long}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-text-muted">{r.how}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {r.examples.map((e) => (
                            <WordChip key={e.jp} {...e} />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>

              <Section
                title="Trong katakana dùng dấu ー"
                jp="長音符"
                note="Katakana không thêm chữ mà dùng dấu gạch ngang ー để kéo dài nguyên âm."
              >
                <div className="flex flex-wrap gap-2">
                  {CHOON_KATAKANA.map((w) => (
                    <WordChip key={w.jp} {...w} />
                  ))}
                </div>
              </Section>

              <Section title="Dài hay ngắn khác nghĩa" note="Cặp từ chỉ khác nhau ở độ dài nguyên âm:">
                <PairList pairs={CHOON_PAIRS} />
              </Section>
            </div>
          )}

          {tab === 'sokuon' && (
            <div className="space-y-6">
              <Section
                title="Âm ngắt"
                jp="促音"
                note="Chữ っ (ッ trong katakana) viết nhỏ, không có âm riêng. Nó tạo một nhịp ngắt ngắn ngay trước phụ âm đứng sau, nên romaji gấp đôi phụ âm: kk, ss, tt, pp (ví dụ ざっし = zasshi). Thường gặp trước k, s, t, p; từ mượn katakana còn gặp trước d, b, g (ベッド)."
              >
                <div className="flex flex-wrap gap-2">
                  {SOKUON_EXAMPLES.map((w) => (
                    <WordChip key={w.jp} {...w} />
                  ))}
                </div>
              </Section>

              <Section title="Có っ hay không khác nghĩa" note="Cặp từ chỉ khác nhau ở âm ngắt:">
                <PairList pairs={SOKUON_PAIRS} />
              </Section>
            </div>
          )}
        </>
      )}
    </div>
  );
}