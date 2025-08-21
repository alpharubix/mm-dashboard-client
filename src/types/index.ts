export type OnboardType = {
  _id: string
  companyName: string
  distributorCode: string
  lender: string
  sanctionLimit: number
  limitLiveDate: string
  status: string
  anchorId: string
  fundingType: string
  limitExpiryDate: string
}

export type OnboardResponse = {
  message: string
  data: OnboardType[]
  skip: number
  page: number
  totalPages: number
  total: number
}

export type CreditLimitType = {
  _id: string
  companyName: string
  distributorCode: string
  city: string
  state: string
  lender: string
  sanctionLimit: number
  operativeLimit: number
  utilisedLimit: number
  availableLimit: number
  pendingInvoices: number
  currentAvailable: number
  fundingType: string
  overdue: number
  limitExpiryDate: string
  billingStatus: string
}

export type InvoiceType = {
  _id: string
  companyName: string
  distributorCode: string
  beneficiaryName: string
  beneficiaryAccNo: string
  bankName: string
  ifscCode: string
  branch: string
  invoiceNumber: number
  invoiceAmount: number
  invoiceDate: string
  loanAmount: number
  loanDisbursementDate: string
  utr: string
  status: string
  invoicePdfUrl: string
}

export type UserType = {
  _id: string
  username: string
  companyId: string
  companyName: string
  role: string
}

export type ViewerDataType = {
  invoiceNumber: number
  anchorId: string
  invoiceAmount: number
  invoiceDate: string
  loanAmount: number
  loanDisbursementDate: string
  utr: string
  status: string
  invoicePdfUrl?: string
}
