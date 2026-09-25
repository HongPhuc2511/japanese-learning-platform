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

  if (loading) return <p className="text-center mt-10">Đang tải...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Danh sách khoá học</h1>
      {courses.length === 0 ? (
        <p className="text-gray-500">Chưa có khoá học nào.</p>
      ) : (
        <div className="grid gap-4">
          {courses.map((course) => (
            <Link
              key={course.id}
              to={`/courses/${course.id}`}
              className="block border rounded-lg p-4 hover:shadow-md transition"
            >
              <h2 className="text-lg font-semibold">{course.title}</h2>
              <p className="text-sm text-gray-500">Cấp độ: {course.level}</p>
              <p className="text-sm text-gray-600 mt-1">{course.description}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}