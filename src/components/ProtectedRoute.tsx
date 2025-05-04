import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

export default function ProtectedRoute() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const location = useLocation()

  useEffect(() => {
    const token = localStorage.getItem('mm_auth_token')
    setIsAuthenticated(!!token)
  }, [])

  if (isAuthenticated === null) {
    // Optionally show a loader or return null while checking authentication
    return <div>Loading...</div>
  }

  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to={`/login`} replace state={{ from: location }} />
  )
}
