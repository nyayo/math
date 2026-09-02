import { Navigate, Route, Routes } from 'react-router-dom';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import RegisterSuccess from '@/pages/auth/RegisterSuccess';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { NotFound, Placeholder } from '@/pages/Placeholder';
import StudentHome from '@/pages/student/StudentHome';
import Topics from '@/pages/student/Topics';
import TopicDetail from '@/pages/student/TopicDetail';
import LessonDetail from '@/pages/student/LessonDetail';
import QuizList from '@/pages/student/QuizList';
import QuizDetail from '@/pages/student/QuizDetail';
import QuizResults from '@/pages/student/QuizResults';
import AITutor from '@/pages/student/AITutor';
import Performance from '@/pages/student/Performance';
import StudentProfile from '@/pages/student/StudentProfile';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/register-success" element={<RegisterSuccess />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Student */}
      <Route path="/dashboard" element={<ProtectedRoute role="student"><StudentHome /></ProtectedRoute>} />
      <Route path="/topics" element={<ProtectedRoute role="student"><Topics /></ProtectedRoute>} />
      <Route path="/topics/:topicId" element={<ProtectedRoute role="student"><TopicDetail /></ProtectedRoute>} />
      <Route path="/lessons/:lessonId" element={<ProtectedRoute role="student"><LessonDetail /></ProtectedRoute>} />
      <Route path="/lessons/:lessonId/quizzes" element={<ProtectedRoute role="student"><QuizList /></ProtectedRoute>} />
      <Route path="/quizzes/:quizId" element={<ProtectedRoute role="student"><QuizDetail /></ProtectedRoute>} />
      <Route path="/quizzes/:quizId/results/:attemptId" element={<ProtectedRoute role="student"><QuizResults /></ProtectedRoute>} />
      <Route path="/ai-tutor" element={<ProtectedRoute role="student"><AITutor /></ProtectedRoute>} />
      <Route path="/performance" element={<ProtectedRoute role="student"><Performance /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><StudentProfile /></ProtectedRoute>} />

      {/* Teacher (placeholder — full content in Prompt 3) */}
      <Route path="/teacher" element={<ProtectedRoute role="teacher"><Placeholder title="Teacher Dashboard" /></ProtectedRoute>} />
      <Route path="/teacher/curriculum" element={<ProtectedRoute role="teacher"><Placeholder title="Curriculum" /></ProtectedRoute>} />
      <Route path="/teacher/students" element={<ProtectedRoute role="teacher"><Placeholder title="Students" /></ProtectedRoute>} />
      <Route path="/teacher/content" element={<ProtectedRoute role="teacher"><Placeholder title="Content" /></ProtectedRoute>} />

      {/* Shared */}
      <Route path="/settings" element={<ProtectedRoute><Placeholder title="Settings" /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
