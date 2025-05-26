import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { getUserFromToken } from '../lib/utils'

export default function ProtectedRoute({
  allowedRoles,
}: {
  allowedRoles?: string
}) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const location = useLocation()
  const user = getUserFromToken()

  useEffect(() => {
    const token = localStorage.getItem('mm_auth_token')
    setIsAuthenticated(!!token)
  }, [])

  if (isAuthenticated === null) return <div>Loading...</div>

  if (!isAuthenticated) {
    return <Navigate to='/login' replace state={{ from: location }} />
  }

  if (allowedRoles && user?.role !== allowedRoles) {
    return <Navigate to='/onboard-notification' replace />
  }

  // Handle role-based redirect on visiting '/'
  if (location.pathname === '/') {
    return (
      <Navigate
        // to={user?.role === 'admin' ? '/input' : '/onboard-notification'}
        to={'/onboard-notification'}
        replace
      />
    )
  }

  return <Outlet />
}
