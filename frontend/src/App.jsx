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
import Profile from './pages/Profile';
import LessonDetail from './pages/LessonDetail';
import SavedItems from './pages/SavedItems';
import Footer from './components/Footer';



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

  return (
    <div className="bg-bg">
      {/* Hero */}
      <section className="max-w-[1200px] mx-auto px-6 pt-20 pb-16 text-center">
        <span className="inline-block text-xs font-semibold text-accent bg-accent-soft px-3 py-1 rounded-full mb-6">
          日本語 • JLPT N5 - N1
        </span>
        <h1 className="font-display font-bold text-text leading-tight text-5xl">
          {user ? (
            <>
              Chào mừng trở lại,{" "}
              <span className="text-accent">{user.username}</span>
            </>
          ) : (
            <>
              Học tiếng Nhật
              <br />
              <span className="text-accent">theo cách của bạn</span>
            </>
          )}
        </h1>
        <p className="text-text-muted text-lg mt-6 max-w-xl mx-auto leading-relaxed">
          Từ vựng, Kanji, ngữ pháp và bài kiểm tra — mọi thứ bạn cần để chinh
          phục JLPT, trong một nơi.
        </p>
        {!user && (
          <div className="flex items-center justify-center gap-4 mt-10">
            <Link
              to="/register"
              className="bg-accent text-white text-base font-semibold px-8 py-3 rounded-full hover:bg-accent-hover transition shadow-sm"
            >
              Bắt đầu học miễn phí
            </Link>
            <Link
              to="/login"
              className="text-text-muted text-base hover:text-text transition underline underline-offset-4"
            >
              Đã có tài khoản?
            </Link>
          </div>
        )}
      </section>

      {/* Courses preview */}
      <section className="bg-surface border-y border-border">
        <div className="max-w-[1200px] mx-auto px-6 py-20">
          <h2 className="font-display font-bold text-text text-center text-3xl mb-3">
            Khoá học nổi bật
          </h2>
          <p className="text-text-muted text-center mb-12">
            Bắt đầu từ cấp độ phù hợp với bạn
          </p>

          {courses.length === 0 ? (
            <p className="text-center text-text-muted">
              Đang cập nhật khoá học...
            </p>
          ) : (
            <div className="grid sm:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Link
                  key={course.id}
                  to={`/courses/${course.id}`}
                  className="bg-bg border border-border rounded-card p-6 hover:border-accent hover:shadow-md transition block"
                >
                  <span className="inline-block text-xs font-bold text-white bg-accent px-2.5 py-1 rounded-button mb-4">
                    {course.level}
                  </span>
                  <h3 className="text-xl font-bold text-text mb-2">
                    {course.title}
                  </h3>
                  <p className="text-sm text-text-muted leading-relaxed">
                    {course.description}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {user && (
        <section className="max-w-[1200px] mx-auto px-6 py-16">
          <div className="bg-accent-soft border border-accent rounded-card p-8 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-bold text-text mb-1">
                Tới giờ ôn tập rồi!
              </h2>
              <p className="text-text-muted text-sm">
                Ôn lại từ vựng và kanji đã học để không bị quên.
              </p>
            </div>
            <Link
              to="/flashcards"
              className="bg-accent text-white font-semibold px-6 py-2.5 rounded-full hover:bg-accent-hover transition whitespace-nowrap"
            >
              Bắt đầu ôn tập
            </Link>
          </div>
        </section>
      )}

      {/* Stats strip */}
      <section>
        <div className="max-w-[1200px] mx-auto px-6 py-16 grid grid-cols-3 gap-6 text-center">
          <div>
            <p className="font-display text-4xl font-bold text-accent">N5–N1</p>
            <p className="text-text-muted text-sm mt-2">Mọi cấp độ JLPT</p>
          </div>
          <div>
            <p className="font-display text-4xl font-bold text-accent">SRS</p>
            <p className="text-text-muted text-sm mt-2">Ôn tập thông minh</p>
          </div>
          <div>
            <p className="font-display text-4xl font-bold text-accent">Free</p>
            <p className="text-text-muted text-sm mt-2">Hoàn toàn miễn phí</p>
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
              <Route path="/vocabulary" element={<Vocabulary />} />
              <Route path="/kanji" element={<Kanji />} />
              <Route path="/grammar" element={<Grammar />} />
              <Route path="/quizzes" element={<Quizzes />} />
              <Route path="/quizzes/:id" element={<QuizDetail />} />
              <Route path="/flashcards" element={<Flashcards />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/lessons/:id" element={<LessonDetail />} />
              <Route path="/saved" element={<SavedItems />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
