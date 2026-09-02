import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: 'student' | 'teacher' }) {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const location = useLocation();

  if (isLoading) return <div className="flex min-h-screen items-center justify-center bg-ink-50 dark:bg-ink-900"><div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-500" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;
  if (role && user?.role !== role) return <Navigate to={user?.role === 'teacher' ? '/teacher' : '/dashboard'} replace />;
  return <>{children}</>;
}

export function RoleGate({ roles, children }: { roles: Array<'student' | 'teacher'>; children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  return user && roles.includes(user.role) ? <>{children}</> : null;
}
