export type OnboardNotificationType = {
  _id: string
  sno: number
  companyName: string
  distributorCode: string
  lender: string
  sanctionLimit: number
  limitLiveDate: string
  status: string
  anchorId: string
  fundingType: string
}

export type OnboardNotificationResponse = {
  message: string
  data: OnboardNotificationType[]
  skip: number
  page: number
  totalPages: number
  total: number
}

export type OutputLimitType = {
  _id: string
  sno: number
  companyName: string
  distributorCode: string
  city: string
  state: string
  lender: string
  sanctionLimit: number
  operativeLimit: number
  utilisedLimit: number
  availableLimit: number
  overdue: number
  billingStatus: string
}

export type OutputUTRType = {
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
  _id: string
  invoiceNumber: number
  invoiceAmount: number
  invoiceDate: string
  loanAmount: number
  loanDisbursementDate: string
  utr: string
  status: string
}
