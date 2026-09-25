import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { endpoints } from '../api/api';

export default function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
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

  if (loading) return <p className="text-center mt-10">Đang tải...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4">
      <Link to="/courses" className="text-blue-600 hover:underline text-sm">
        ← Quay lại danh sách
      </Link>

      <h1 className="text-2xl font-bold mt-4">{course.title}</h1>
      <p className="text-sm text-gray-500 mt-1">Cấp độ: {course.level}</p>
      <p className="text-gray-700 mt-4">{course.description}</p>

      <h2 className="text-lg font-semibold mt-8 mb-3">Danh sách bài học</h2>
      {course.lessons && course.lessons.length > 0 ? (
        <ul className="space-y-2">
          {course.lessons.map((lesson) => (
            <li key={lesson.id} className="border rounded-md p-3">
              {lesson.title}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">Chưa có bài học nào.</p>
      )}
    </div>
  );
}