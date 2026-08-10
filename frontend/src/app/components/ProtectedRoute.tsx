import { Navigate } from 'react-router';
import { useAuth } from '@/app/context/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}