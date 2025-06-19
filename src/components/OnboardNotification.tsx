import axios from 'axios'
import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { ENV } from '../conf'
import { formatAmount, formatDate, getUserFromToken } from '../lib/utils'
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
import type { OnboardNotificationType } from '../types'
import { Card, CardContent } from './ui/card'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Label } from './ui/label'

export default function OnboardNotification() {
  const [data, setData] = useState<OnboardNotificationType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [file, setFile] = useState<File | null>(null)
  const [filters, setFilters] = useState({
    companyName: '',
    distributorCode: '',
  })
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const user = getUserFromToken()
  const inputRef = useRef<HTMLInputElement>(null)

  const fetchData = async () => {
    setIsLoading(true)

    try {
      const params: any = { page, limit: 10 }
      if (filters.companyName) params.companyName = filters.companyName
      if (filters.distributorCode)
        params.distributorCode = filters.distributorCode
      const res = await axios.get(`${ENV.BACKEND_URL}/onboard`, {
        params,
      })
      setData(res.data.data)
      setTotalPages(res.data.totalPages)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const stableFilters = useMemo(
    () => filters,
    [filters.companyName, filters.distributorCode]
  )

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchData()
    }, 500)

    return () => clearTimeout(timeout)
  }, [stableFilters, page])

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

      fetchData()
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
                <TableHead className='font-semibold'>S.No</TableHead>
                <TableHead className='font-semibold'>Company Name</TableHead>
                <TableHead className='font-semibold'>
                  Distributor Code
                </TableHead>
                <TableHead className='font-semibold'>Lender</TableHead>
                <TableHead className='font-semibold'>Sanction Limit</TableHead>
                <TableHead className='font-semibold'>Limit Live Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 10 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className='h-4 w-6' />
                      </TableCell>
                      <TableCell>
                        <Skeleton className='h-4 w-32' />
                      </TableCell>
                      <TableCell>
                        <Skeleton className='h-4 w-24' />
                      </TableCell>
                      <TableCell>
                        <Skeleton className='h-4 w-20' />
                      </TableCell>
                      <TableCell>
                        <Skeleton className='h-4 w-16' />
                      </TableCell>
                      <TableCell>
                        <Skeleton className='h-4 w-24' />
                      </TableCell>
                    </TableRow>
                  ))
                : data.map((row, idx) => (
                    <TableRow key={row._id} className='font-semibold'>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>{row.companyName}</TableCell>
                      <TableCell>{row.distributorCode}</TableCell>
                      <TableCell>{row.lender}</TableCell>
                      <TableCell className='font-mono'>
                        {formatAmount(row.sanctionLimit)}
                      </TableCell>
                      <TableCell>{formatDate(row.limitLiveDate)}</TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>

          {data.length !== 0 ? (
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
              {isLoading ? null : 'No Data Found'}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
