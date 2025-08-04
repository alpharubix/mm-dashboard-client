import axios from 'axios'
import { format } from 'date-fns'
import { ChevronLeft, ChevronRight, Download, FileDown } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { DateRange } from 'react-day-picker'
import { toast } from 'sonner'
import { ENV } from '../conf'
import {
  camelCaseToWords,
  formatAmount,
  formatDate,
  getUserFromToken,
  handleExport,
} from '../lib/utils'
import { Button } from '../components/ui/button'
import { DatePickerWithRange } from '../components/ui/DatePicker'
import { InputFile } from '../components/ui/file-input'
import { Input } from '../components/ui/input'
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
import { Card, CardContent } from '../components/ui/card'
import { Label } from '../components/ui/label'

import useDebounce from '../hooks/use-debounce'
import { useApiQuery } from '../api/hooks'

import type { InvoiceType } from '../types'

export default function Invoice() {
  const [file, setFile] = useState<File | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const user = getUserFromToken()
  const [page, setPage] = useState(1)

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
  const debouncedFilters = useDebounce(filters, 500)
  const queryParams = useMemo(() => {
    const params: any = { page, limit: 10 }
    if (debouncedFilters.companyName)
      params.companyName = debouncedFilters.companyName
    if (debouncedFilters.distributorCode)
      params.distributorCode = debouncedFilters.distributorCode
    if (
      debouncedFilters.invoiceNumber &&
      !isNaN(Number(debouncedFilters.invoiceNumber))
    ) {
      params.invoiceNumber = Number(debouncedFilters.invoiceNumber)
    }
    if (debouncedFilters.utr) params.utr = debouncedFilters.utr
    if (debouncedFilters.status && debouncedFilters.status !== 'all') {
      params.status = debouncedFilters.status
    }
    if (debouncedFilters.date?.from && debouncedFilters.date?.to) {
      params.fromDate = format(debouncedFilters.date.from, 'dd-MM-yy')
      params.toDate = format(debouncedFilters.date.to, 'dd-MM-yy')
    }
    return params
  }, [debouncedFilters, page])

  const { data, isPending, error, refetch } = useApiQuery(
    '/invoice-input',
    queryParams
  )
  const totalPages = data?.totalPages || 1

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

      refetch()
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

  useEffect(() => {
    setPage(1)
  }, [
    debouncedFilters.companyName,
    debouncedFilters.distributorCode,
    debouncedFilters.date?.from,
    debouncedFilters.date?.to,
    debouncedFilters.invoiceNumber,
    debouncedFilters.status,
    debouncedFilters.utr,
  ])

  if (error) {
    return (
      <div className='flex justify-center items-center h-screen text-red-500'>
        {error.message}
      </div>
    )
  }

  return (
    <>
      <Card>
        <div className='flex items-center justify-between flex-wrap px-6 gap-2'>
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
              <SelectTrigger className='h-10 min-w-48'>
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
              Invioce Date Range
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
            <Button
              onClick={() => handleExport(queryParams)}
              variant='outline'
              size='sm'
              className='h-10 w-full cursor-pointer mt-6 font-normal text-sm text-gray-600'
            >
              <Download className='h-4 w-4 mr-1' />
              Export
            </Button>
          </div>

          {/* <div className='space-y-2'>
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
          </div> */}
        </div>

        {/* File Upload */}
        {user?.role === 'superAdmin' && (
          <div className='flex items-center mx-5 gap-6 flex-wrap'>
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
        <span className='text-sm italic text-gray-500 ml-6 inline'>
          {data?.total ? `Total - ${data?.total}` : null}
        </span>
        <CardContent>
          <div className='overflow-x-auto'>
            <Table className='text-base whitespace-nowrap'>
              <TableHeader>
                <TableRow className='bg-gray-50'>
                  <TableHead className='font-bold  text-gray-700'>
                    Company Name
                  </TableHead>
                  <TableHead className='font-bold  text-gray-700'>
                    Distributor Code
                  </TableHead>
                  <TableHead className='font-bold  text-gray-700 '>
                    Beneficiary Name
                  </TableHead>
                  <TableHead className='font-bold  text-gray-700 '>
                    Beneficiary Acc No
                  </TableHead>
                  <TableHead className='font-bold  text-gray-700 '>
                    Bank Name
                  </TableHead>
                  <TableHead className='font-bold  text-gray-700 '>
                    IFSC Code
                  </TableHead>
                  <TableHead className='font-bold  text-gray-700 '>
                    Branch
                  </TableHead>
                  <TableHead className='font-bold  text-gray-700 '>
                    Invoice Number
                  </TableHead>
                  <TableHead className='font-bold  text-gray-700 '>
                    Invoice Amount
                  </TableHead>
                  <TableHead className='font-bold  text-gray-700 '>
                    Invoice Date
                  </TableHead>
                  <TableHead className='font-bold  text-gray-700 '>
                    Loan Amount
                  </TableHead>
                  <TableHead className='font-bold  text-gray-700 '>
                    Loan Disbursement Date
                  </TableHead>
                  <TableHead className='font-bold  text-gray-700 '>
                    UTR
                  </TableHead>
                  <TableHead className='font-bold  text-gray-700 '>
                    Status
                  </TableHead>
                  {user?.role === 'superAdmin' && (
                    <TableHead className='font-bold  text-gray-700 '>
                      Invoice File
                    </TableHead>
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
                  : data?.data?.map((item: InvoiceType) => (
                      <TableRow className='' key={item._id}>
                        <TableCell>{item.companyName}</TableCell>
                        <TableCell>{item.distributorCode}</TableCell>
                        <TableCell>{item.beneficiaryName}</TableCell>
                        <TableCell>{item.beneficiaryAccNo}</TableCell>
                        <TableCell>{item.bankName}</TableCell>
                        <TableCell>{item.ifscCode}</TableCell>
                        <TableCell>{item.branch}</TableCell>
                        <TableCell>{item.invoiceNumber}</TableCell>
                        <TableCell className=''>
                          {formatAmount(item.invoiceAmount)}
                        </TableCell>
                        <TableCell>{formatDate(item.invoiceDate)}</TableCell>
                        <TableCell className=''>
                          {formatAmount(item.loanAmount)}
                        </TableCell>
                        <TableCell>
                          {item.loanDisbursementDate
                            ? formatDate(item.loanDisbursementDate)
                            : 'NA'}
                        </TableCell>
                        <TableCell>{item.utr ? item.utr : 'NA'}</TableCell>

                        <TableCell>{camelCaseToWords(item.status)}</TableCell>
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
