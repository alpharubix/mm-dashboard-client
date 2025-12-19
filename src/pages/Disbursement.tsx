import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Skeleton } from '../components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table'
import { INV_STATUS } from '../conf'
import { cn, getUserFromToken } from '../lib/utils'

import { useApiQuery } from '../api/hooks'
import useDebounce from '../hooks/use-debounce'

import EmailContainer from '@/components/EmailDrawer'
import { useAnchorIdStore } from '@/store/anchoIdStore'
import type { InvoiceType } from '../types'

export default function Invoice() {
  const user = getUserFromToken()
  const [page, setPage] = useState(1)
  const { anchorId } = useAnchorIdStore()

  const [filters, setFilters] = useState<{
    companyName: string
    distributorCode: string
    anchorId: string
  }>({
    companyName: '',
    distributorCode: '',
    anchorId: anchorId,
  })
  const debouncedFilters = useDebounce(filters, 500)
  const queryParams = useMemo(() => {
    const params: any = { page, limit: 10 }
    if (debouncedFilters.companyName)
      params.companyName = debouncedFilters.companyName
    if (debouncedFilters.distributorCode)
      params.distributorCode = debouncedFilters.distributorCode
    if (debouncedFilters.anchorId) params.anchorId = debouncedFilters.anchorId
    return params
  }, [debouncedFilters, page])

  const { data, isPending, error, refetch } = useApiQuery(
    '/eligible-email-count',
    queryParams
  )

  const totalPages = data?.totalPages || 1

  useEffect(() => {
    setPage(1)
  }, [debouncedFilters.companyName, debouncedFilters.distributorCode])

  if (error) {
    return (
      <div className='flex justify-center items-center h-screen text-red-500'>
        {error.message}
      </div>
    )
  }
  // console.log(data?.data[0]?.invoiceNumbers)
  return (
    <>
      <Card>
        <div className='flex items-center flex-wrap px-6 gap-9'>
          <div className='space-y-2'>
            <Label
              htmlFor='company-name'
              className='text-sm font-medium text-gray-700'
            >
              Company name
            </Label>
            <Input
              id='company-name'
              placeholder='Example company'
              value={filters.companyName}
              onChange={(e) =>
                setFilters((f) => ({ ...f, companyName: e.target.value }))
              }
              className='h-10'
            />
          </div>

          <div className='space-y-2'>
            <Label
              htmlFor='distributor-code'
              className='text-sm font-medium text-gray-700'
            >
              Distributor code
            </Label>
            <Input
              id='distributor-code'
              placeholder='ex: 123456'
              value={filters.distributorCode}
              onChange={(e) =>
                setFilters((f) => ({ ...f, distributorCode: e.target.value }))
              }
              className='h-10'
            />
          </div>
        </div>
        <span className='text-sm italic text-gray-500 ml-6 inline'>
          {data?.total ? `Total - ${data?.total}` : null}
        </span>
        <CardContent>
          <div className='overflow-x-auto'>
            <Table className='text-base whitespace-nowrap table-fixed'>
              <TableHeader className='tracking-wide'>
                <TableRow className='bg-gray-50'>
                  <TableHead className='font-bold text-gray-700 '>
                    Company Name
                  </TableHead>
                  <TableHead className='font-bold text-gray-700 '>
                    Distributor Code
                  </TableHead>
                  {user?.role === 'superAdmin' && (
                    <>
                      <TableHead className='font-bold  text-gray-700 min-w-28 w-[200px] '>
                        Disbursement
                      </TableHead>
                    </>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isPending
                  ? Array.from({ length: 10 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className='h-4 w-32' />
                        </TableCell>
                        <TableCell>
                          <Skeleton className='h-4 w-32' />
                        </TableCell>
                        <TableCell>
                          <Skeleton className='h-4 w-32' />
                        </TableCell>
                      </TableRow>
                    ))
                  : data?.data?.map((item: InvoiceType, index: any) => (
                      <TableRow
                        key={item.distributorCode}
                        className={cn(
                          'group transition-colors *:truncate *:overflow-hidden',
                          item.status === INV_STATUS.NOT_PROCESSED
                            ? 'bg-red-50'
                            : 'bg-white'
                        )}
                      >
                        <TableCell
                          className={cn(
                            'sticky left-0 z-20 overflow-hidden',
                            item.status === INV_STATUS.NOT_PROCESSED
                              ? 'bg-red-50 group-hover:bg-red-100'
                              : 'bg-white group-hover:bg-muted'
                          )}
                        >
                          {item.companyName}
                        </TableCell>

                        <TableCell
                          className={cn(
                            'sticky left-[200px] z-10',
                            item.status === INV_STATUS.NOT_PROCESSED
                              ? 'bg-red-50 group-hover:bg-red-100'
                              : 'bg-white group-hover:bg-muted'
                          )}
                        >
                          {item.distributorCode}
                        </TableCell>

                        <TableCell className='bg-white group-hover:bg-muted'>
                          <EmailContainer
                            distributorCode={item.distributorCode}
                            invoiceNumbers={item.invoiceNumbers}
                            totalEligibleInvoiceCount={
                              item.totalEligibleInvoiceCount
                            }
                            onStatusUpdated={refetch}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
            {data?.data?.length !== 0 ? (
              <>
                <div className='mt-4 flex justify-center gap-4 items-center'>
                  <Button
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    className='cursor-pointer text-2xl'
                    variant={'outline'}
                  >
                    <ChevronLeft className='h-4 w-4' />
                  </Button>
                  <span className='text-sm text-gray-600'>
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    disabled={page === totalPages}
                    className='cursor-pointer text-2xl'
                    variant={'outline'}
                  >
                    <ChevronRight className='h-4 w-4' />
                  </Button>
                </div>
              </>
            ) : (
              <div className='text-center text-2xl m-3'>
                {isPending ? null : 'No Data Found'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  )
}
