import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { endpoints, authApi } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { HankoBadge } from '../components/JapaneseIcons';
import { ArrowLeft, CheckCircle2, Circle, BookOpen, ChevronRight } from 'lucide-react';

export default function CourseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await api.get(`${endpoints['courses']}${id}/`);
        setCourse(res.data);
      } catch (err) {
        setError('Không tìm thấy khoá học');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  useEffect(() => {
    if (!user) {
      setProgressMap({});
      return;
    }
    const fetchProgress = async () => {
      try {
        const res = await authApi.get(endpoints['progress']);
        const map = {};
        res.data.forEach((p) => {
          if (p.is_completed) map[p.lesson] = p.id;
        });
        setProgressMap(map);
      } catch (err) {
        console.error('Không tải được tiến độ', err);
      }
    };
    fetchProgress();
  }, [user]);

  const toggleComplete = async (lessonId) => {
    const existingId = progressMap[lessonId];
    try {
      if (existingId) {
        await authApi.patch(`${endpoints['progress']}${existingId}/`, {
          is_completed: false,
        });
        setProgressMap((prev) => {
          const copy = { ...prev };
          delete copy[lessonId];
          return copy;
        });
      } else {
        const res = await authApi.post(endpoints['progress'], {
          lesson: lessonId,
          is_completed: true,
        });
        setProgressMap((prev) => ({ ...prev, [lessonId]: res.data.id }));
      }
    } catch (err) {
      console.error('Lỗi khi cập nhật tiến độ', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <div className="font-serif text-3xl text-accent animate-pulse mb-2" style={{ fontFamily: "'Noto Serif JP', serif" }}>
          講座詳細
        </div>
        <p className="text-text-muted text-sm font-medium">Đang tải thông tin khoá học...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <p className="text-accent text-sm font-medium">{error}</p>
      </div>
    );
  }

  const totalLessons = course.lessons ? course.lessons.length : 0;
  const completedLessons = course.lessons
    ? course.lessons.filter((l) => progressMap[l.id]).length
    : 0;
  const percent =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
      {/* Back button */}
      <Link
        to="/courses"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-accent transition mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại danh sách khoá học</span>
      </Link>

      {/* Course Hero Card */}
      <div className="jp-card p-6 sm:p-8 mb-8 relative overflow-hidden">
        <div className="flex items-center justify-between gap-4 mb-4">
          <HankoBadge text={course.level} />
          <span className="text-xs text-text-muted font-medium">
            {totalLessons} bài học trong lộ trình
          </span>
        </div>

        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-text">
          {course.title}
        </h1>
        <p className="text-sm text-text-muted mt-3 leading-relaxed max-w-2xl">
          {course.description}
        </p>

        {user && totalLessons > 0 && (
          <div className="mt-6 pt-6 border-t border-border/80">
            <div className="flex items-center justify-between text-xs text-text-muted mb-2">
              <span>
                Tiến độ hoàn thành: <strong className="text-text">{completedLessons}/{totalLessons}</strong> bài học
              </span>
              <span className="font-bold text-accent">{percent}%</span>
            </div>
            <div className="h-2.5 bg-surface-subtle border border-border/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-accent to-accent-hover transition-all duration-300"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Syllabus / Lessons Roadmap */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="font-display font-bold text-lg text-text">
              Lộ trình bài giảng
            </h2>
            <span
              className="text-xs font-serif text-accent"
              style={{ fontFamily: "'Noto Serif JP', serif" }}
            >
              カリキュラム
            </span>
          </div>
        </div>

        {course.lessons && course.lessons.length > 0 ? (
          <div className="space-y-3">
            {course.lessons.map((lesson, index) => {
              const isCompleted = !!progressMap[lesson.id];
              return (
                <div
                  key={lesson.id}
                  className={`jp-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition group ${
                    isCompleted ? 'bg-surface-subtle/60 border-matcha/40' : ''
                  }`}
                >
                  <Link
                    to={`/lessons/${lesson.id}`}
                    className="flex items-center gap-3.5 flex-1"
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-serif text-xs font-bold shrink-0 transition ${
                        isCompleted
                          ? 'bg-matcha text-white'
                          : 'bg-accent-soft text-accent group-hover:bg-accent group-hover:text-white'
                      }`}
                      style={{ fontFamily: "'Noto Serif JP', serif" }}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-text group-hover:text-accent transition">
                        {lesson.title}
                      </h3>
                      <span className="text-[11px] text-text-muted mt-0.5 block">
                        Nhấn để xem từ vựng, ngữ pháp & kiểm tra
                      </span>
                    </div>
                  </Link>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {user && (
                      <button
                        onClick={() => toggleComplete(lesson.id)}
                        className={`text-xs px-3.5 py-1.5 rounded-full border transition-all flex items-center gap-1.5 cursor-pointer ${
                          isCompleted
                            ? 'bg-matcha-soft text-matcha border-matcha/60 font-semibold'
                            : 'bg-surface text-text-muted border-border hover:border-text-muted'
                        }`}
                      >
                        {isCompleted ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Đã học xong</span>
                          </>
                        ) : (
                          <>
                            <Circle className="w-3.5 h-3.5 text-text-faint" />
                            <span>Đánh dấu xong</span>
                          </>
                        )}
                      </button>
                    )}

                    <Link
                      to={`/lessons/${lesson.id}`}
                      className="p-1.5 rounded-full text-text-muted hover:text-accent hover:bg-surface-subtle transition"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-surface rounded-2xl border border-border">
            <p className="text-text-muted text-sm">Khoá học này chưa có bài học nào.</p>
          </div>
        )}
      </div>
    </div>
  );
}