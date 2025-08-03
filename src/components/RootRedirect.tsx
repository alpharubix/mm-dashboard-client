import { Navigate } from 'react-router-dom'
import { getUserFromToken } from '../lib/utils'

export default function RootRedirect() {
  const user = getUserFromToken()
  if (!user) return <Navigate to='/login' replace />

  const defaultRoute = user?.role === 'viewer' ? '/viewer' : '/onboard-customer'

  return <Navigate to={defaultRoute} replace />
}
