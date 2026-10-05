import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-surface border-b border-border">
      <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link to="/" className="font-display font-bold text-lg text-accent">
          日本語 Learning
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          <Link to="/courses" className="text-text-muted hover:text-text transition">
            Khoá học
          </Link>
          <Link to="/vocabulary" className="text-text-muted hover:text-text transition">
            Từ vựng
          </Link>
          <Link to="/kanji" className="text-text-muted hover:text-text transition">
            Kanji
          </Link>
          <Link to="/grammar" className="text-text-muted hover:text-text transition">
            Ngữ pháp
          </Link>
          <Link to="/quizzes" className="text-text-muted hover:text-text transition">
            Kiểm tra
          </Link>

          {user ? (
            <>
              <span className="text-text-faint text-xs">{user.username}</span>
              <button
                onClick={handleLogout}
                className="text-accent hover:text-accent-hover transition"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-text-muted hover:text-text transition">
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="bg-accent text-white px-3 py-1.5 rounded-button hover:bg-accent-hover transition"
              >
                Đăng ký
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}