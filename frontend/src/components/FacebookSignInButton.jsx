import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loadFacebookSdk } from '../utils/facebookSdk';

const APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID;

export default function FacebookSignInButton() {
  const { loginWithFacebook } = useAuth();
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!APP_ID) return;
    loadFacebookSdk(APP_ID)
      .then(() => setReady(true))
      .catch(() => setError('Không tải được Facebook (có thể bị trình chặn quảng cáo chặn)'));
  }, []);

  // Chưa cấu hình App ID thì ẩn nút, tránh hiện một nút hỏng
  if (!APP_ID) return null;

  // FB.login phải được gọi trực tiếp trong lúc bấm, nếu để sau một bước chờ
  // thì trình duyệt có thể chặn cửa sổ đăng nhập như popup quảng cáo
  const handleClick = () => {
    setError('');
    window.FB.login(
      (response) => {
        if (!response.authResponse) {
          setError('Bạn đã huỷ đăng nhập Facebook');
          return;
        }
        setBusy(true);
        loginWithFacebook(response.authResponse.accessToken)
          .then(() => navigate('/'))
          .catch((err) =>
            setError(err.response?.data?.error || 'Đăng nhập Facebook thất bại, bạn thử lại nhé.')
          )
          .finally(() => setBusy(false));
      },
      { scope: 'public_profile,email' }
    );
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={!ready || busy}
        className="w-60 h-10 flex items-center justify-center gap-2 rounded-button border border-border bg-surface text-sm text-text hover:bg-bg transition disabled:opacity-50 cursor-pointer"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#1877F2" aria-hidden="true">
          <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.99 3.66 9.13 8.44 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99C18.34 21.13 22 16.99 22 12z" />
        </svg>
        {busy ? 'Đang đăng nhập...' : 'Tiếp tục với Facebook'}
      </button>
      {error && <p className="text-accent text-sm text-center">{error}</p>}
    </div>
  );
}