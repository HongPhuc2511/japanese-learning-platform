import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
      setError('Đăng ký thất bại — kiểm tra lại thông tin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <form
        onSubmit={handleSubmit}
        className="bg-surface border border-border rounded-card p-8 w-full max-w-sm"
      >
        <h2 className="font-display text-xl font-bold mb-6 text-center text-text">
          Đăng ký
        </h2>

        {error && (
          <p className="text-accent text-sm mb-4 text-center">{error}</p>
        )}

        <div className="mb-4">
          <label className="block text-xs text-text-muted mb-1">
            Tên đăng nhập
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border border-border rounded-button px-3 py-2 text-sm focus:outline-none focus:border-accent"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-xs text-text-muted mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-border rounded-button px-3 py-2 text-sm focus:outline-none focus:border-accent"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-xs text-text-muted mb-1">
            Mật khẩu
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-border rounded-button px-3 py-2 text-sm focus:outline-none focus:border-accent"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent text-white py-2 rounded-button hover:bg-accent-hover transition disabled:opacity-50"
        >
          {loading ? 'Đang đăng ký...' : 'Đăng ký'}
        </button>

        <p className="text-sm text-center text-text-muted mt-4">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-accent hover:underline">
            Đăng nhập
          </Link>
        </p>
      </form>
    </div>
  );
}