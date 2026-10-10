import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Header from "./components/Header";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import Vocabulary from "./pages/Vocabulary";
import Kanji from "./pages/Kanji";
import Grammar from "./pages/Grammar";
import Quizzes from "./pages/Quizzes";
import QuizDetail from "./pages/QuizDetail";
import api, { endpoints } from "./api/api";
import Flashcards from "./pages/Flashcards";
import Profile from "./pages/Profile";
import LessonDetail from "./pages/LessonDetail";
import SavedItems from "./pages/SavedItems";
import Footer from "./components/Footer";
import QuizHistory from "./pages/QuizHistory";
import ProtectedRoute from "./components/ProtectedRoute";
import { ToriiIcon, DarumaIcon, HankoBadge } from "./components/JapaneseIcons";
import { speakJapanese } from "./utils/speak";
import {
  BookOpen,
  Layers,
  ArrowRight,
  Volume2,
  ChevronRight,
  Brain,
} from "lucide-react";
import AssistantWidget from "./components/AssistantWidget";

function Home() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get(endpoints["courses"]);
        setCourses(res.data.slice(0, 3));
      } catch (err) {
        console.error("Không tải được khoá học", err);
      }
    };
    fetchCourses();
  }, []);

  const proverb = {
    japanese: "七転び八起き",
    kana: "ななころびやおき",
    romaji: "Nana korobi ya oki",
    vietnamese:
      "Ngã bảy lần, đứng dậy tám lần — Tinh thần kiên trì, không bao giờ bỏ cuộc.",
    kanjiMeaning: "Thất bộc bát khởi",
  };

  const jlptLevels = [
    {
      level: "N5",
      kanji: "初級",
      title: "Nhập môn",
      words: "~800 từ",
      kanjis: "100 chữ",
      desc: "Hiragana, Katakana và hội thoại cơ bản hàng ngày.",
    },
    {
      level: "N4",
      kanji: "基礎",
      title: "Cơ bản",
      words: "~1,500 từ",
      kanjis: "300 chữ",
      desc: "Đọc hiểu đoạn văn ngắn và giao tiếp quen thuộc.",
    },
    {
      level: "N3",
      kanji: "中級",
      title: "Trung cấp",
      words: "~3,750 từ",
      kanjis: "650 chữ",
      desc: "Cầu nối chuyển tiếp, giao tiếp tự nhiên trong cuộc sống.",
    },
    {
      level: "N2",
      kanji: "上級",
      title: "Nâng cao",
      words: "~6,000 từ",
      kanjis: "1,000 chữ",
      desc: "Đọc báo chí, làm việc và sinh hoạt tại Nhật Bản.",
    },
    {
      level: "N1",
      kanji: "極",
      title: "Chuyên sâu",
      words: "~10,000+ từ",
      kanjis: "2,000+ chữ",
      desc: "Thành thạo chuyên sâu như người bản xứ.",
    },
  ];

  return (
    <div className="bg-bg relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-border/80 seigaiha-pattern">
        {/* Subtle decorative background Kanji watermark */}
        <div
          aria-hidden="true"
          className="absolute -right-10 -bottom-16 text-accent/5 font-serif select-none pointer-events-none text-[220px] font-black leading-none hidden lg:block"
          style={{ fontFamily: "'Noto Serif JP', serif" }}
        >
          光
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 bg-surface border border-accent/30 px-3.5 py-1.5 rounded-full mb-6 shadow-xs">
              <ToriiIcon className="w-4 h-4 text-accent" />
              <span className="text-xs font-semibold text-accent tracking-wide">
                日本語学習道場 • JLPT N5 — N1
              </span>
              <span className="text-[10px] bg-accent text-white px-1.5 py-0.2 rounded-full font-bold">
                Miễn phí
              </span>
            </div>

            {/* Main Heading with Japanese typography */}
            <h1 className="font-display font-extrabold text-text text-4xl sm:text-5xl md:text-6xl tracking-tight leading-[1.15]">
              {user ? (
                <>
                  Chào mừng trở lại,{" "}
                  <span className="text-accent underline decoration-accent/30 decoration-wavy underline-offset-8">
                    {user.username}
                  </span>
                  <div
                    className="text-base sm:text-xl font-normal text-text-muted mt-3 font-serif"
                    style={{ fontFamily: "'Noto Serif JP', serif" }}
                  >
                    おかえりなさい、今日も一歩前進しよう。
                  </div>
                </>
              ) : (
                <>
                  Học tiếng Nhật
                  <br />
                  <span className="text-accent relative inline-block">
                    theo phong cách chuẩn Nhật
                    <svg
                      className="absolute -bottom-2 left-0 w-full h-3 text-accent/30"
                      viewBox="0 0 200 12"
                      fill="none"
                      preserveAspectRatio="none"
                    >
                      <path
                        d="M0 7C50 1 150 1 200 7"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </>
              )}
            </h1>

            <p className="text-text-muted text-base sm:text-lg mt-6 max-w-2xl mx-auto leading-relaxed">
              Lộ trình toàn diện kết hợp{" "}
              <strong className="text-text font-semibold">Từ vựng</strong>,{" "}
              <strong className="text-text font-semibold">Kanji</strong>,{" "}
              <strong className="text-text font-semibold">Ngữ pháp</strong> cùng
              thuật toán lặp lại ngắt quãng{" "}
              <strong className="text-accent font-semibold">
                SRS (間隔反復)
              </strong>{" "}
              giúp ghi nhớ vĩnh viễn.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3.5 mt-8">
              {user ? (
                <>
                  <Link
                    to="/flashcards"
                    className="inline-flex items-center gap-2 bg-accent text-white font-semibold px-6 py-3 rounded-full hover:bg-accent-hover transition shadow-sm shadow-accent/25 hover:scale-[1.02]"
                  >
                    <DarumaIcon className="w-4 h-4" />
                    <span>Vào phòng ôn tập SRS</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/courses"
                    className="inline-flex items-center gap-2 bg-surface text-text border border-border px-5 py-3 rounded-full hover:border-accent hover:bg-surface-subtle transition font-medium text-sm"
                  >
                    <span>Xem khoá học</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 bg-accent text-white font-semibold px-7 py-3 rounded-full hover:bg-accent-hover transition shadow-sm shadow-accent/25 hover:scale-[1.02]"
                  >
                    <span>Bắt đầu học ngay</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/courses"
                    className="inline-flex items-center gap-2 bg-surface text-text border border-border px-6 py-3 rounded-full hover:border-accent hover:bg-surface-subtle transition font-medium text-sm"
                  >
                    <span>Khám phá bài học</span>
                  </Link>
                </>
              )}
            </div>

            {/* Cultural Kotowaza (Daily Proverb) Banner */}
            <div className="mt-12 bg-surface/90 border border-border rounded-2xl p-5 text-left max-w-xl mx-auto shadow-xs relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-bl-full pointer-events-none" />
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-accent uppercase tracking-wider bg-accent-soft px-2 py-0.5 rounded-full">
                      Châm ngôn hôm nay • 今日のことわざ
                    </span>
                    <button
                      onClick={() => speakJapanese(proverb.japanese)}
                      className="text-text-muted hover:text-accent p-1 rounded-full hover:bg-accent-soft transition cursor-pointer"
                      title="Phát âm tiếng Nhật"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-baseline gap-2 pt-1">
                    <p
                      className="text-xl sm:text-2xl font-bold font-serif text-accent tracking-wide"
                      style={{ fontFamily: "'Noto Serif JP', serif" }}
                    >
                      {proverb.japanese}
                    </p>
                    <span className="text-xs text-text-muted">
                      ({proverb.kana})
                    </span>
                  </div>
                  <p className="text-xs text-text-muted font-medium mt-1">
                    {proverb.vietnamese}
                  </p>
                </div>
                <div
                  className="font-serif text-3xl font-black text-accent/20 select-none hidden sm:block"
                  style={{ fontFamily: "'Noto Serif JP', serif" }}
                >
                  志
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pillars Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-bold text-accent tracking-wider uppercase">
            Học tập đa chiều • 総合学習
          </span>
          <h2 className="font-display font-bold text-text text-2xl sm:text-3xl mt-1">
            Bốn trụ cột chinh phục tiếng Nhật
          </h2>
          <p className="text-sm text-text-muted mt-2">
            Thiết kế khoa học giúp bạn phát triển đều cả 4 kỹ năng kiến thức
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Pillar 1: Từ vựng */}
          <Link
            to="/vocabulary"
            className="jp-card p-6 flex flex-col justify-between group hover:border-accent"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-accent-soft flex items-center justify-center text-accent mb-4 group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-text text-lg">Từ vựng</h3>
                <span
                  className="text-xs font-serif text-accent bg-accent-soft px-1.5 py-0.5 rounded"
                  style={{ fontFamily: "'Noto Serif JP', serif" }}
                >
                  語彙
                </span>
              </div>
              <p className="text-xs text-text-muted leading-relaxed mt-2">
                Hàng ngàn từ vựng JLPT kèm Furigana, giải nghĩa chi tiết, câu ví
                dụ thực tế và âm thanh phát âm bản ngữ.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-border flex items-center justify-between text-xs font-medium text-accent">
              <span>Học từ vựng</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Pillar 2: Kanji */}
          <Link
            to="/kanji"
            className="jp-card p-6 flex flex-col justify-between group hover:border-indigo"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-soft flex items-center justify-center text-indigo mb-4 group-hover:scale-110 transition-transform">
                <span
                  className="text-2xl font-bold font-serif"
                  style={{ fontFamily: "'Noto Serif JP', serif" }}
                >
                  字
                </span>
              </div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-text text-lg">Hán tự Kanji</h3>
                <span
                  className="text-xs font-serif text-indigo bg-indigo-soft px-1.5 py-0.5 rounded"
                  style={{ fontFamily: "'Noto Serif JP', serif" }}
                >
                  漢字
                </span>
              </div>
              <p className="text-xs text-text-muted leading-relaxed mt-2">
                Nắm vững âm On, Kun, nghĩa Hán Việt cùng cách viết theo ô ly tập
                viết chuẩn phong cách Nhật Bản.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-border flex items-center justify-between text-xs font-medium text-indigo">
              <span>Khám phá Kanji</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Pillar 3: Ngữ pháp */}
          <Link
            to="/grammar"
            className="jp-card p-6 flex flex-col justify-between group hover:border-matcha"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-matcha-soft flex items-center justify-center text-matcha mb-4 group-hover:scale-110 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-text text-lg">Ngữ pháp</h3>
                <span
                  className="text-xs font-serif text-matcha bg-matcha-soft px-1.5 py-0.5 rounded"
                  style={{ fontFamily: "'Noto Serif JP', serif" }}
                >
                  文法
                </span>
              </div>
              <p className="text-xs text-text-muted leading-relaxed mt-2">
                Tổng hợp mẫu câu chuẩn kỳ thi JLPT kèm phân tích cấu trúc ngữ
                pháp và tình huống sử dụng trực quan.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-border flex items-center justify-between text-xs font-medium text-matcha">
              <span>Xem ngữ pháp</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Pillar 4: Ôn tập SRS */}
          <Link
            to="/flashcards"
            className="jp-card p-6 flex flex-col justify-between group hover:border-gold"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-gold-soft flex items-center justify-center text-gold mb-4 group-hover:scale-110 transition-transform">
                <Brain className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-text text-lg">Ôn tập SRS</h3>
                <span
                  className="text-xs font-serif text-gold bg-gold-soft px-1.5 py-0.5 rounded"
                  style={{ fontFamily: "'Noto Serif JP', serif" }}
                >
                  記憶
                </span>
              </div>
              <p className="text-xs text-text-muted leading-relaxed mt-2">
                Hệ thống tự động nhắc nhở ôn lại đúng thời điểm não bộ sắp quên,
                tối ưu hóa 300% hiệu suất ghi nhớ.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-border flex items-center justify-between text-xs font-medium text-gold">
              <span>Luyện thẻ nhớ</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </section>

      {/* JLPT Pathway Roadmap */}
      <section className="bg-surface-subtle/80 border-y border-border py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-bold text-accent tracking-wider uppercase">
              Lộ trình chuẩn • 学習ロードマップ
            </span>
            <h2 className="font-display font-bold text-text text-2xl sm:text-3xl mt-1">
              Hành trình 5 bậc thang JLPT
            </h2>
            <p className="text-sm text-text-muted mt-2">
              Từng bước vững chắc từ con số 0 đến làm chủ ngôn ngữ xứ sở Phù
              Tang
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {jlptLevels.map((lvl, index) => (
              <div
                key={lvl.level}
                className="bg-surface border border-border rounded-2xl p-5 flex flex-col justify-between hover:border-accent hover:shadow-sm transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="font-serif text-2xl font-black text-accent"
                      style={{ fontFamily: "'Noto Serif JP', serif" }}
                    >
                      {lvl.level}
                    </span>
                    <HankoBadge text={lvl.kanji} />
                  </div>
                  <h3 className="font-bold text-text text-sm mb-1">
                    {lvl.title}
                  </h3>
                  <p className="text-xs text-text-muted leading-relaxed mb-4">
                    {lvl.desc}
                  </p>
                </div>
                <div className="pt-3 border-t border-border/70 space-y-1 text-[11px] text-text-muted">
                  <div className="flex justify-between">
                    <span>Từ vựng:</span>
                    <strong className="text-text">{lvl.words}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Kanji:</span>
                    <strong className="text-text">{lvl.kanjis}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses preview */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold text-accent tracking-wider uppercase">
              Khoá học trọng tâm • おすすめ講座
            </span>
            <h2 className="font-display font-bold text-text text-2xl sm:text-3xl mt-1">
              Khoá học nổi bật
            </h2>
            <p className="text-sm text-text-muted mt-1">
              Bắt đầu với bài học bài bản theo chuẩn giáo trình quốc tế
            </p>
          </div>
          <Link
            to="/courses"
            className="text-xs font-semibold text-accent hover:text-accent-hover flex items-center gap-1 group"
          >
            <span>Xem tất cả khoá học</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-12 bg-surface rounded-2xl border border-border">
            <ToriiIcon className="w-8 h-8 text-accent/40 mx-auto mb-3" />
            <p className="text-text-muted text-sm">
              Đang cập nhật danh sách khoá học...
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Link
                key={course.id}
                to={`/courses/${course.id}`}
                className="jp-card p-6 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <HankoBadge text={course.level} />
                    <span className="text-[10px] text-text-muted">
                      JLPT Chuẩn
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-text group-hover:text-accent transition mb-2">
                    {course.title}
                  </h3>
                  <p className="text-xs text-text-muted leading-relaxed line-clamp-3">
                    {course.description}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs font-medium text-text-muted group-hover:text-accent">
                  <span>Khám phá bài học</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Review reminder for logged in user */}
      {user && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
          <div className="bg-gradient-to-r from-accent-soft via-surface to-accent-soft border border-accent/30 rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs relative overflow-hidden">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-accent text-white flex items-center justify-center shadow-sm shrink-0">
                <DarumaIcon className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-bold text-text">
                    Tới giờ ôn tập định kỳ rồi!
                  </h2>
                  <span className="text-xs bg-accent text-white font-serif px-2 py-0.2 rounded-full font-bold">
                    復習
                  </span>
                </div>
                <p className="text-text-muted text-xs leading-relaxed max-w-lg">
                  Thuật toán SRS đã tổng hợp những từ vựng và kanji đến hạn ôn
                  tập hôm nay. Dành 5 phút để củng cố trí nhớ nào!
                </p>
              </div>
            </div>
            <Link
              to="/flashcards"
              className="bg-accent text-white font-semibold text-xs sm:text-sm px-6 py-3 rounded-full hover:bg-accent-hover transition whitespace-nowrap shadow-sm shadow-accent/20 hover:scale-105"
            >
              Bắt đầu ôn tập ngay
            </Link>
          </div>
        </section>
      )}

      {/* Stats strip */}
      <section className="border-t border-border bg-surface">
        <div className="max-w-5xl mx-auto px-6 py-14 grid grid-cols-3 gap-6 text-center">
          <div className="space-y-1">
            <p
              className="font-serif text-3xl sm:text-4xl font-extrabold text-accent"
              style={{ fontFamily: "'Noto Serif JP', serif" }}
            >
              N5–N1
            </p>
            <p className="text-text font-medium text-xs sm:text-sm">
              Đầy đủ 5 Cấp độ
            </p>
            <p className="text-[11px] text-text-muted">
              Theo chuẩn kỳ thi năng lực
            </p>
          </div>
          <div className="space-y-1 border-x border-border">
            <p
              className="font-serif text-3xl sm:text-4xl font-extrabold text-matcha"
              style={{ fontFamily: "'Noto Serif JP', serif" }}
            >
              SRS
            </p>
            <p className="text-text font-medium text-xs sm:text-sm">
              Lặp lại ngắt quãng
            </p>
            <p className="text-[11px] text-text-muted">
              Khoa học trí nhớ tối ưu
            </p>
          </div>
          <div className="space-y-1">
            <p
              className="font-serif text-3xl sm:text-4xl font-extrabold text-gold"
              style={{ fontFamily: "'Noto Serif JP', serif" }}
            >
              100%
            </p>
            <p className="text-text font-medium text-xs sm:text-sm">
              Miễn phí học tập
            </p>
            <p className="text-[11px] text-text-muted">
              Không giới hạn tính năng
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/:id" element={<CourseDetail />} />
              <Route path="/lessons/:id" element={<LessonDetail />} />

              <Route path="/vocabulary" element={<Vocabulary />} />
              <Route path="/kanji" element={<Kanji />} />
              <Route path="/grammar" element={<Grammar />} />

              <Route path="/quizzes" element={<Quizzes />} />
              <Route path="/quizzes/:id" element={<QuizDetail />} />
              <Route
                path="/quiz-history"
                element={
                  <ProtectedRoute>
                    <QuizHistory />
                  </ProtectedRoute>
                }
              />

              <Route path="/flashcards" element={<Flashcards />} />
              <Route path="/saved" element={<SavedItems />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </main>
          <Footer />
          <AssistantWidget />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
