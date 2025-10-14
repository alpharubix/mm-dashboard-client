export const ENV = {
  BACKEND_URL: String(import.meta.env.VITE_BACKEND_URL),
}

export const PERMISSIONS = {
  superAdmin: {
    routes: ['onboard-customer', 'credit-limit', 'invoice-utr', 'users', 'email'],
    actions: ['create', 'edit', 'delete', 'view', 'upload', 'download'],
  },
  admin: {
    routes: ['onboard-customer', 'credit-limit', 'invoice-utr'],
    actions: ['view', 'download'],
  },
  viewer: {
    routes: ['viewer'],
    actions: ['view'],
  },
} as const
