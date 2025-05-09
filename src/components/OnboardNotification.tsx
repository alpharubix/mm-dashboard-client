import axios from 'axios'
import { useEffect, useMemo, useRef, useState } from 'react'
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

type OnboardNotificationType = {
  _id: string
  sno: number
  companyName: string
  distributorCode: string
  lender: string
  sanctionLimit: number
  limitLiveDate: string
}

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
      console.log({ filters })
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
    if (e.target.files?.[0]) setFile(e.target.files[0])
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
      await axios.post(`${ENV.BACKEND_URL}/onboard-upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      fetchData()
      setFile(null)
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    } catch (er) {
      console.error('Upload failed', er)
    }
  }

  const handleClearFilter = () => {
    setFilters({ companyName: '', distributorCode: '' })
    setPage(1)
  }

  return (
    <>
      <div className='flex gap-2 mb-4 max-w-md'>
        <Input
          placeholder='Company name'
          value={filters.companyName}
          onChange={(e) =>
            setFilters((f) => ({ ...f, companyName: e.target.value }))
          }
        />
        <Input
          placeholder='Distributor code'
          value={filters.distributorCode}
          onChange={(e) =>
            setFilters((f) => ({ ...f, distributorCode: e.target.value }))
          }
        />
        {/* <Button
          onClick={fetchData}
          variant={'outline'}
          className='cursor-pointer'
        >
          Apply
        </Button> */}
        {(filters.companyName || filters.distributorCode) && (
          <Button
            variant='ghost'
            onClick={handleClearFilter}
            className='text-red-500 cursor-pointer'
          >
            Clear
          </Button>
        )}
      </div>
      <Table className='text-base'>
        <TableHeader>
          <TableRow>
            <TableHead className='whitespace-nowrap'>S.No</TableHead>
            <TableHead className='whitespace-nowrap'>Company Name</TableHead>
            <TableHead className='whitespace-nowrap'>
              Distributor Code
            </TableHead>
            <TableHead className='whitespace-nowrap'>Lender</TableHead>
            <TableHead className='whitespace-nowrap'>Sanction Limit</TableHead>
            <TableHead className='whitespace-nowrap'>Limit Live Date</TableHead>
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
                <TableRow key={row._id}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{row.companyName}</TableCell>
                  <TableCell>{row.distributorCode}</TableCell>
                  <TableCell>{row.lender}</TableCell>
                  <TableCell>{formatAmount(row.sanctionLimit)}</TableCell>
                  <TableCell>{formatDate(row.limitLiveDate)}</TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>
      <div className='mt-4 flex justify-center gap-4 items-center'>
        <Button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className='cursor-pointer text-2xl'
          variant={'outline'}
        >
          ←
        </Button>
        <span className='font-bold'>
          Page {page} of {totalPages}
        </span>
        <Button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          className='cursor-pointer text-2xl'
          variant={'outline'}
        >
          →
        </Button>
      </div>
      {user?.role === 'admin' && (
        <div className='mt-4 flex gap-4 flex-col'>
          <InputFile onChange={handleFileChange} ref={inputRef} />
          <div>
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
      )}
    </>
  )
}
