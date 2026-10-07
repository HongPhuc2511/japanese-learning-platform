import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authApi, endpoints } from "../api/api";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dueCount, setDueCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchDueCount = async () => {
      try {
        const res = await authApi.get(`${endpoints["flashcards"]}due/`);
        setDueCount(res.data.length);
      } catch (err) {
        console.error("Không đếm được thẻ cần ôn", err);
      }
    };
    fetchDueCount();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="bg-surface border-b border-border">
      <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link to="/" className="font-display font-bold text-lg text-accent">
          日本語 Learning
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          <Link
            to="/courses"
            className="text-text-muted hover:text-text transition"
          >
            Khoá học
          </Link>
          <Link
            to="/vocabulary"
            className="text-text-muted hover:text-text transition"
          >
            Từ vựng
          </Link>
          <Link
            to="/kanji"
            className="text-text-muted hover:text-text transition"
          >
            Kanji
          </Link>
          <Link
            to="/grammar"
            className="text-text-muted hover:text-text transition"
          >
            Ngữ pháp
          </Link>
          <Link
            to="/quizzes"
            className="text-text-muted hover:text-text transition"
          >
            Kiểm tra
          </Link>
          <Link
            to="/flashcards"
            className="relative text-text-muted hover:text-text transition"
          >
            Ôn tập
            {dueCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-accent text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {dueCount > 9 ? "9+" : dueCount}
              </span>
            )}
          </Link>

          {user ? (
            <>
              <Link
                to="/profile"
                className="text-text-faint text-xs hover:text-text transition"
              >
                {user.username}
              </Link>
              <button
                onClick={handleLogout}
                className="text-accent hover:text-accent-hover transition"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-text-muted hover:text-text transition"
              >
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
