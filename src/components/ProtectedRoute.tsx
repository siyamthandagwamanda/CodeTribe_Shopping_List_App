import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAppSelector } from '@/app/hooks'

export default function ProtectedRoute() {
  const { user, status } = useAppSelector((s) => s.auth)
  const location = useLocation()

  
  if (status === 'loading') {
    return (
      <div className="loading-screen">
        <p className="empty-state">Verifying session…</p>
      </div>
    )
  }

  
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
