import axios from 'axios'
import { useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { ENV } from '../conf'
import {
  camelCaseToWords,
  cn,
  formatAmount,
  getUserFromToken,
} from '../lib/utils'
import { Button } from './ui/button'
import { InputFile } from './ui/file-input'
import { Input } from './ui/input'
import { Skeleton } from './ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table'
import type { OutputLimitType } from '../types'
import { Card, CardContent } from './ui/card'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Label } from './ui/label'
import useDebounce from '../hooks/use-debounce'
import { useApiQuery } from '../api/hooks'

export default function OutputLimit() {
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({
    companyName: '',
    distributorCode: '',
  })
  const [file, setFile] = useState<File | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const user = getUserFromToken()
  const debouncedFilters = useDebounce(filters, 500)
  
  const queryParams = useMemo(() => {
    const params: any = { page, limit: 10 }
    if (debouncedFilters.companyName)
      params.companyName = debouncedFilters.companyName
    if (debouncedFilters.distributorCode)
      params.distributorCode = debouncedFilters.distributorCode
    return params
  }, [debouncedFilters, page])

  const { data, isPending, error, refetch } = useApiQuery(
    '/credit-limit',
    queryParams
  )
  const totalPages = data?.totalPages || 1
  if (error) {
    return (
      <div className='flex justify-center items-center h-screen text-red-500'>
        {error.message}
      </div>
    )
  }
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0])
  }

  const handleUpload = async () => {
    if (!file) return

    const form = new FormData()
    form.append('csvfile', file)

    try {
      const res = await axios.post(
        `${ENV.BACKEND_URL}/output-limit-upload`,
        form,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      )

      toast.success(res.data.message || 'Upload successful')

      setFile(null)
      if (inputRef.current) inputRef.current.value = ''
      setPage(1)
      refetch()
    } catch (err) {
      // @ts-ignore
      const { message, duplicates } = err.response?.data || {}

      const duplicateInfo = duplicates?.length
        ? ` (${duplicates.join(', ')})`
        : ''

      toast.error(
        // @ts-ignore
        `${message || `Upload failed ${message}`}${duplicateInfo}`
      )
      console.error(err)
    }
  }

  const handleCancel = () => {
    setFile(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleClearFilter = () => {
    setFilters({ companyName: '', distributorCode: '' })
    setPage(1)
  }

  return (
    <>
      <Card>
        <div className='flex flex-wrap gap-6 max-w-5xl items-end px-6'>
          <div className='flex items-start flex-col gap-2'>
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
              className='border py-5 text-base'
            />
          </div>
          <div className='flex items-start flex-col gap-2 '>
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
              className='border py-5 text-base'
            />
          </div>
          <Button
            variant='outline'
            onClick={handleClearFilter}
            className='text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer mb-px'
          >
            Clear
          </Button>
        </div>
        {/* {user?.role === 'superAdmin' && (
          <div className='mt-6 flex items-center gap-3'>
            <InputFile onChange={handleFileChange} ref={inputRef} />
            <div className='flex gap-2'>
              <Button
                onClick={handleUpload}
                disabled={!file}
                variant='outline'
                className='cursor-pointer'
              >
                Upload CSV
              </Button>
              {file && (
                <Button
                  onClick={handleCancel}
                  disabled={!file}
                  variant='ghost'
                  className='text-red-500 cursor-pointer'
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        )} */}
        {user?.role === 'superAdmin' && (
          <div className='space-y-2 max-w-lg mx-6'>
            <Label className='text-sm font-medium text-gray-700'>
              Upload File
            </Label>
            <div className='flex gap-4 items-center'>
              <InputFile
                onChange={handleFileChange}
                ref={inputRef}
                file={file}
              />
              {file && (
                <div className='flex gap-2'>
                  <Button onClick={handleUpload} disabled={!file}>
                    Upload CSV
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant='ghost'
                    className='text-red-500'
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        <CardContent>
          <Table className='text-base whitespace-nowrap'>
            <TableHeader>
              <TableRow className='bg-gray-50'>
                {[
                  'S.No',
                  'Company Name',
                  'Distributor Code',
                  'City',
                  'State',
                  'Lender',
                  'Sanction Limit',
                  'Operative Limit',
                  'Utilised Limit',
                  'Available Limit',
                  'Overdue',
                  'Billing Status',
                ].map((h) => (
                  <TableHead className='font-semibold' key={h}>
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isPending
                ? Array.from({ length: 10 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array(12)
                        .fill(0)
                        .map((_, j) => (
                          <TableCell key={j}>
                            <Skeleton className='h-4 w-16' />
                          </TableCell>
                        ))}
                    </TableRow>
                  ))
                : data?.data?.map((item: OutputLimitType, idx: number) => (
                    <TableRow className='font-semibold' key={item._id}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>{item.companyName}</TableCell>
                      <TableCell>{item.distributorCode}</TableCell>
                      <TableCell>{item.city}</TableCell>
                      <TableCell>{item.state}</TableCell>
                      <TableCell>{item.lender}</TableCell>
                      <TableCell className='font-mono'>
                        {formatAmount(item.sanctionLimit)}
                      </TableCell>
                      <TableCell className='font-mono'>
                        {formatAmount(item.operativeLimit)}
                      </TableCell>
                      <TableCell className='font-mono'>
                        {formatAmount(item.utilisedLimit)}
                      </TableCell>
                      <TableCell className='font-mono'>
                        {formatAmount(item.availableLimit)}
                      </TableCell>
                      <TableCell className='font-mono'>
                        {formatAmount(item.overdue)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          `${
                            item.billingStatus.toLowerCase() === 'positive'
                              ? 'text-green-500'
                              : 'text-orange-500'
                          }`
                        )}
                      >
                        {camelCaseToWords(item.billingStatus)}
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
        </CardContent>
      </Card>
    </>
  )
}
