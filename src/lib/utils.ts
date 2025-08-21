import axios from 'axios'
import { clsx, type ClassValue } from 'clsx'
import { format } from 'date-fns'
import { jwtDecode } from 'jwt-decode'
import { unparse } from 'papaparse'
import { toast } from 'sonner'
import { twMerge } from 'tailwind-merge'
import { ENV } from '../conf'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string) {
  return format(date, 'dd-MM-yy')
}

export function setAuthToken() {
  const token = getAuthToken()
  if (token) {
    axios.defaults.headers.common['Authorization'] = `${token}`
  } else {
    delete axios.defaults.headers.common['Authorization']
  }
}

export const formatAmount = (amount: number): string => {
  if (amount === null || amount === undefined) return '0.00'
  return amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

type DecodedToken = {
  id?: string
  username?: string
  companyId?: string
  companyName?: string
  role?: string
}

export function getUserFromToken(): DecodedToken | null {
  const token = localStorage.getItem('mm_auth_token')
  if (!token) return null

  try {
    return jwtDecode<DecodedToken>(token)
  } catch {
    return null
  }
}

export function getAuthToken(): string | null {
  return localStorage.getItem('mm_auth_token')
}

export function camelCaseToWords(s: string) {
  const result = s.replace(/([A-Z])/g, ' $1')
  return result.charAt(0).toUpperCase() + result.slice(1)
}

export const getCompanyName = (companyId: string) => {
  switch (companyId) {
    case 'ckpl':
      return 'CavinKare'
    case 'hwc':
      return 'Himalaya'
    default:
      return companyId
  }
}

export function capitalize(val: string) {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1)
}

export const handleExport = async (queryParams: object) => {
  let toastId: string | number | undefined

  try {
    toastId = toast.loading('Processing CSV export...')
    const res = await axios.get(`${ENV.BACKEND_URL}/invoice-input`, {
      params: queryParams,
    })
    const data = res.data.data
    if (!data.length) {
      toast.dismiss(toastId)
      return toast.error('No data available to export.')
    }

    const transformed = data?.map(({ _id, ...rest }: any) => ({
      'Company Name': rest.companyName,
      'Distributor Code': rest.distributorCode,
      'Beneficiary Name': rest.beneficiaryName,
      'Beneficiary Acc No': rest.beneficiaryAccNo,
      'Bank Name': rest.bankName,
      'IFSC Code': rest.ifscCode,
      Branch: rest.branch,
      'Invoice Number': rest.invoiceNumber,
      'Invoice Amount': rest.invoiceAmount,
      'Invoice Date': format(new Date(rest.invoiceDate), 'dd-MM-yy'),
      'Loan Amount': rest.loanAmount,
      'Loan Disbursement Date': rest.loanDisbursementDate
        ? format(new Date(rest.loanDisbursementDate), 'dd-MM-yy')
        : 'NA',
      UTR: rest.utr || 'NA',
      'Anchor ID': rest.anchorId,
      'Funding Type': rest.fundingType,
      Status: rest.status,
      'Distributor Phone': rest.distributorPhone,
      'Distributor Email': rest.distributorEmail,
    }))

    const csv = unparse(transformed)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.setAttribute(
      'download',
      `anchor_input_${format(new Date(), 'dd-MM-yy')}.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success('Download started', { id: toastId })
  } catch (err) {
    console.error('Export failed:', err)
    // @ts-ignore
    toast.error(`Export failed: ${err.message}`, { id: toastId })
  }
}

export const getDefaultRoute = (role: string) => {
  switch (role) {
    case 'superAdmin':
    case 'admin':
      return '/onboard-customer'
    case 'viewer':
      return '/viewer'
    default:
      return '/unauthorized'
  }
}
