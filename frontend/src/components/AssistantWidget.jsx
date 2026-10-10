import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi, endpoints } from '../api/api';
import { useAuth } from '../context/AuthContext';

const SUGGESTIONS = [
  'Phân biệt trợ từ は và が',
  'Giải thích thể て và cách chia',
  'Sửa giúp mình câu: 私は学生ですか',
];

function buildPayload(messages) {
  let recent = messages.slice(-19);
  while (recent.length > 0 && recent[0].role !== 'user') {
    recent = recent.slice(1);
  }
  return recent;
}

const STORAGE_KEY = 'assistant_chat';

export default function AssistantWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const prevUserId = useRef(user?.id);

  // Lưu lịch sử mỗi khi thay đổi (giữ 40 tin gần nhất cho gọn)
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-40)));
  }, [messages]);

  // Chỉ xoá khi đăng xuất hoặc đổi tài khoản, không xoá lúc tải lại trang
  useEffect(() => {
    if (prevUserId.current !== user?.id) {
      setMessages([]);
      setInput('');
      setError('');
      setOpen(false);
      prevUserId.current = user?.id;
    }
  }, [user?.id]);

  useEffect(() => {
    if (open && user) inputRef.current?.focus();
  }, [open, user]);

  const sendMessage = async (text) => {
    const content = text.trim();
    if (!content || sending) return;

    const nextMessages = [...messages, { role: 'user', content }];
    setMessages(nextMessages);
    setInput('');
    setError('');
    setSending(true);

    try {
      const res = await authApi.post(endpoints['assistant-chat'], {
        messages: buildPayload(nextMessages),
      });
      setMessages((prev) => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch (err) {
      // Gỡ tin vừa gửi để lịch sử không bị hai tin liên tiếp cùng vai trò
      setMessages((prev) => prev.slice(0, -1));
      setInput(content);
      if (err.response?.status === 429) {
        setError('Bạn hỏi hơi nhiều rồi, đợi một lúc rồi thử lại nhé.');
      } else {
        setError(err.response?.data?.error || 'Không gửi được câu hỏi, bạn thử lại nhé.');
      }
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setError('');
  };

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 h-[32rem] max-h-[75vh] bg-surface border border-border rounded-card shadow-xl flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div>
              <p className="font-display font-bold text-sm">Sensei AI</p>
              <p className="text-[11px] text-text-faint">Trợ lý học tiếng Nhật</p>
            </div>
            <div className="flex items-center gap-3">
              {messages.length > 0 && (
                <button
                  onClick={handleReset}
                  className="text-xs text-text-muted hover:text-accent transition"
                >
                  Cuộc mới
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                aria-label="Đóng"
                className="text-text-muted hover:text-text text-xl leading-none"
              >
                ×
              </button>
            </div>
          </div>

          {!user ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-2">
              <p className="text-sm text-text-muted">Bạn cần đăng nhập để dùng trợ lý AI.</p>
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="text-sm text-accent hover:underline"
              >
                Đăng nhập
              </Link>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center gap-3">
                    <p className="text-text-muted text-sm">Hỏi mình bất cứ điều gì về tiếng Nhật, hoặc thử:</p>
                    <div className="flex flex-col gap-2 w-full">
                      {SUGGESTIONS.map((s) => (
                        <button
                          key={s}
                          onClick={() => sendMessage(s)}
                          className="text-xs px-3 py-2 rounded-button border border-border text-text-muted hover:border-accent hover:text-accent transition"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] rounded-card px-3 py-2 text-sm whitespace-pre-wrap ${
                        m.role === 'user'
                          ? 'bg-accent text-white'
                          : 'bg-bg border border-border text-text'
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}

                {sending && (
                  <div className="flex justify-start">
                    <div className="bg-bg border border-border rounded-card px-3 py-2 text-sm text-text-faint">
                      Sensei AI đang trả lời...
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>

              {error && <p className="text-xs text-accent px-3 pb-2">{error}</p>}

              <div className="border-t border-border p-3 flex gap-2">
                <textarea
                  ref={inputRef}
                  rows={2}
                  maxLength={2000}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Nhập câu hỏi..."
                  className="flex-1 border border-border rounded-button px-3 py-2 text-sm resize-none focus:outline-none focus:border-accent"
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={sending || !input.trim()}
                  className="bg-accent text-white px-3 rounded-button hover:bg-accent-hover transition disabled:opacity-50 text-sm"
                >
                  Gửi
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? 'Đóng trợ lý AI' : 'Mở trợ lý AI'}
        className="fixed bottom-6 right-4 sm:right-6 z-50 w-14 h-14 rounded-full bg-accent text-white shadow-lg hover:bg-accent-hover transition flex items-center justify-center"
      >
        {open ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>
    </>
  );
}