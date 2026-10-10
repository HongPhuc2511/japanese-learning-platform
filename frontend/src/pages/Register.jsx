import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ToriiIcon } from '../components/JapaneseIcons';
import { Lock, User, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import GoogleSignInButton from '../components/GoogleSignInButton';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(username, email, password);
      navigate('/');
    } catch (err) {
      setError('Đăng ký thất bại — vui lòng kiểm tra lại thông tin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative">
      <div className="w-full max-w-md jp-card p-8 sm:p-10 shadow-sm relative overflow-hidden">
        {/* Top Torii Badge */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-accent-soft text-accent flex items-center justify-center mx-auto mb-3 border border-accent/20">
            <ToriiIcon className="w-6 h-6" />
          </div>
          <span
            className="text-xs font-serif text-accent font-bold"
            style={{ fontFamily: "'Noto Serif JP', serif" }}
          >
            新規登録 • TẠO TÀI KHOẢN MỚI
          </span>
          <h1 className="font-display font-extrabold text-2xl text-text mt-1">
            Gia nhập Hikari
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Bắt đầu hành trình chinh phục tiếng Nhật hoàn toàn miễn phí
          </p>
        </div>

        {error && (
          <div className="mb-5 flex items-center gap-2 bg-accent-soft border border-accent/20 text-accent text-xs p-3 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1.5">
              Tên đăng nhập
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-faint" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Chọn tên tài khoản..."
                className="w-full border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm bg-surface focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1.5">
              Địa chỉ Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-faint" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email của bạn..."
                className="w-full border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm bg-surface focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1.5">
              Mật khẩu
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-faint" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tạo mật khẩu an toàn..."
                className="w-full border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm bg-surface focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-accent text-white py-3 rounded-full text-xs font-semibold hover:bg-accent-hover transition shadow-sm shadow-accent/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Đang xử lý đăng ký...</span>
            ) : (
              <>
                <span>Đăng ký tài khoản</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
        <GoogleSignInButton />
        <p className="text-xs text-center text-text-muted mt-6 pt-6 border-t border-border/80">
          Đã có tài khoản học viên?{' '}
          <Link to="/login" className="text-accent font-semibold hover:underline">
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
