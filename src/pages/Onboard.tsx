import axios from 'axios'
import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { ENV } from '../conf'
import {
  camelCaseToWords,
  formatAmount,
  formatDate,
  getUserFromToken,
} from '../lib/utils'
import { Button } from '../components/ui/button'
import { InputFile } from '../components/ui/file-input'
import { Input } from '../components/ui/input'
import { Skeleton } from '../components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table'
import type { OnboardType } from '../types'
import { Card, CardContent } from '../components/ui/card'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Label } from '../components/ui/label'
import { useApiQuery } from '../api/hooks'
import useDebounce from '../hooks/use-debounce'

export default function Onboard() {
  const [file, setFile] = useState<File | null>(null)
  const [filters, setFilters] = useState({
    companyName: '',
    distributorCode: '',
  })
  const [page, setPage] = useState(1)

  const user = getUserFromToken()
  const inputRef = useRef<HTMLInputElement>(null)
  const debouncedFilters = useDebounce(filters, 500)

  // Memoized query params
  const queryParams = useMemo(() => {
    const params: any = { page, limit: 10 }
    if (debouncedFilters.companyName)
      params.companyName = debouncedFilters.companyName
    if (debouncedFilters.distributorCode)
      params.distributorCode = debouncedFilters.distributorCode
    return params
  }, [debouncedFilters, page])

  const { data, isPending, error, refetch } = useApiQuery(
    '/onboard',
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
    if (e.target.files?.[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleCancel = () => {
    setFile(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleUpload = async () => {
    if (!file) return

    const formData = new FormData()
    formData.append('csvfile', file)

    try {
      const res = await axios.post(
        `${ENV.BACKEND_URL}/onboard-upload`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      )

      toast.success(res.data.message || 'Upload successful')

      // fetchData()
      refetch()
      setFile(null)
      if (inputRef.current) inputRef.current.value = ''
    } catch (err) {
      // @ts-ignore
      const { message, duplicates } = err.response?.data || {}

      const duplicateInfo = duplicates?.length
        ? ` (${duplicates.join(', ')})`
        : ''
      toast.error(
        // @ts-ignore
        `${message || `Upload failed ${err.message}`}${duplicateInfo}`
      )

      console.error('Upload failed', err)
    }
  }

  const handleClearFilter = () => {
    setFilters({ companyName: '', distributorCode: '' })
    setPage(1)
  }

  useEffect(() => {
    setPage(1)
  }, [debouncedFilters.companyName, debouncedFilters.distributorCode])

  return (
    <>
      <Card>
        <div className='flex gap-6 flex-wrap max-w-5xl items-end px-6'>
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
                setFilters((f) => {
                  return { ...f, companyName: e.target.value }
                })
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
                setFilters((f) => {
                  return { ...f, distributorCode: e.target.value }
                })
              }
              className='border py-5 text-base'
            />
          </div>
          {/* <Button
            variant='outline'
            onClick={handleClearFilter}
            className='text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer mb-px'
          >
            Clear
            </Button> */}

          {user?.role === 'superAdmin' && (
            <div className='flex items-center gap-4 flex-wrap'>
              <div className='space-y-2 max-w-lg'>
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
            </div>
          )}
        </div>
        <span className='text-sm italic text-gray-500 ml-6 inline'>
          {data?.total ? `Total - ${data?.total}` : null}
        </span>
        <CardContent className=''>
          <Table className='text-base whitespace-nowrap'>
            <TableHeader className='tracking-wide'>
              <TableRow className='bg-gray-50'>
                <TableHead className='font-bold text-gray-700'>
                  Company Name
                </TableHead>
                <TableHead className='font-bold text-gray-700'>
                  Distributor Code
                </TableHead>
                <TableHead className='font-bold text-gray-700'>
                  Lender
                </TableHead>
                <TableHead className='font-bold text-gray-700'>
                  Sanction Limit
                </TableHead>
                <TableHead className='font-bold text-gray-700'>
                  Limit Live Date
                </TableHead>
                <TableHead className='font-bold text-gray-700'>
                  Limit Expiry Date
                </TableHead>
                <TableHead className='font-bold text-gray-700'>
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isPending
                ? Array.from({ length: 10 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className='h-5 w-32' />
                      </TableCell>
                      <TableCell>
                        <Skeleton className='h-5 w-24' />
                      </TableCell>
                      <TableCell>
                        <Skeleton className='h-5 w-20' />
                      </TableCell>
                      <TableCell>
                        <Skeleton className='h-5 w-16' />
                      </TableCell>
                      <TableCell>
                        <Skeleton className='h-5 w-24' />
                      </TableCell>
                      <TableCell>
                        <Skeleton className='h-5 w-24' />
                      </TableCell>
                      <TableCell>
                        <Skeleton className='h-5 w-24' />
                      </TableCell>
                    </TableRow>
                  ))
                : data.data.map((row: OnboardType, idx: number) => (
                    <TableRow key={row._id} className=''>
                      <TableCell>{row.companyName}</TableCell>
                      <TableCell>{row.distributorCode}</TableCell>
                      <TableCell>{row.lender}</TableCell>
                      <TableCell className=''>
                        {formatAmount(row.sanctionLimit)}
                      </TableCell>
                      <TableCell>
                        {row.limitLiveDate
                          ? formatDate(row.limitLiveDate)
                          : null}
                      </TableCell>
                      <TableCell>
                        {row.limitExpiryDate
                          ? formatDate(row.limitExpiryDate)
                          : null}
                      </TableCell>
                      <TableCell
                        className={
                          row.status === 'active'
                            ? 'text-green-500'
                            : 'text-orange-500'
                        }
                      >
                        {camelCaseToWords(row.status)}
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>

          {data?.data?.length !== 0 ? (
            <>
              <div className='pt-4 flex justify-center gap-4 items-center'>
                <Button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className='cursor-pointer text-2xl'
                  variant={'outline'}
                  size={'sm'}
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
