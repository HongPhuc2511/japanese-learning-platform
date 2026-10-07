import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi, endpoints } from '../api/api';

const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];

export default function Profile() {
  const { user, setUser } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [level, setLevel] = useState(user?.level || 'N5');
  const [infoMsg, setInfoMsg] = useState('');
  const [infoError, setInfoError] = useState('');
  const [savingInfo, setSavingInfo] = useState(false);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [pwError, setPwError] = useState('');
  const [savingPw, setSavingPw] = useState(false);

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    setInfoMsg('');
    setInfoError('');
    setSavingInfo(true);
    try {
      const res = await authApi.patch(endpoints['current-user'], { email, level });
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      setInfoMsg('Đã cập nhật thông tin');
    } catch (err) {
      setInfoError('Cập nhật thất bại');
    } finally {
      setSavingInfo(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwMsg('');
    setPwError('');
    setSavingPw(true);
    try {
      await authApi.post('/api/auth/change-password/', {
        old_password: oldPassword,
        new_password: newPassword,
      });
      setPwMsg('Đổi mật khẩu thành công');
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      const detail = err.response?.data?.old_password?.[0]
        || err.response?.data?.new_password?.[0]
        || 'Đổi mật khẩu thất bại';
      setPwError(detail);
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 px-4 space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold mb-6">Thông tin cá nhân</h1>
        <form onSubmit={handleUpdateInfo} className="bg-surface border border-border rounded-card p-6">
          <div className="mb-4">
            <label className="block text-xs text-text-muted mb-1">Tên đăng nhập</label>
            <input
              type="text"
              value={user?.username || ''}
              disabled
              className="w-full border border-border rounded-button px-3 py-2 text-sm bg-bg text-text-faint"
            />
          </div>

          <div className="mb-4">
            <label className="block text-xs text-text-muted mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-border rounded-button px-3 py-2 text-sm focus:outline-none focus:border-accent"
            />
          </div>

          <div className="mb-4">
            <label className="block text-xs text-text-muted mb-1">Trình độ</label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full border border-border rounded-button px-3 py-2 text-sm focus:outline-none focus:border-accent"
            >
              {LEVELS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          {infoMsg && <p className="text-sm text-accent mb-3">{infoMsg}</p>}
          {infoError && <p className="text-sm text-accent mb-3">{infoError}</p>}

          <button
            type="submit"
            disabled={savingInfo}
            className="w-full bg-accent text-white py-2 rounded-button hover:bg-accent-hover transition disabled:opacity-50"
          >
            {savingInfo ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </form>
      </div>

      <div>
        <h2 className="font-display text-xl font-bold mb-4">Đổi mật khẩu</h2>
        <form onSubmit={handleChangePassword} className="bg-surface border border-border rounded-card p-6">
          <div className="mb-4">
            <label className="block text-xs text-text-muted mb-1">Mật khẩu hiện tại</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full border border-border rounded-button px-3 py-2 text-sm focus:outline-none focus:border-accent"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-xs text-text-muted mb-1">Mật khẩu mới</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-border rounded-button px-3 py-2 text-sm focus:outline-none focus:border-accent"
              required
            />
          </div>

          {pwMsg && <p className="text-sm text-accent mb-3">{pwMsg}</p>}
          {pwError && <p className="text-sm text-accent mb-3">{pwError}</p>}

          <button
            type="submit"
            disabled={savingPw}
            className="w-full bg-accent text-white py-2 rounded-button hover:bg-accent-hover transition disabled:opacity-50"
          >
            {savingPw ? 'Đang đổi...' : 'Đổi mật khẩu'}
          </button>
        </form>
      </div>
    </div>
  );
}