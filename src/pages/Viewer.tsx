import { FileDown } from 'lucide-react'
// import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Skeleton } from '../components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table'
import { formatAmount, formatDate } from '../lib/utils'
import type { ViewerDataType } from '../types'

const viewerData: ViewerDataType[] = [
  {
    _id: '1',
    invoiceNumber: 235235,
    invoiceAmount: 85000,
    invoiceDate: '2024-03-15',
    loanAmount: 65000,
    loanDisbursementDate: '2024-03-16', // placeholder
    utr: 'UTR1234561', // placeholder
    status: 'Disbursed', // placeholder
  },
  {
    _id: '2',
    invoiceNumber: 642343,
    invoiceAmount: 120000,
    invoiceDate: '2024-03-10',
    loanAmount: 95000,
    loanDisbursementDate: '2024-03-11',
    utr: 'UTR1234562',
    status: 'Disbursed',
  },
  {
    _id: '3',
    invoiceNumber: 345253,
    invoiceAmount: 75000,
    invoiceDate: '2024-03-08',
    loanAmount: 58000,
    loanDisbursementDate: '2024-03-09',
    utr: 'UTR1234563',
    status: 'Disbursed',
  },
]

export default function Viewer() {
  // const [isLoading, setIsLoading] = useState(false)
  const isLoading = true

  return (
    <>
      <div className='min-h-screen bg-gray-50'>
        {/* Header */}
        <div className='bg-white shadow-sm border-b'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='flex justify-between items-center py-4'>
              <h1 className='text-2xl font-bold text-gray-900'>MeraMerchant</h1>
              <div className='flex items-center space-x-6'>
                <span className='text-sm text-gray-600'>
                  Dist Name - Someone's Agency
                </span>
                <span className='text-sm text-gray-600'>Dist Code - 8970</span>
                <button className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          {/* Dashboard Cards */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
            {/* Sanction Limit Card */}
            <Card className='bg-blue-50 border-blue-200'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-lg font-semibold text-blue-900'>
                  Sanction Limit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  <p className='text-2xl font-bold text-blue-900'>4,21,239/-</p>
                  <p className='text-sm text-blue-700'>
                    Limit Live Date: 14-03-25
                  </p>
                  <p className='text-sm text-blue-700'>Anchor: CavinKare</p>
                </div>
              </CardContent>
            </Card>

            {/* Utilised Limit Card */}
            <Card className='bg-amber-50 border-amber-200'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-lg font-semibold text-amber-900'>
                  Utilised Limit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  <p className='text-2xl font-bold text-amber-900'>
                    2,21,239/-
                  </p>
                  <p className='text-sm text-amber-700'>
                    Available Limit: 14,980/-
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Overdue Card */}
            <Card className='bg-red-50 border-red-200'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-lg font-semibold text-red-900'>
                  Overdue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  <p className='text-2xl font-bold text-red-900'>1,21,239/-</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Data Table */}
          <Card>
            <CardHeader>
              <CardTitle className='text-xl font-semibold text-gray-900'>
                Invoice Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='overflow-x-auto'>
                <Table className='text-base whitespace-nowrap'>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice Number</TableHead>
                      <TableHead>Invoice Amount</TableHead>
                      <TableHead>Invoice Date</TableHead>
                      <TableHead>Loan Amount</TableHead>
                      <TableHead>Loan Disbursement Date</TableHead>
                      <TableHead>UTR</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Invoice PDF</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading
                      ? // Loading skeleton rows
                        Array.from({ length: 5 }).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell>
                              <Skeleton className='h-4 w-32' />
                            </TableCell>
                            <TableCell>
                              <Skeleton className='h-4 w-24' />
                            </TableCell>
                            <TableCell>
                              <Skeleton className='h-4 w-32' />
                            </TableCell>
                            <TableCell>
                              <Skeleton className='h-4 w-40' />
                            </TableCell>
                            <TableCell>
                              <Skeleton className='h-4 w-24' />
                            </TableCell>
                            <TableCell>
                              <Skeleton className='h-4 w-20' />
                            </TableCell>
                            <TableCell>
                              <Skeleton className='h-4 w-20' />
                            </TableCell>
                            <TableCell>
                              <Skeleton className='h-4 w-28' />
                            </TableCell>
                            <TableCell>
                              <Skeleton className='h-4 w-16' />
                            </TableCell>
                            <TableCell>
                              <Skeleton className='h-4 w-24' />
                            </TableCell>
                            <TableCell>
                              <Skeleton className='h-4 w-24' />
                            </TableCell>
                            <TableCell>
                              <Skeleton className='h-4 w-24' />
                            </TableCell>
                          </TableRow>
                        ))
                      : // Actual data rows
                        viewerData?.map((inv: any) => (
                          <TableRow key={inv.invoiceNumber}>
                            <TableCell>{inv.invoiceNumber}</TableCell>
                            <TableCell>
                              {formatAmount(inv.invoiceAmount)}
                            </TableCell>
                            <TableCell>{formatDate(inv.invoiceDate)}</TableCell>
                            <TableCell>
                              {formatAmount(inv.loanAmount)}
                            </TableCell>
                            <TableCell>
                              {formatDate(inv.loanDisbursementDate)}
                            </TableCell>
                            <TableCell>{inv.utr}</TableCell>
                            <TableCell>{inv.status}</TableCell>
                            <TableCell>
                              {inv.invoicePdfUrl ? (
                                <a
                                  href={inv.invoicePdfUrl}
                                  target='_blank'
                                  rel='noopener noreferrer'
                                  className='inline-flex items-center text-blue-600 hover:text-blue-800'
                                >
                                  <FileDown className='h-4 w-4' />
                                </a>
                              ) : (
                                <span className='text-gray-400'>NA</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
