import { Navigate, Route, Routes } from 'react-router-dom';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import RegisterSuccess from '@/pages/auth/RegisterSuccess';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { NotFound } from '@/pages/Placeholder';
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
import TeacherDashboard from '@/pages/teacher/TeacherDashboard';
import Curriculum from '@/pages/teacher/Curriculum';
import TopicDetailTeacher from '@/pages/teacher/TopicDetailTeacher';
import Students from '@/pages/teacher/Students';
import StudentDetail from '@/pages/teacher/StudentDetail';
import ContentHub from '@/pages/teacher/ContentHub';
import AuthoringTopic from '@/pages/teacher/AuthoringTopic';
import AuthoringLesson from '@/pages/teacher/AuthoringLesson';
import AuthoringQuiz from '@/pages/teacher/AuthoringQuiz';
import AuthoringQuestion from '@/pages/teacher/AuthoringQuestion';
import TeacherProfile from '@/pages/teacher/TeacherProfile';
import Settings from '@/pages/Settings';
import Notifications from '@/pages/Notifications';

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

      {/* Teacher */}
      <Route path="/teacher" element={<ProtectedRoute role="teacher"><TeacherDashboard /></ProtectedRoute>} />
      <Route path="/teacher/curriculum" element={<ProtectedRoute role="teacher"><Curriculum /></ProtectedRoute>} />
      <Route path="/teacher/curriculum/:topicId" element={<ProtectedRoute role="teacher"><TopicDetailTeacher /></ProtectedRoute>} />
      <Route path="/teacher/students" element={<ProtectedRoute role="teacher"><Students /></ProtectedRoute>} />
      <Route path="/teacher/students/:studentId" element={<ProtectedRoute role="teacher"><StudentDetail /></ProtectedRoute>} />
      <Route path="/teacher/content" element={<ProtectedRoute role="teacher"><ContentHub /></ProtectedRoute>} />
      <Route path="/teacher/content/topics/new" element={<ProtectedRoute role="teacher"><AuthoringTopic /></ProtectedRoute>} />
      <Route path="/teacher/content/lessons/new" element={<ProtectedRoute role="teacher"><AuthoringLesson /></ProtectedRoute>} />
      <Route path="/teacher/content/quizzes/new" element={<ProtectedRoute role="teacher"><AuthoringQuiz /></ProtectedRoute>} />
      <Route path="/teacher/content/questions/new" element={<ProtectedRoute role="teacher"><AuthoringQuestion /></ProtectedRoute>} />
      <Route path="/teacher/profile" element={<ProtectedRoute role="teacher"><TeacherProfile /></ProtectedRoute>} />

      {/* Shared */}
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
