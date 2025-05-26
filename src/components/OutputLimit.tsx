import axios from 'axios'
import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { ENV } from '../conf'
import { formatAmount, getUserFromToken } from '../lib/utils'
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

type OutputLimitType = {
  _id: string
  sno: number
  companyName: string
  distributorCode: string
  city: string
  state: string
  lender: string
  sanctionLimit: number
  operativeLimit: number
  utilisedLimit: number
  availableLimit: number
  overdue: number
  billingStatus: string
}

export default function OutputLimit() {
  const [data, setData] = useState<OutputLimitType[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({
    companyName: '',
    distributorCode: '',
  })
  const [file, setFile] = useState<File | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const user = getUserFromToken()
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const params: any = { page, limit: 10 }
      if (filters.companyName) params.companyName = filters.companyName
      if (filters.distributorCode)
        params.distributorCode = filters.distributorCode

      const res = await axios.get(`${ENV.BACKEND_URL}/output-limit`, {
        params,
      })
      setData(res.data.data)
      setTotalPages(res.data.totalPages)
    } catch (err) {
      console.error(err)
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
      fetchData()
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
      {user?.role === 'admin' && (
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
      )}
      <Table className='text-base'>
        <TableHeader>
          <TableRow>
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
              <TableHead key={h} className='whitespace-nowrap'>
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
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
            : data?.map((item) => (
                <TableRow key={item._id}>
                  <TableCell>{item.sno}</TableCell>
                  <TableCell>{item.companyName}</TableCell>
                  <TableCell>{item.distributorCode}</TableCell>
                  <TableCell>{item.city}</TableCell>
                  <TableCell>{item.state}</TableCell>
                  <TableCell>{item.lender}</TableCell>
                  <TableCell>{formatAmount(item.sanctionLimit)}</TableCell>
                  <TableCell>{formatAmount(item.operativeLimit)}</TableCell>
                  <TableCell>{formatAmount(item.utilisedLimit)}</TableCell>
                  <TableCell>{formatAmount(item.availableLimit)}</TableCell>
                  <TableCell>{formatAmount(item.overdue)}</TableCell>
                  <TableCell>{item.billingStatus}</TableCell>
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
    </>
  )
}
