import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { endpoints } from '../api/api';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get(endpoints['courses']);
        setCourses(res.data);
      } catch (err) {
        setError('Không tải được danh sách khoá học');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  if (loading) return <p className="text-center mt-10 text-text-muted">Đang tải...</p>;
  if (error) return <p className="text-center mt-10 text-accent">{error}</p>;

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4">
      <h1 className="font-display text-2xl font-bold mb-6">Danh sách khoá học</h1>
      {courses.length === 0 ? (
        <p className="text-text-muted">Chưa có khoá học nào.</p>
      ) : (
        <div className="grid gap-4">
          {courses.map((course) => (
            <Link
              key={course.id}
              to={`/courses/${course.id}`}
              className="block bg-surface border border-border rounded-card p-4 hover:border-accent transition"
            >
              <h2 className="text-lg font-semibold">{course.title}</h2>
              <p className="text-xs text-text-faint mt-1">Cấp độ: {course.level}</p>
              <p className="text-sm text-text-muted mt-1">{course.description}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}