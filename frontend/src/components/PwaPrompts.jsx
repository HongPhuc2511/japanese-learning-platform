import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Download, RefreshCw, WifiOff, X } from 'lucide-react';

const DISMISS_KEY = 'pwa_install_dismissed';

const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

const isIos = () => /iphone|ipad|ipod/i.test(window.navigator.userAgent);

function Toast({ icon: Icon, children, actions }) {
  return (
    <div
      role="alert"
      className="fixed bottom-4 left-4 right-24 z-[70] flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface p-3 pr-4 shadow-lg sm:right-auto sm:max-w-sm"
    >
      <Icon className="h-5 w-5 shrink-0 text-accent" />
      <p className="min-w-0 flex-1 text-sm text-text">{children}</p>
      <div className="flex items-center gap-2">{actions}</div>
    </div>
  );
}

export default function PwaPrompts() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  const [online, setOnline] = useState(() => navigator.onLine);
  const [installEvent, setInstallEvent] = useState(null);
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISS_KEY) === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    const onBeforeInstall = (e) => {
      e.preventDefault(); // giữ sự kiện lại để hiện nút cài đặt riêng của web
      setInstallEvent(e);
    };
    const onInstalled = () => setInstallEvent(null);

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // bỏ qua nếu trình duyệt chặn localStorage
    }
  };

  const install = async () => {
    if (!installEvent) return;
    installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
  };

  const standalone = isStandalone();
  const showInstall = !standalone && !dismissed && !!installEvent;
  const showIosHint = !standalone && !dismissed && !installEvent && isIos();

  const closeBtn = (onClick) => (
    <button
      onClick={onClick}
      aria-label="Đóng"
      className="rounded-full p-1 text-text-muted transition hover:text-accent cursor-pointer"
    >
      <X className="h-4 w-4" />
    </button>
  );

  return (
    <>
      {!online && (
        <div
          role="status"
          className="fixed inset-x-0 top-0 z-[70] flex items-center justify-center gap-2 bg-text px-4 py-2 text-center text-xs font-medium text-white"
        >
          <WifiOff className="h-4 w-4 shrink-0" />
          Bạn đang ngoại tuyến. Dữ liệu học cần có kết nối mạng để tải.
        </div>
      )}

      {needRefresh ? (
        <Toast
          icon={RefreshCw}
          actions={
            <>
              <button
                onClick={() => updateServiceWorker(true)}
                className="rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-accent-hover cursor-pointer"
              >
                Cập nhật
              </button>
              {closeBtn(() => setNeedRefresh(false))}
            </>
          }
        >
          Có phiên bản mới của ứng dụng.
        </Toast>
      ) : showInstall ? (
        <Toast
          icon={Download}
          actions={
            <>
              <button
                onClick={install}
                className="rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-accent-hover cursor-pointer"
              >
                Cài đặt
              </button>
              {closeBtn(dismiss)}
            </>
          }
        >
          Cài Hikari về máy để mở nhanh như một ứng dụng.
        </Toast>
      ) : showIosHint ? (
        <Toast icon={Download} actions={closeBtn(dismiss)}>
          Để cài đặt: bấm nút Chia sẻ rồi chọn “Thêm vào Màn hình chính”.
        </Toast>
      ) : null}
    </>
  );
}