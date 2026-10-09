import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi, endpoints } from '../api/api';
import { ToriiIcon, DarumaIcon } from './JapaneseIcons';
import { Menu, X, User as UserIcon, LogOut } from 'lucide-react';

export default function Header() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dueCount, setDueCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      setDueCount(0);
      return;
    }

    refreshUser();

    const fetchDueCount = async () => {
      try {
        const res = await authApi.get(`${endpoints['flashcards']}due/`);
        setDueCount(res.data.length);
      } catch (err) {
        console.error('Không đếm được thẻ cần ôn', err);
      }
    };
    fetchDueCount();
  }, [user?.id, location.pathname]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/courses', label: 'Khoá học', kanji: '講座' },
    { to: '/vocabulary', label: 'Từ vựng', kanji: '語彙' },
    { to: '/kanji', label: 'Kanji', kanji: '漢字' },
    { to: '/grammar', label: 'Ngữ pháp', kanji: '文法' },
    { to: '/quizzes', label: 'Kiểm tra', kanji: '演習' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-border shadow-xs">
      {/* Decorative thin top line (Japanese vermilion Torii accent) */}
      <div className="h-[3px] bg-gradient-to-r from-accent via-accent-hover to-accent" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-full bg-accent-soft flex items-center justify-center text-accent group-hover:scale-105 transition-transform border border-accent/20">
            <ToriiIcon className="w-5 h-5 text-accent" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-display font-bold text-lg text-text tracking-tight group-hover:text-accent transition">
                Hikari
              </span>
              <span
                className="font-serif font-bold text-accent text-base"
                style={{ fontFamily: "'Noto Serif JP', serif" }}
              >
                日本語
              </span>
            </div>
            <span className="text-[10px] text-text-muted tracking-wider uppercase font-medium">
              JLPT Học tập & Ôn luyện
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navLinks.map((item) => {
            const isActive = location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'text-accent bg-accent-soft font-semibold shadow-xs'
                    : 'text-text-muted hover:text-text hover:bg-surface-subtle'
                }`}
              >
                <span>{item.label}</span>
                <span
                  className="text-[10px] font-serif text-text-faint"
                  style={{ fontFamily: "'Noto Serif JP', serif" }}
                >
                  {item.kanji}
                </span>
              </Link>
            );
          })}

          {user && (
            <>
              <Link
                to="/flashcards"
                className={`relative px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                  location.pathname === '/flashcards'
                    ? 'text-accent bg-accent-soft font-semibold shadow-xs'
                    : 'text-text-muted hover:text-text hover:bg-surface-subtle'
                }`}
              >
                <span>Ôn tập SRS</span>
                <span
                  className="text-[10px] font-serif text-text-faint"
                  style={{ fontFamily: "'Noto Serif JP', serif" }}
                >
                  復習
                </span>
                {dueCount > 0 && (
                  <span className="bg-accent text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full leading-tight animate-pulse">
                    {dueCount > 9 ? '9+' : dueCount}
                  </span>
                )}
              </Link>

              <Link
                to="/saved"
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                  location.pathname === '/saved'
                    ? 'text-accent bg-accent-soft font-semibold shadow-xs'
                    : 'text-text-muted hover:text-text hover:bg-surface-subtle'
                }`}
              >
                <span>Đã lưu</span>
                <span
                  className="text-[10px] font-serif text-text-faint"
                  style={{ fontFamily: "'Noto Serif JP', serif" }}
                >
                  保存
                </span>
              </Link>
            </>
          )}
        </nav>

        {/* User Actions */}
        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2.5">
              {/* Streak badge */}
              <div
                className="flex items-center gap-1.5 bg-accent-soft/70 border border-accent/20 px-2.5 py-1 rounded-full text-xs text-accent font-medium"
                title={`Chuỗi ${user.streak_count} ngày liên tiếp · ${user.points} điểm tích luỹ`}
              >
                <DarumaIcon className="w-3.5 h-3.5" />
                <span>{user.streak_count} ngày</span>
                <span className="text-text-faint">•</span>
                <span className="font-semibold">{user.points}pt</span>
              </div>

              {/* Profile Pill */}
              <Link
                to="/profile"
                className="flex items-center gap-1.5 text-xs text-text bg-surface-subtle border border-border hover:border-accent/50 px-3 py-1 rounded-full transition"
              >
                <div className="w-5 h-5 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center font-serif">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium max-w-[100px] truncate">{user.username}</span>
              </Link>

              <button
                onClick={handleLogout}
                className="text-text-muted hover:text-accent p-1.5 rounded-full hover:bg-surface-subtle transition"
                title="Đăng xuất"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-xs font-medium text-text-muted hover:text-text px-3 py-1.5 transition"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="bg-accent text-white text-xs font-semibold px-4 py-1.5 rounded-full hover:bg-accent-hover transition shadow-xs shadow-accent/20"
              >
                Đăng ký miễn phí
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-text-muted hover:text-text rounded-lg hover:bg-surface-subtle transition"
          aria-label="Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-surface px-4 py-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="grid grid-cols-2 gap-2 text-sm">
            {navLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center justify-between p-2.5 rounded-xl border border-border hover:border-accent hover:bg-accent-soft/30 transition text-xs font-medium"
              >
                <span>{item.label}</span>
                <span
                  className="text-[10px] text-accent font-serif"
                  style={{ fontFamily: "'Noto Serif JP', serif" }}
                >
                  {item.kanji}
                </span>
              </Link>
            ))}
          </div>

          {user && (
            <div className="pt-2 border-t border-border/60 space-y-2">
              <div className="flex items-center justify-between bg-accent-soft/40 p-2.5 rounded-xl text-xs">
                <span className="text-text-muted">Tiến độ hôm nay:</span>
                <span className="font-semibold text-accent">🔥 {user.streak_count} ngày · {user.points} pt</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <Link
                  to="/flashcards"
                  className="flex items-center justify-between p-2.5 rounded-xl border border-border hover:border-accent"
                >
                  <span>Ôn tập SRS</span>
                  {dueCount > 0 && (
                    <span className="bg-accent text-white text-[10px] px-1.5 py-0.5 rounded-full">
                      {dueCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/saved"
                  className="flex items-center justify-between p-2.5 rounded-xl border border-border hover:border-accent"
                >
                  <span>Đã lưu (★)</span>
                </Link>
              </div>
              <div className="flex items-center justify-between pt-2">
                <Link to="/profile" className="text-xs font-medium text-text flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-accent" />
                  {user.username}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-xs text-accent hover:underline"
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          )}

          {!user && (
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/login"
                className="w-full text-center py-2 text-xs font-medium border border-border rounded-full hover:bg-surface-subtle"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="w-full text-center py-2 text-xs font-semibold bg-accent text-white rounded-full hover:bg-accent-hover"
              >
                Đăng ký miễn phí
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}