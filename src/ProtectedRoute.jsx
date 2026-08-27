import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
export default function ProtectedRoute({ children }) {
  const { user, loading, configured } = useAuth()
  if (loading) {
    return <div className="min-h-screen grid place-items-center text-pulse-muted text-sm">Loading…</div>
  }
  // If Firebase not configured, allow app shell so developer can see UI
  if (!configured) return children
  if (!user) return <Navigate to="/login" replace />
  return children
}
