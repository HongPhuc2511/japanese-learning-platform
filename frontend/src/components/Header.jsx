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
    <header className="bg-white border-b shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-blue-600">
          日本語 Learning
        </Link>

        <nav className="flex items-center gap-4">
          <Link to="/courses" className="text-gray-700 hover:text-blue-600">
            Khoá học
          </Link>

          {user ? (
            <>
              <span className="text-gray-500 text-sm">
                Xin chào, {user.username}
              </span>
              <button
                onClick={handleLogout}
                className="text-red-500 hover:underline text-sm"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-700 hover:text-blue-600">
                Đăng nhập
              </Link>
              <Link to="/register" className="text-gray-700 hover:text-blue-600">
                Đăng ký
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}