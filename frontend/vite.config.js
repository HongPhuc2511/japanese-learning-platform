import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  // `vite preview` chạy bằng http://localhost để service worker đăng ký được
  const isPreview = process.argv.includes('preview');

  return {
    plugins: [
      react(),
      tailwindcss(),
      !isPreview && basicSsl(),
      VitePWA({
        registerType: 'prompt', // có bản mới thì hỏi người dùng, không tự tải lại giữa chừng
        includeAssets: ['icon.svg', 'icons/apple-touch-icon.png'],
        manifest: {
          name: 'Hikari 日本語 - Học tiếng Nhật JLPT',
          short_name: 'Hikari',
          description: 'Học từ vựng, Kanji, ngữ pháp và ôn tập SRS để chinh phục JLPT N5 đến N1',
          lang: 'vi',
          start_url: '/',
          scope: '/',
          display: 'standalone',
          background_color: '#faf8f5',
          theme_color: '#c0392b',
          icons: [
            { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
            { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
          shortcuts: [
            { name: 'Ôn tập', url: '/flashcards', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
            { name: 'Từ vựng', url: '/vocabulary', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/api\//],
          runtimeCaching: [
            {
              // Dữ liệu thứ tự nét: xem một lần là lưu lại
              urlPattern: ({ url }) => url.pathname.startsWith('/kanjivg/'),
              handler: 'CacheFirst',
              options: {
                cacheName: 'kanjivg',
                expiration: { maxEntries: 3000, maxAgeSeconds: 60 * 60 * 24 * 180 },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'StaleWhileRevalidate',
              options: { cacheName: 'google-fonts-css' },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-files',
                expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 365 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
        },
      }),
    ].filter(Boolean),
  };
});