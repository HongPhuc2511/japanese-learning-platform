const LANG = 'ja-JP';
const RATE = 0.85; // chậm hơn tốc độ thường một chút để dễ nghe khi học
const STORAGE_KEY = 'japanese_voice';

let voicesPromise = null;
let warnedNoVoice = false;

const isJapanese = (voice) => voice.lang.replace('_', '-').toLowerCase().startsWith('ja');

// Chấm điểm để chọn giọng nghe tự nhiên nhất trong các giọng tiếng Nhật của máy
function scoreVoice(voice) {
  let score = 0;
  if (/natural|neural|premium|enhanced/i.test(voice.name)) score += 100;
  if (/online/i.test(voice.name)) score += 40;
  if (/google/i.test(voice.name)) score += 30;
  if (voice.lang.replace('_', '-') === LANG) score += 10;
  if (voice.default) score += 1;
  return score;
}

function pickVoice() {
  const voices = window.speechSynthesis.getVoices().filter(isJapanese);
  if (voices.length === 0) return null;

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const chosen = saved && voices.find((v) => v.name === saved);
    if (chosen) return chosen;
  } catch {
    // bỏ qua nếu trình duyệt chặn localStorage
  }
  return [...voices].sort((a, b) => scoreVoice(b) - scoreVoice(a))[0];
}

// Danh sách giọng tiếng Nhật của máy, dùng nếu sau này muốn làm ô chọn giọng
export function getJapaneseVoices() {
  return window.speechSynthesis.getVoices().filter(isJapanese).map((v) => v.name);
}

export function setPreferredVoice(name) {
  try {
    if (name) localStorage.setItem(STORAGE_KEY, name);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // bỏ qua
  }
}

function loadVoices() {
  const synth = window.speechSynthesis;
  if (synth.getVoices().length > 0) return Promise.resolve();

  if (!voicesPromise) {
    voicesPromise = new Promise((resolve) => {
      const done = () => {
        synth.removeEventListener('voiceschanged', done);
        resolve();
      };
      synth.addEventListener('voiceschanged', done);
      setTimeout(done, 1500); // một số trình duyệt không bao giờ phát sự kiện này
    });
  }
  return voicesPromise;
}

// Làm sạch văn bản trước khi đọc
function cleanText(text) {
  return String(text ?? '')
    .replace(/[（(][^）)]*[）)]/g, ' ') // bỏ chú thích trong ngoặc (thường là nghĩa tiếng Việt)
    .replace(/[～〜~]+/g, '、') // dấu ~ của mẫu ngữ pháp thành một quãng nghỉ ngắn
    .replace(/\s*[/／]\s*/g, '、') // "ます / ません" thành "ます、ません"
    .replace(/[.・]/g, '') // "た.べる" thành "たべる"
    .replace(/、{2,}/g, '、')
    .replace(/^、+|、+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Tách thành từng câu ngắn để câu dài không bị đọc đứt giữa chừng
function splitSentences(text) {
  return text.match(/[^。！？!?\n]+[。！？!?]?/g) || [];
}

export function speakJapanese(text) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    window.alert?.('Trình duyệt của bạn không hỗ trợ đọc thành tiếng.');
    return;
  }

  const sentences = splitSentences(cleanText(text));
  if (sentences.length === 0) return;

  const run = () => {
    const synth = window.speechSynthesis;
    synth.cancel(); // dừng câu đang đọc, tránh bị kẹt hàng đợi

    const voice = pickVoice();
    if (!voice && !warnedNoVoice) {
      warnedNoVoice = true;
      window.alert(
        'Máy của bạn chưa có giọng đọc tiếng Nhật nên phát âm có thể không chuẩn. ' +
          'Hãy thêm giọng Japanese trong cài đặt giọng nói (Speech) của hệ điều hành, ' +
          'hoặc thử mở web bằng trình duyệt khác.'
      );
    }
    if (import.meta.env.DEV) console.info('Giọng đang dùng:', voice ? voice.name : 'không có giọng Nhật');

    sentences.forEach((part) => {
      const utterance = new SpeechSynthesisUtterance(part);
      utterance.lang = voice ? voice.lang : LANG;
      if (voice) utterance.voice = voice;
      utterance.rate = RATE;
      synth.speak(utterance);
    });
  };

  if (window.speechSynthesis.getVoices().length > 0) run();
  else loadVoices().then(run);
}