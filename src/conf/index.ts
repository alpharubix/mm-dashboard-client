export const ENV = {
  BACKEND_URL: String(import.meta.env.VITE_BACKEND_URL),
}

export const PERMISSIONS = {
  superAdmin: {
    routes: ['onboard-customer', 'credit-limit', 'invoice-utr', 'users'],
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

export const EMAIL_STATUS = {
  NOT_ELIGIBLE: 'notEligible',
  OVERDUE: 'overdue',
  INSUFF_AVAIL_LIMIT: 'insufficientAvailableLimit',
  ELIGIBLE: 'eligible',
  SENT: 'sent',
}

export const INVOICE_STATUS = {
  YET_TO_PROCESS: 'yetToProcess',
  IN_PROGRESS: 'inProgress',
  PROCESSED: 'processed',
  PENDING_WITH_CUSTOMER: 'pendingWithCustomer',
  PENDING_WITH_LENDER: 'pendingWithLender',
  NOT_PROCESSED: 'notProcessed',
}
