import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-border mt-auto">
      <div className="max-w-5xl mx-auto px-6 py-10 grid gap-8 sm:grid-cols-3">
        <div>
          <Link to="/" className="font-display font-bold text-lg text-accent">
            日本語 Learning
          </Link>
          <p className="text-sm text-text-muted mt-3 leading-relaxed">
            Học từ vựng, Kanji, ngữ pháp và ôn tập thông minh để chinh phục JLPT.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-3">Học tập</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/courses" className="text-text-muted hover:text-text transition">
                Khoá học
              </Link>
            </li>
            <li>
              <Link to="/vocabulary" className="text-text-muted hover:text-text transition">
                Từ vựng
              </Link>
            </li>
            <li>
              <Link to="/kanji" className="text-text-muted hover:text-text transition">
                Kanji
              </Link>
            </li>
            <li>
              <Link to="/grammar" className="text-text-muted hover:text-text transition">
                Ngữ pháp
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-3">Luyện tập</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/quizzes" className="text-text-muted hover:text-text transition">
                Kiểm tra
              </Link>
            </li>
            <li>
              <Link to="/flashcards" className="text-text-muted hover:text-text transition">
                Ôn tập
              </Link>
            </li>
            <li>
              <Link to="/saved" className="text-text-muted hover:text-text transition">
                Đã lưu
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="max-w-5xl mx-auto px-6 py-4 text-xs text-text-faint text-center">
          © {new Date().getFullYear()} 日本語 Learning. Đồ án học tập.
        </div>
      </div>
    </footer>
  );
}