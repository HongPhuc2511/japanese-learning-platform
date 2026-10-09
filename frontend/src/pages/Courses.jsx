import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { authApi, endpoints } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { HankoBadge } from '../components/JapaneseIcons';
import { BookOpen, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function Courses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const client = user ? authApi : api;
        const res = await client.get(endpoints['courses']);
        setCourses(res.data);
      } catch (err) {
        setError('Không tải được danh sách khoá học');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [user]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <div className="font-serif text-3xl text-accent animate-pulse mb-2" style={{ fontFamily: "'Noto Serif JP', serif" }}>
          講座一覧
        </div>
        <p className="text-text-muted text-sm font-medium">Đang tải danh sách khoá học...</p>
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

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
      {/* Header section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-serif text-accent font-bold text-sm" style={{ fontFamily: "'Noto Serif JP', serif" }}>
            講座一覧 • KOZA ICHIRAN
          </span>
          <span className="text-text-faint">•</span>
          <span className="text-xs text-text-muted">Tổng cộng {courses.length} khoá học</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-text tracking-tight">
          Khoá học Tiếng Nhật JLPT
        </h1>
        <p className="text-sm text-text-muted mt-2 max-w-xl">
          Lộ trình bài giảng chuẩn hóa theo từng cấp độ, từ nhập môn Hiragana/Katakana đến nâng cao N1.
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-2xl border border-border">
          <p className="text-text-muted text-sm">Chưa có khoá học nào.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {courses.map((course) => {
            const progress = course.progress;
            const percent =
              progress && progress.total > 0
                ? Math.round((progress.completed / progress.total) * 100)
                : 0;

            return (
              <Link
                key={course.id}
                to={`/courses/${course.id}`}
                className="jp-card p-6 flex flex-col justify-between group hover:border-accent"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <HankoBadge text={course.level} />
                    {progress && percent === 100 && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-matcha bg-matcha-soft px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        Đã hoàn thành
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl font-bold text-text group-hover:text-accent transition mb-2">
                    {course.title}
                  </h2>
                  <p className="text-xs text-text-muted leading-relaxed line-clamp-3">
                    {course.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-border/80">
                  {progress ? (
                    <div>
                      <div className="flex items-center justify-between text-xs text-text-muted mb-1.5">
                        <span>
                          Tiến độ: <strong className="text-text">{progress.completed}/{progress.total}</strong> bài học
                        </span>
                        <span className="font-semibold text-accent">{percent}%</span>
                      </div>
                      <div className="h-2 bg-surface-subtle border border-border/60 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-accent to-accent-hover transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-xs font-medium text-text-muted group-hover:text-accent">
                      <span>Bắt đầu học</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}