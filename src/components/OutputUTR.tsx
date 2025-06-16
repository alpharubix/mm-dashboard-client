import axios from 'axios'
import { format } from 'date-fns'
import { ChevronLeft, ChevronRight, FileDown } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { DateRange } from 'react-day-picker'
import { toast } from 'sonner'
import { ENV } from '../conf'
import {
  camelCaseToWords,
  cn,
  formatAmount,
  formatDate,
  getUserFromToken,
  handleExport,
} from '../lib/utils'
import { Button } from './ui/button'
import { DatePickerWithRange } from './ui/DatePicker'
import { InputFile } from './ui/file-input'
import { Input } from './ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { Skeleton } from './ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table'
import type { OutputUTRType } from '../types'
import { Card, CardContent } from './ui/card'
import { Label } from './ui/label'

export default function OutputUTR() {
  const [data, setData] = useState<OutputUTRType[]>([])
  const [file, setFile] = useState<File | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const user = getUserFromToken()
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [filters, setFilters] = useState<{
    companyName: string
    distributorCode: string
    invoiceNumber: string
    utr: string
    date: DateRange | undefined
    status: string
  }>({
    companyName: '',
    distributorCode: '',
    invoiceNumber: '',
    utr: '',
    date: undefined,
    status: '',
  })

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const params: any = { page, limit: 10 }
      if (filters.companyName) params.companyName = filters.companyName
      if (filters.distributorCode)
        params.distributorCode = filters.distributorCode
      if (filters.invoiceNumber && !isNaN(Number(filters.invoiceNumber))) {
        params.invoiceNumber = Number(filters.invoiceNumber)
      }
      if (filters.utr) params.utr = filters.utr
      if (filters.status && filters.status !== 'all') {
        params.status = filters.status
      }
      if (filters.date?.from && filters.date?.to) {
        params.fromDate = format(filters.date.from, 'dd-MM-yy') // Or your desired format
        params.toDate = format(filters.date.to, 'dd-MM-yy') // Or your desired format
      } else if (filters.date?.from) {
        params.date = format(filters.date.from, 'dd-MM-yy') // Handle single date selection if needed
      }

      const res = await axios.get(`${ENV.BACKEND_URL}/invoice-input`, {
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
    [
      filters.companyName,
      filters.distributorCode,
      filters.invoiceNumber,
      filters.utr,
      filters.status,
      filters.date?.from,
      filters.date?.to,
    ]
  )

  const getFtpFiles = async () => {
    setIsLoading(true)
    try {
      const { data, status } = await axios.get(
        `${ENV.BACKEND_URL}/output-utr-ftp-data`
      )

      if (status !== 200) {
        throw { response: { data } } // force error block to handle uniformly
      }

      toast.success(data.message || 'Data processed successfully')
      fetchData()
    } catch (error: any) {
      const res = error.response?.data
      let msg = res?.message || error.message || 'Network error'

      // Specific handling for known cases
      if (msg.includes('E11000 duplicate key error collection')) {
        toast.info('No new data to insert.')
      } else {
        toast.error(msg)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch data
  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null
    const mainFetch = async () => {
      try {
        timeout = setTimeout(() => {
          fetchData()
        }, 500)
      } catch (err) {
        console.error('Failed to fetch FTP files:', err)
      }
    }

    mainFetch()

    return () => {
      if (timeout) clearTimeout(timeout)
    }
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
        `${ENV.BACKEND_URL}/invoice-utr-upload`,
        form,
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

      toast.error(`${message || `Upload failed ${message}`}${duplicateInfo}`)

      console.error('Upload failed', err)
    }
  }

  const handleCancel = () => {
    setFile(null)
    if (inputRef.current) inputRef.current.value = ''
  }
  const handleClearFilter = () => {
    setFilters({
      companyName: '',
      distributorCode: '',
      date: undefined,
      invoiceNumber: '',
      status: '',
      utr: '',
    })
    setPage(1)
  }

  return (
    <>
      <Card>
        <div className='flex items-center justify-between flex-wrap px-4 gap-2'>
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

          <div className='space-y-2'>
            <Label className='text-sm font-medium text-gray-700'>
              Invoice No.
            </Label>
            <Input
              placeholder='Invoice No.'
              value={filters.invoiceNumber}
              onChange={(e) =>
                setFilters((f) => ({ ...f, invoiceNumber: e.target.value }))
              }
              className='h-10'
            />
          </div>

          <div className='space-y-2'>
            <Label className='text-sm font-medium text-gray-700'>UTR</Label>
            <Input
              placeholder='UTR'
              value={filters.utr}
              onChange={(e) =>
                setFilters((f) => ({ ...f, utr: e.target.value }))
              }
              className='h-10'
            />
          </div>

          <div className='space-y-2'>
            <Label className='text-sm font-medium text-gray-700'>Status</Label>
            <Select
              onValueChange={(value) =>
                setFilters((f) => ({
                  ...f,
                  status: value === 'all' ? '' : value,
                }))
              }
              defaultValue='all'
            >
              <SelectTrigger className='h-10'>
                <SelectValue placeholder='Select status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All</SelectItem>
                <SelectItem value='yetToProcess'>Yet To Process</SelectItem>
                <SelectItem value='inProgress'>In Progress</SelectItem>
                <SelectItem value='processed'>Processed</SelectItem>
                <SelectItem value='pendingWithCustomer'>
                  Pending With Customer
                </SelectItem>
                <SelectItem value='pendingWithLender'>
                  Pending With Lender
                </SelectItem>
                <SelectItem value='notProcessed'>Not Processed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label className='text-sm font-medium text-gray-700'>
              Date Range
            </Label>
            <DatePickerWithRange
              date={filters.date}
              setDate={(range) =>
                setFilters((prevFilters) => ({
                  ...prevFilters,
                  date: range,
                }))
              }
            />
          </div>

          <div className='space-y-2'>
            <Label className='text-sm font-medium text-gray-700 opacity-0'>
              Clear
            </Label>
            <Button
              variant='ghost'
              onClick={handleClearFilter}
              size='sm'
              className='text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer'
            >
              Clear
            </Button>
          </div>
        </div>

        {/* File Upload */}
        {user?.role === 'superAdmin' && (
          <div className='flex  items-center justify-between mx-5 gap-2 flex-wrap'>
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

            <div className='space-y-2'>
              <Button
                onClick={handleExport}
                variant='outline'
                size='sm'
                className='h-10 w-full'
              >
                <FileDown className='h-4 w-4 mr-1' />
                Export
              </Button>
            </div>
          </div>
        )}

        <CardContent>
          <div className='overflow-x-auto'>
            <Table className='text-base whitespace-nowrap'>
              <TableHeader>
                <TableRow className='bg-gray-50'>
                  <TableHead className='font-semibold text-gray-900'>
                    S.No
                  </TableHead>
                  <TableHead className='font-semibold text-gray-900'>
                    Company Name
                  </TableHead>
                  <TableHead className='font-semibold text-gray-900'>
                    Distributor Code
                  </TableHead>
                  <TableHead className='font-semibold text-gray-900'>
                    Beneficiary Name
                  </TableHead>
                  <TableHead className='font-semibold text-gray-900'>
                    Beneficiary Acc No
                  </TableHead>
                  <TableHead className='font-semibold text-gray-900'>
                    Bank Name
                  </TableHead>
                  <TableHead className='font-semibold text-gray-900'>
                    IFSC Code
                  </TableHead>
                  <TableHead className='font-semibold text-gray-900'>
                    Branch
                  </TableHead>
                  <TableHead className='font-semibold text-gray-900'>
                    Invoice Number
                  </TableHead>
                  <TableHead className='font-semibold text-gray-900'>
                    Invoice Amount
                  </TableHead>
                  <TableHead className='font-semibold text-gray-900'>
                    Invoice Date
                  </TableHead>
                  <TableHead className='font-semibold text-gray-900'>
                    Loan Amount
                  </TableHead>
                  <TableHead className='font-semibold text-gray-900'>
                    Loan Disbursement Date
                  </TableHead>
                  <TableHead className='font-semibold text-gray-900'>
                    UTR
                  </TableHead>
                  <TableHead className='font-semibold text-gray-900'>
                    Status
                  </TableHead>
                  {user?.role === 'superAdmin' && (
                    <TableHead className='font-semibold text-gray-900'>
                      Invoice File
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading
                  ? Array.from({ length: 10 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className='h-4 w-32' />
                        </TableCell>
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
                          <Skeleton className='h-4 w-16' />
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
                      </TableRow>
                    ))
                  : data?.map((item, idx) => (
                      <TableRow key={item._id}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>{item.companyName}</TableCell>
                        <TableCell>{item.distributorCode}</TableCell>
                        <TableCell>{item.beneficiaryName}</TableCell>
                        <TableCell>{item.beneficiaryAccNo}</TableCell>
                        <TableCell>{item.bankName}</TableCell>
                        <TableCell>{item.ifscCode}</TableCell>
                        <TableCell>{item.branch}</TableCell>
                        <TableCell>{item.invoiceNumber}</TableCell>
                        <TableCell className='font-mono'>
                          {formatAmount(item.invoiceAmount)}
                        </TableCell>
                        <TableCell>{formatDate(item.invoiceDate)}</TableCell>
                        <TableCell className='font-mono'>
                          {formatAmount(item.loanAmount)}
                        </TableCell>
                        <TableCell>
                          {item.loanDisbursementDate
                            ? formatDate(item.loanDisbursementDate)
                            : 'NA'}
                        </TableCell>
                        <TableCell>{item.utr ? item.utr : 'NA'}</TableCell>

                        <TableCell
                        // className={cn(
                        //   `${
                        //     item.status.toLowerCase() === 'completed'
                        //       ? 'text-green-500'
                        //       : 'text-orange-500'
                        //   }`,
                        //   'whitespace-nowrap'
                        // )}
                        >
                          {/* {item.status.charAt(0).toUpperCase() +
                            item.status.slice(1)} */}
                          {camelCaseToWords(item.status)}
                        </TableCell>
                        {user?.role === 'superAdmin' && (
                          <TableCell className=''>
                            <span className=''>
                              {item.invoicePdfUrl ? (
                                <a
                                  href={item.invoicePdfUrl}
                                  target='_blank'
                                  rel='noopener noreferrer'
                                  style={{ display: 'inline-block' }}
                                >
                                  <FileDown className='' />
                                </a>
                              ) : (
                                'NA'
                              )}
                            </span>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
            {data.length !== 0 ? (
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
                {isLoading ? null : 'No Data Found'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  )
}
