let sdkPromise = null;

export function loadFacebookSdk(appId) {
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise((resolve, reject) => {
    const init = () => {
      window.FB.init({ appId, cookie: false, xfbml: false, version: 'v25.0' });
      resolve(window.FB);
    };

    if (window.FB) {
      init();
      return;
    }

    window.fbAsyncInit = init;
    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.onerror = () => {
      sdkPromise = null;
      reject(new Error('Không tải được Facebook SDK'));
    };
    document.body.appendChild(script);
  });

  return sdkPromise;
}