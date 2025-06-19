import { PERMISSIONS } from '../conf'
import { getUserFromToken } from '../lib/utils'

export const usePermissions = () => {
  const user = getUserFromToken()

  const userPermissions = user?.role
    ? PERMISSIONS[user.role as keyof typeof PERMISSIONS]
    : null

  const hasRouteAccess = (route: string): boolean => {
    // @ts-ignore
    return userPermissions?.routes.includes(route) ?? false
  }

  const hasAction = (action: string): boolean => {
    // @ts-ignore
    return userPermissions?.actions.includes(action) ?? false
  }

  return { hasRouteAccess, hasAction, user }
}
