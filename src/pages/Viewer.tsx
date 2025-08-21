import { FileDown, ChevronDown } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Card, CardContent } from '../components/ui/card'
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
  formatAmount,
  formatDate,
  getCompanyName,
} from '../lib/utils'
import type { ViewerDataType } from '../types'
import { useApiQuery } from '../api/hooks'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'

export default function Viewer() {
  const { data, isPending, error } = useApiQuery('/viewer-data')
  const [selectedAnchor, setSelectedAnchor] = useState('')

  if (error) {
    return (
      <div className='flex justify-center items-center h-screen text-red-500'>
        {error.message}
      </div>
    )
  }

  // Get unique anchors from all collections
  const getUniqueAnchors = (data: any): string[] => {
    const anchors = new Set<string>()

    data?.onboardData?.forEach((item: any) => anchors.add(item.anchorId))
    data?.credLimit?.forEach((item: any) => anchors.add(item.anchorId))
    data?.invoiceData?.forEach((item: any) => anchors.add(item.anchorId))

    return Array.from(anchors).filter(Boolean)
  }

  const uniqueAnchors = getUniqueAnchors(data?.data)
  const showAnchorSelect = uniqueAnchors.length > 1

  // Auto-select if only one anchor
  useEffect(() => {
    if (uniqueAnchors.length === 1) {
      setSelectedAnchor(uniqueAnchors[0])
    } else if (uniqueAnchors.length > 1 && !selectedAnchor) {
      // Optionally set first anchor as default
      setSelectedAnchor(uniqueAnchors[0])
    }
  }, [uniqueAnchors, selectedAnchor])

  // Filter data by selected anchor
  const getFilteredData = (): {
    onboardData: any[]
    credLimit: any[]
    invoiceData: any[]
  } => {
    if (!selectedAnchor)
      return { onboardData: [], credLimit: [], invoiceData: [] }

    return {
      onboardData:
        data?.data?.onboardData?.filter(
          (item: any) => item.anchorId === selectedAnchor
        ) || [],
      credLimit:
        data?.data?.credLimit?.filter(
          (item: any) => item.anchorId === selectedAnchor
        ) || [],
      invoiceData:
        data?.data?.invoiceData?.filter(
          (item: any) => item.anchorId === selectedAnchor
        ) || [],
    }
  }

  const filteredData = getFilteredData()
  const onboard = filteredData.onboardData?.[0]
  const credit = filteredData.credLimit?.[0]

  const sanctionLimit = onboard?.sanctionLimit || 0
  const limitLiveDate = onboard?.limitLiveDate || null
  const utilisedLimit = credit?.utilisedLimit || 0
  const overdue = credit?.overdue || 0
  const availableLimit = sanctionLimit - utilisedLimit

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-7xl mx-auto sm:px-6 lg:px-8'>
        {/* Anchor Selection */}
        {showAnchorSelect && (
          <div className='flex items-center justify-end mb-3'>
            <div className='flex items-center gap-4 '>
              <label className=' font-semibold text-gray-700'>
                Select Anchor:
              </label>
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

        {/* Show message if no anchor selected */}
        {!selectedAnchor ? (
          <Card>
            <CardContent className='text-center py-12'>
              <p className='text-lg text-gray-500'>
                {showAnchorSelect
                  ? 'Please select an anchor to view data'
                  : 'No data available'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Dashboard Cards */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
              {/* Sanction Limit Card */}
              <Card className='bg-blue-50 border-blue-200'>
                <CardContent className='pt-6'>
                  <div className='space-y-3'>
                    <div>
                      <span className='text-lg font-bold text-blue-900'>
                        Sanction Limit:
                      </span>{' '}
                      <span className='text-lg text-blue-900 tracking-wider'>
                        {sanctionLimit
                          ? formatAmount(sanctionLimit) + '/-'
                          : 'NA'}
                      </span>
                    </div>
                    <div>
                      <span className='text-lg text-blue-900 font-bold'>
                        Limit Live Date:
                      </span>{' '}
                      <span className='text-lg text-blue-900 tracking-wider'>
                        {formatDate(limitLiveDate) || 'NA'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Utilised Limit Card */}
              <Card className='bg-amber-50 border-amber-200'>
                <CardContent className='pt-6'>
                  <div className='space-y-3'>
                    <div>
                      <span className='text-lg text-amber-900 font-bold'>
                        Utilised Limit:
                      </span>{' '}
                      <span className='text-lg text-amber-900 tracking-wider'>
                        {utilisedLimit
                          ? formatAmount(utilisedLimit) + '/-'
                          : 'NA'}
                      </span>
                    </div>
                    <div>
                      <span className='text-lg text-amber-900 font-bold'>
                        Available Limit:
                      </span>{' '}
                      <span className='text-lg text-amber-900 tracking-wider'>
                        {availableLimit >= 0
                          ? formatAmount(availableLimit) + '/-'
                          : 'NA'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Overdue Card */}
              <Card className='bg-red-50 border-red-200'>
                <CardContent className='pt-6'>
                  <div className='space-y-2'>
                    <div>
                      <span className='text-lg font-bold text-red-900'>
                        Overdue:
                      </span>{' '}
                      <span className='text-lg text-red-900 tracking-wider'>
                        {overdue ? formatAmount(overdue) + '/-' : 'NA'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Data Table */}
            <Card>
              <CardContent className='pt-6'>
                <div className='mb-4'>
                  <h3 className='text-xl font-semibold text-gray-900'>
                    Invoice Details - {getCompanyName(selectedAnchor)}
                  </h3>
                </div>
                <div className='overflow-x-auto'>
                  <Table className='text-base whitespace-nowrap'>
                    <TableHeader>
                      <TableRow className='bg-gray-50'>
                        <TableHead className='font-bold text-gray-700'>
                          Invoice Number
                        </TableHead>
                        <TableHead className='font-bold text-gray-700'>
                          Invoice Amount
                        </TableHead>
                        <TableHead className='font-bold text-gray-700'>
                          Invoice Date
                        </TableHead>
                        <TableHead className='font-bold text-gray-700'>
                          Loan Amount
                        </TableHead>
                        <TableHead className='font-bold text-gray-700'>
                          Loan Disbursement Date
                        </TableHead>
                        <TableHead className='font-bold text-gray-700'>
                          UTR
                        </TableHead>
                        <TableHead className='font-bold text-gray-700'>
                          Status
                        </TableHead>
                        <TableHead className='font-bold text-gray-700'>
                          Invoice PDF
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isPending ? (
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
                          </TableRow>
                        ))
                      ) : filteredData.invoiceData?.length > 0 ? (
                        filteredData.invoiceData.map((inv: ViewerDataType) => (
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
                              {formatDate(inv.loanDisbursementDate) || (
                                <span className='text-gray-400'>NA</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {inv.utr || (
                                <span className='text-gray-400'>NA</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {camelCaseToWords(inv.status)}
                            </TableCell>
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
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={8}
                            className='text-center py-8 text-gray-500'
                          >
                            No invoice data available for{' '}
                            {getCompanyName(selectedAnchor)}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
