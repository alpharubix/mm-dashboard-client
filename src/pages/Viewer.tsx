import { ChevronDown, FileDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useState, useMemo } from 'react'
import { useApiQuery } from '../api/hooks'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import { Skeleton } from '../components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table'
import {
  camelCaseToWords,
  cn,
  formatAmount,
  formatDate,
  getCompanyName,
} from '../lib/utils'
import type { ViewerDataType } from '../types'

export default function Viewer() {
  const [selectedAnchor, setSelectedAnchor] = useState('')
  const [page, setPage] = useState(1)

  // 1. Memoize query params to trigger API fetch on page change
  const queryParams = useMemo(() => ({
    page,
    limit: 10
  }), [page])

  const { data, isPending, error } = useApiQuery('/viewer-data', queryParams)

  // 2. Extract pagination metadata from backend response
  const totalPages = data?.pagination?.totalPages || 1
  const totalInvoices = data?.pagination?.total || 0

  // Reset page when selected anchor changes
  useEffect(() => {
    setPage(1)
  }, [selectedAnchor])

  if (error) {
    return (
      <div className='flex justify-center items-center h-screen text-red-500'>
        {error.message}
      </div>
    )
  }

  const getUniqueAnchors = (data: any): string[] => {
    const anchors = new Set<string>()
    data?.onboardData?.forEach((item: any) => anchors.add(item.anchorId))
    data?.credLimit?.forEach((item: any) => anchors.add(item.anchorId))
    data?.invoiceData?.forEach((item: any) => anchors.add(item.anchorId))
    return Array.from(anchors).filter(Boolean)
  }

  const uniqueAnchors = getUniqueAnchors(data?.data)
  const showAnchorSelect = uniqueAnchors.length > 1

  useEffect(() => {
    if (uniqueAnchors.length === 1) {
      setSelectedAnchor(uniqueAnchors[0])
    } else if (uniqueAnchors.length > 1 && !selectedAnchor) {
      setSelectedAnchor(uniqueAnchors[0])
    }
  }, [uniqueAnchors, selectedAnchor])

  const getFilteredData = () => {
    if (!selectedAnchor) return { onboardData: [], credLimit: [], invoiceData: [] }

    return {
      onboardData: data?.data?.onboardData?.filter((item: any) => item.anchorId === selectedAnchor) || [],
      credLimit: data?.data?.credLimit?.filter((item: any) => item.anchorId === selectedAnchor) || [],
      invoiceData: data?.data?.invoiceData?.filter((item: any) => item.anchorId === selectedAnchor) || [],
    }
  }

  const filteredData = getFilteredData()
  const onboard = filteredData.onboardData?.[0]
  const credit = filteredData.credLimit?.[0]

  const sanctionLimit = onboard?.sanctionLimit || 0
  const limitLiveDate = onboard?.limitLiveDate || null
  const limitExpiryDate = credit?.limitExpiryDate || null
  const utilisedLimit = credit?.utilisedLimit || 0
  const operativeLimit = credit?.operativeLimit || 0
  const overdue = credit?.overdue || 0
  const availableLimit = operativeLimit - utilisedLimit
  const currentAvailable = availableLimit - (credit?.pendingInvoices || 0)

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-7xl mx-auto sm:px-6 lg:px-8'>
        {/* Anchor Selection */}
        {showAnchorSelect && (
          <div className='flex items-center justify-end mb-3'>
            <div className='flex items-center gap-4 '>
              <label className=' font-semibold text-gray-700'>Select Anchor:</label>
              <div className='relative'>
                <Select
                  value={selectedAnchor}
                  onValueChange={(value) => setSelectedAnchor(value)}
                >
                  <SelectTrigger className='h-10 bg-white'>
                    <SelectValue placeholder='Select anchor' />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueAnchors.map((anchor: string) => (
                      <SelectItem key={anchor} value={anchor}>
                        {getCompanyName(anchor)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <ChevronDown className='absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none' />
              </div>
            </div>
          </div>
        )}

        {!selectedAnchor ? (
          <Card>
            <CardContent className='text-center py-12'>
              <p className='text-lg text-gray-500'>
                {showAnchorSelect ? 'Please select an anchor to view data' : 'No data available'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Dashboard Cards */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
              <Card className='bg-blue-50 border-blue-200'>
                <CardContent className='pt-6'>
                  <div className='space-y-3'>
                    <div><span className='text-lg font-bold text-blue-900'>Sanction Limit:</span> <span className='text-lg text-blue-900 tracking-wider'>{sanctionLimit ? formatAmount(sanctionLimit) + '/-' : 'NA'}</span></div>
                    <div><span className='text-lg text-blue-900 font-bold'>Operative Limit:</span> <span className='text-lg text-blue-900 tracking-wider'>{operativeLimit ? formatAmount(operativeLimit) + '/-' : 'NA'}</span></div>
                    <div><span className='text-lg text-blue-900 font-bold'>Limit Live Date:</span> <span className='text-lg text-blue-900 tracking-wider'>{formatDate(limitLiveDate) || 'NA'}</span></div>
                    <div><span className='text-lg text-blue-900 font-bold'>Limit Expiry Date:</span> <span className='text-lg text-blue-900 tracking-wider'>{formatDate(limitExpiryDate) || 'NA'}</span></div>
                  </div>
                </CardContent>
              </Card>

              <Card className='bg-amber-50 border-amber-200'>
                <CardContent className='pt-6'>
                  <div className='space-y-3'>
                    <div><span className='text-lg text-amber-900 font-bold'>Utilised Limit:</span> <span className='text-lg text-amber-900 tracking-wider'>{utilisedLimit ? formatAmount(utilisedLimit) + '/-' : 'NA'}</span></div>
                    <div><span className='text-lg text-amber-900 font-bold'>Available Limit:</span> <span className='text-lg text-amber-900 tracking-wider'>{availableLimit >= 0 ? formatAmount(availableLimit) + '/-' : 'NA'}</span></div>
                    <div>
                      <span className="text-lg text-amber-900 font-bold">
                        Current Available: {" "}
                      </span>
                      <span
                        className={`text-lg tracking-wider ${currentAvailable < 0
                          ? "text-red-700 font-bold"
                          : "text-amber-900"
                          }`}
                      >
                        {currentAvailable != null
                          ? formatAmount(currentAvailable) + "/-"
                          : "NA"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className='bg-red-50 border-red-200'>
                <CardContent className='pt-6'>
                  <div>
                    <span className="text-lg font-bold text-red-900">
                      Overdue: {" "}
                    </span>
                    <span
                      className={`text-lg tracking-wider ${overdue > 0 ? "text-red-700 font-semibold" : "text-amber-900"
                        }`}
                    >
                      {overdue ? formatAmount(overdue) + "/-" : "0"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Data Table */}
            <Card>
              <CardContent className='pt-6'>
                <div className='mb-4 flex justify-between items-center'>
                  <h3 className='text-xl font-semibold text-gray-900'>
                    Invoice Details - {getCompanyName(selectedAnchor)}
                  </h3>
                  {totalInvoices > 0 && (
                    <span className='text-sm italic text-gray-500'>Total - {totalInvoices}</span>
                  )}
                </div>

                <div className='overflow-x-auto'>
                  <Table className='text-base whitespace-nowrap'>
                    <TableHeader>
                      <TableRow className='bg-gray-50'>
                        <TableHead className='font-bold text-gray-700'>Invoice Number</TableHead>
                        <TableHead className='font-bold text-gray-700'>Amount</TableHead>
                        <TableHead className='font-bold text-gray-700'>Date</TableHead>
                        <TableHead className='font-bold text-gray-700'>Loan Amount</TableHead>
                        <TableHead className='font-bold text-gray-700'>Disbursement</TableHead>
                        <TableHead className='font-bold text-gray-700'>UTR</TableHead>
                        <TableHead className='font-bold text-gray-700'>Status</TableHead>
                        {/*<TableHead className='font-bold text-gray-700'>PDF</TableHead>*/}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isPending ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <TableRow key={i}><TableCell colSpan={8}><Skeleton className='h-4 w-full' /></TableCell></TableRow>
                        ))
                      ) : filteredData.invoiceData?.length > 0 ? (
                        filteredData.invoiceData.map((inv: ViewerDataType) => (
                          <TableRow key={inv.invoiceNumber} className={cn(inv.status === 'notProcessed' && 'bg-red-50')}>
                            <TableCell>{inv.invoiceNumber}</TableCell>
                            <TableCell>{formatAmount(inv.invoiceAmount)}</TableCell>
                            <TableCell>{formatDate(inv.invoiceDate)}</TableCell>
                            <TableCell>{formatAmount(inv.loanAmount)}</TableCell>
                            <TableCell>{formatDate(inv.loanDisbursementDate) || 'NA'}</TableCell>
                            <TableCell>{inv.utr || 'NA'}</TableCell>
                            <TableCell>{camelCaseToWords(inv.status)}</TableCell>
                            {/*<TableCell>
                              {inv.invoicePdfUrl && (
                                <a href={inv.invoicePdfUrl} target='_blank' rel='noopener noreferrer'>
                                  <FileDown className='h-4 w-4 text-blue-600' />
                                </a>
                              )}
                            </TableCell>*/}
                          </TableRow>
                        ))
                      ) : (
                        <TableRow><TableCell colSpan={8} className='text-center py-8 text-gray-500'>No Data Found</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* 3. Pagination Controls (Mirrored from Onboard.tsx) */}
                {!isPending && filteredData.invoiceData?.length > 0 && (
                  <div className='pt-6 flex justify-center gap-4 items-center border-t mt-4'>
                    <Button
                      onClick={() => setPage((p) => Math.max(p - 1, 1))}
                      disabled={page === 1}
                      variant='outline'
                      size='sm'
                      className='cursor-pointer'
                    >
                      <ChevronLeft className='h-4 w-4' />
                    </Button>
                    <span className='text-sm text-gray-600'>
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                      disabled={page === totalPages}
                      variant='outline'
                      size='sm'
                      className='cursor-pointer'
                    >
                      <ChevronRight className='h-4 w-4' />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
