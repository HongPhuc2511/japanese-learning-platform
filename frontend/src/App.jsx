import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Login from './pages/Login';
import Register from './pages/Register';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Vocabulary from './pages/Vocabulary';

function Home() {
  const { user } = useAuth();

  return (
    <div className="text-center mt-10">
      <h1 className="text-2xl font-bold">Xin chào, {user?.username}!</h1>
      <p className="text-gray-500 mt-2">Chào mừng quay lại với việc học tiếng Nhật.</p>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/vocabulary" element={<Vocabulary />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}