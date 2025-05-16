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
  return format(date, 'dd-MM-yyyy')
}

export const formatAmount = (amount: number): string => {
  return amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

type DecodedToken = {
  id?: string
  email?: string
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

export function capitalize(val: string) {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1)
}

export const handleExport = async () => {
  let toastId: string | number | undefined

  try {
    toastId = toast.loading('Processing CSV export...')
    const res = await axios.get(`${ENV.BACKEND_URL}/input`)
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
      'Invoice Date': format(new Date(rest.invoiceDate), 'dd-MM-yyyy'),
      'Loan Amount (Excl. Credit Balance)': rest.loanAmount,
    }))

    const csv = unparse(transformed)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.setAttribute(
      'download',
      `anchor_input_${format(new Date(), 'dd-MM-yyyy')}.csv`
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
