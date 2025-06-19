import { Navigate, useLocation } from 'react-router-dom'
import { usePermissions } from '../hooks/use-permissions'
import NotFound from '../pages/NotFound'

type ProtectedRouteProps = {
  children: React.ReactNode
  requiredRoute?: string
}

export default function ProtectedRoute({
  children,
  requiredRoute,
}: ProtectedRouteProps) {
  const { hasRouteAccess, user } = usePermissions()
  const location = useLocation()

  // Check if user is authenticated
  const token = localStorage.getItem('mm_auth_token')
  if (!token) {
    return <Navigate to='/login' replace state={{ from: location }} />
  }

  // Check route permission
  if (requiredRoute && !hasRouteAccess(requiredRoute)) {
    console.log(requiredRoute, hasRouteAccess(requiredRoute))
    // return <Navigate to='/unauthorized' replace />
    return <NotFound />
  }

  return <>{children}</>
}
