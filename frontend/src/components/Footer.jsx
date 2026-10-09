import { Link } from 'react-router-dom';
import { ToriiIcon, SakuraIcon, FujiIcon } from './JapaneseIcons';

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-border mt-auto relative overflow-hidden">
      {/* Decorative top wave/seigaiha strip */}
      <div className="h-1 bg-gradient-to-r from-accent/20 via-accent to-matcha/30" />

      {/* Background Japanese Watermark */}
      <div
        aria-hidden="true"
        className="absolute right-4 bottom-2 text-border-hover/20 font-serif select-none pointer-events-none text-9xl font-black leading-none opacity-40 hidden md:block"
        style={{ fontFamily: "'Noto Serif JP', serif" }}
      >
        日本語
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 grid gap-10 sm:grid-cols-2 md:grid-cols-4 relative z-10">
        {/* Col 1: Brand & Motto */}
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-accent-soft flex items-center justify-center text-accent">
              <ToriiIcon className="w-4 h-4" />
            </div>
            <span className="font-display font-bold text-lg text-text">Hikari 日本語</span>
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            Hệ thống học tiếng Nhật toàn diện: Từ vựng, Kanji, Ngữ pháp, Luyện thi JLPT và thuật toán ghi nhớ ngắt quãng SRS.
          </p>
          <div className="p-3 rounded-xl bg-surface-subtle border border-border">
            <p
              className="text-xs font-serif text-accent font-semibold flex items-center gap-1.5"
              style={{ fontFamily: "'Noto Serif JP', serif" }}
            >
              <SakuraIcon className="w-3.5 h-3.5 text-accent" />
              千里の行も一歩から
            </p>
            <p className="text-[11px] text-text-muted mt-1">
              "Hành trình ngàn dặm bắt đầu từ một bước chân."
            </p>
          </div>
        </div>

        {/* Col 2: Học tập */}
        <div>
          <h3 className="text-xs font-bold text-text uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
            Học tập • 学習
          </h3>
          <ul className="space-y-2.5 text-xs">
            <li>
              <Link to="/courses" className="text-text-muted hover:text-accent transition flex items-center gap-1.5">
                <span>Khoá học JLPT</span>
                <span className="text-[10px] text-text-faint font-serif">講座</span>
              </Link>
            </li>
            <li>
              <Link to="/vocabulary" className="text-text-muted hover:text-accent transition flex items-center gap-1.5">
                <span>Kho Từ vựng</span>
                <span className="text-[10px] text-text-faint font-serif">語彙</span>
              </Link>
            </li>
            <li>
              <Link to="/kanji" className="text-text-muted hover:text-accent transition flex items-center gap-1.5">
                <span>Hán tự Kanji</span>
                <span className="text-[10px] text-text-faint font-serif">漢字</span>
              </Link>
            </li>
            <li>
              <Link to="/grammar" className="text-text-muted hover:text-accent transition flex items-center gap-1.5">
                <span>Hệ thống Ngữ pháp</span>
                <span className="text-[10px] text-text-faint font-serif">文法</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Luyện tập & Ôn tập */}
        <div>
          <h3 className="text-xs font-bold text-text uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-matcha"></span>
            Luyện tập • 練習
          </h3>
          <ul className="space-y-2.5 text-xs">
            <li>
              <Link to="/flashcards" className="text-text-muted hover:text-accent transition flex items-center gap-1.5">
                <span>Thẻ ghi nhớ SRS</span>
                <span className="text-[10px] text-text-faint font-serif">単語帳</span>
              </Link>
            </li>
            <li>
              <Link to="/quizzes" className="text-text-muted hover:text-accent transition flex items-center gap-1.5">
                <span>Bài kiểm tra trắc nghiệm</span>
                <span className="text-[10px] text-text-faint font-serif">模擬試験</span>
              </Link>
            </li>
            <li>
              <Link to="/saved" className="text-text-muted hover:text-accent transition flex items-center gap-1.5">
                <span>Mục đã đánh dấu</span>
                <span className="text-[10px] text-text-faint font-serif">お気に入り</span>
              </Link>
            </li>
            <li>
              <Link to="/profile" className="text-text-muted hover:text-accent transition flex items-center gap-1.5">
                <span>Hồ sơ & Điểm tích luỹ</span>
                <span className="text-[10px] text-text-faint font-serif">マイページ</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 4: Cấp độ JLPT */}
        <div>
          <h3 className="text-xs font-bold text-text uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-gold"></span>
            Cấp độ JLPT • レベル
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-surface-subtle border border-border">
              <span className="font-bold text-accent">N5</span>
              <span className="text-[10px] text-text-muted block">Nhập môn (初級)</span>
            </div>
            <div className="p-2 rounded-lg bg-surface-subtle border border-border">
              <span className="font-bold text-accent">N4</span>
              <span className="text-[10px] text-text-muted block">Cơ bản (基礎)</span>
            </div>
            <div className="p-2 rounded-lg bg-surface-subtle border border-border">
              <span className="font-bold text-accent">N3</span>
              <span className="text-[10px] text-text-muted block">Trung cấp (中級)</span>
            </div>
            <div className="p-2 rounded-lg bg-surface-subtle border border-border">
              <span className="font-bold text-accent">N2 • N1</span>
              <span className="text-[10px] text-text-muted block">Nâng cao (上級)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom copyright */}
      <div className="border-t border-border/80 bg-surface-subtle/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-text-faint">
          <p>© {new Date().getFullYear()} Hikari 日本語 Learning Platform. Trau dồi tiếng Nhật mỗi ngày.</p>
          <div className="flex items-center gap-3">
            <span className="font-serif text-[11px]" style={{ fontFamily: "'Noto Serif JP', serif" }}>
              和の心をもって学ぶ
            </span>
            <span>•</span>
            <span>Made with 🌸</span>
          </div>
        </div>
      </div>
    </footer>
  );
}