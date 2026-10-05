import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { endpoints, authApi } from '../api/api';
import { useAuth } from '../context/AuthContext';

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
    if (!user) return;
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

  if (loading) return <p className="text-center mt-10 text-text-muted">Đang tải...</p>;
  if (error) return <p className="text-center mt-10 text-accent">{error}</p>;

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4">
      <Link to="/courses" className="text-accent hover:underline text-sm">
        ← Quay lại danh sách
      </Link>

      <h1 className="font-display text-2xl font-bold mt-4">{course.title}</h1>
      <p className="text-xs text-text-faint mt-1">Cấp độ: {course.level}</p>
      <p className="text-text-muted mt-4">{course.description}</p>

      <h2 className="text-lg font-semibold mt-8 mb-3">Danh sách bài học</h2>
      {course.lessons && course.lessons.length > 0 ? (
        <ul className="space-y-2">
          {course.lessons.map((lesson) => (
            <li
              key={lesson.id}
              className="border border-border rounded-card p-3 flex items-center justify-between"
            >
              <span>{lesson.title}</span>
              {user && (
                <button
                  onClick={() => toggleComplete(lesson.id)}
                  className={`text-sm px-3 py-1 rounded-button ${
                    progressMap[lesson.id]
                      ? 'bg-accent-soft text-accent'
                      : 'bg-bg text-text-muted hover:text-text'
                  }`}
                >
                  {progressMap[lesson.id] ? '✓ Đã hoàn thành' : 'Đánh dấu hoàn thành'}
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-text-muted">Chưa có bài học nào.</p>
      )}
    </div>
  );
}