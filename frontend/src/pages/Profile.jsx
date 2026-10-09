import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi, endpoints } from '../api/api';
import { DarumaIcon } from '../components/JapaneseIcons';
import { Award, CheckCircle2, AlertCircle } from 'lucide-react';

const LEVELS = [
  { value: 'N5', label: 'N5', kanji: '初級' },
  { value: 'N4', label: 'N4', kanji: '基礎' },
  { value: 'N3', label: 'N3', kanji: '中級' },
  { value: 'N2', label: 'N2', kanji: '上級' },
  { value: 'N1', label: 'N1', kanji: '極' },
];

export default function Profile() {
  const { user, setUser, refreshUser } = useAuth();
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
  
  useEffect(() => {
    refreshUser();
  }, []);

  useEffect(() => {
    setEmail(user?.email || '');
    setLevel(user?.level || 'N5');
  }, [user?.email, user?.level]);

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    setInfoMsg('');
    setInfoError('');
    setSavingInfo(true);
    try {
      const res = await authApi.patch(endpoints['current-user'], { email, level });
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      setInfoMsg('Đã cập nhật thông tin thành công');
    } catch (err) {
      setInfoError('Cập nhật thất bại, vui lòng thử lại');
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
      const detail =
        err.response?.data?.old_password?.[0] ||
        err.response?.data?.new_password?.[0] ||
        'Đổi mật khẩu thất bại';
      setPwError(detail);
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 sm:px-6 space-y-8">
      {/* Student ID Card (学生証) */}
      <div className="jp-card p-6 sm:p-8 relative overflow-hidden bg-gradient-to-br from-surface via-surface to-accent-soft/30 border-2 border-border">
        {/* Hanko seal in top corner */}
        <div className="absolute top-4 right-4">
          <div
            className="w-12 h-12 rounded-full border-2 border-accent/70 text-accent flex flex-col items-center justify-center font-serif text-[10px] font-bold leading-none select-none opacity-80 rotate-12"
            style={{ fontFamily: "'Noto Serif JP', serif" }}
          >
            <span>学習</span>
            <span>之印</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {/* Avatar with initial */}
          <div className="w-16 h-16 rounded-full bg-accent text-white flex items-center justify-center text-2xl font-bold font-serif shadow-sm shrink-0">
            {user?.username?.charAt(0).toUpperCase() || '学'}
          </div>

          <div className="text-center sm:text-left space-y-1">
            <span className="text-[11px] font-bold text-accent uppercase tracking-wider bg-accent-soft px-2.5 py-0.5 rounded-full inline-block">
              Thẻ học viên • 学生証
            </span>
            <h1 className="font-display font-extrabold text-2xl text-text">
              {user?.username}
            </h1>
            <p className="text-xs text-text-muted">{user?.email || 'Chưa cập nhật email'}</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-border/80 text-center">
          <div className="bg-surface/80 rounded-xl p-3 border border-border/60">
            <div className="flex items-center justify-center gap-1 text-accent mb-0.5">
              <DarumaIcon className="w-4 h-4" />
              <span
                className="font-serif text-xl font-black"
                style={{ fontFamily: "'Noto Serif JP', serif" }}
              >
                {user?.streak_count ?? 0}
              </span>
            </div>
            <p className="text-[11px] font-medium text-text-muted">Ngày liên tiếp</p>
          </div>

          <div className="bg-surface/80 rounded-xl p-3 border border-border/60">
            <div className="flex items-center justify-center gap-1 text-gold mb-0.5">
              <Award className="w-4 h-4" />
              <span
                className="font-serif text-xl font-black"
                style={{ fontFamily: "'Noto Serif JP', serif" }}
              >
                {user?.points ?? 0}
              </span>
            </div>
            <p className="text-[11px] font-medium text-text-muted">Điểm tích luỹ</p>
          </div>

          <div className="bg-surface/80 rounded-xl p-3 border border-border/60">
            <div className="flex items-center justify-center gap-1 text-accent mb-0.5">
              <span
                className="font-serif text-xl font-black"
                style={{ fontFamily: "'Noto Serif JP', serif" }}
              >
                {user?.level || 'N5'}
              </span>
            </div>
            <p className="text-[11px] font-medium text-text-muted">Mục tiêu JLPT</p>
          </div>
        </div>
      </div>

      {/* Update Info Form */}
      <div className="jp-card p-6 sm:p-8">
        <h2 className="font-display font-bold text-lg text-text mb-1">
          Thông tin cá nhân
        </h2>
        <p className="text-xs text-text-muted mb-6">
          Cập nhật địa chỉ email và mục tiêu trình độ JLPT của bạn
        </p>

        <form onSubmit={handleUpdateInfo} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1.5">
              Tên đăng nhập (Tài khoản)
            </label>
            <input
              type="text"
              value={user?.username || ''}
              disabled
              className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-surface-subtle text-text-faint font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1.5">
              Địa chỉ Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-surface focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1.5">
              Mục tiêu cấp độ JLPT
            </label>
            <div className="grid grid-cols-5 gap-2">
              {LEVELS.map((l) => (
                <button
                  type="button"
                  key={l.value}
                  onClick={() => setLevel(l.value)}
                  className={`py-2 px-1 text-center rounded-xl border text-xs font-medium transition cursor-pointer ${
                    level === l.value
                      ? 'bg-accent text-white border-accent shadow-xs'
                      : 'bg-surface text-text-muted border-border hover:border-accent/60'
                  }`}
                >
                  <span className="block font-bold">{l.label}</span>
                  <span
                    className={`text-[10px] font-serif ${level === l.value ? 'text-white/80' : 'text-accent'}`}
                    style={{ fontFamily: "'Noto Serif JP', serif" }}
                  >
                    {l.kanji}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {infoMsg && (
            <p className="text-xs text-matcha font-medium flex items-center gap-1.5 bg-matcha-soft p-2.5 rounded-xl">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {infoMsg}
            </p>
          )}
          {infoError && (
            <p className="text-xs text-accent font-medium flex items-center gap-1.5 bg-accent-soft p-2.5 rounded-xl">
              <AlertCircle className="w-3.5 h-3.5" />
              {infoError}
            </p>
          )}

          <button
            type="submit"
            disabled={savingInfo}
            className="w-full bg-accent text-white py-3 rounded-full text-xs font-semibold hover:bg-accent-hover transition shadow-xs shadow-accent/20 disabled:opacity-50 cursor-pointer"
          >
            {savingInfo ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </form>
      </div>

      {/* Change Password Form */}
      <div className="jp-card p-6 sm:p-8">
        <h2 className="font-display font-bold text-lg text-text mb-1">
          Bảo mật & Đổi mật khẩu
        </h2>
        <p className="text-xs text-text-muted mb-6">
          Đảm bảo mật khẩu của bạn có độ an toàn cao để bảo vệ tài khoản
        </p>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1.5">
              Mật khẩu hiện tại
            </label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-surface focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1.5">
              Mật khẩu mới
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-surface focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition"
              required
            />
          </div>

          {pwMsg && (
            <p className="text-xs text-matcha font-medium flex items-center gap-1.5 bg-matcha-soft p-2.5 rounded-xl">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {pwMsg}
            </p>
          )}
          {pwError && (
            <p className="text-xs text-accent font-medium flex items-center gap-1.5 bg-accent-soft p-2.5 rounded-xl">
              <AlertCircle className="w-3.5 h-3.5" />
              {pwError}
            </p>
          )}

          <button
            type="submit"
            disabled={savingPw}
            className="w-full bg-surface text-text border border-border hover:border-accent hover:text-accent py-3 rounded-full text-xs font-semibold transition disabled:opacity-50 cursor-pointer"
          >
            {savingPw ? 'Đang đổi mật khẩu...' : 'Xác nhận đổi mật khẩu'}
          </button>
        </form>
      </div>
    </div>
  );
}