import axios from 'axios'
import { format } from 'date-fns'
import { FileDown } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { DateRange } from 'react-day-picker'
import { toast } from 'sonner'
import { ENV } from '../conf'
import {
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
type OutputUTRType = {
  _id: string
  companyName: string
  distributorCode: string
  beneficiaryName: string
  beneficiaryAccNo: string
  bankName: string
  ifscCode: string
  branch: string
  invoiceNumber: number
  invoiceAmount: number
  invoiceDate: string
  loanAmount: number
  loanDisbursementDate: string
  utr: string
  status: string
  invoicePdfUrl: string
}

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
      if (Number(filters.invoiceNumber))
        params.invoiceNumber = Number(filters.invoiceNumber)
      if (filters.utr) params.utr = filters.utr
      if (filters.status && filters.status !== 'all') {
        params.status = filters.status
      }
      if (filters.date?.from && filters.date?.to) {
        params.fromDate = format(filters.date.from, 'dd-MM-yyyy') // Or your desired format
        params.toDate = format(filters.date.to, 'dd-MM-yyyy') // Or your desired format
      } else if (filters.date?.from) {
        params.date = format(filters.date.from, 'dd-MM-yyyy') // Handle single date selection if needed
      }

      const res = await axios.get(`${ENV.BACKEND_URL}/output-utr`, {
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
        `${ENV.BACKEND_URL}/output-utr-upload`,
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
      <div className='flex flex-wrap sm:flex-nowrap gap-2 mb-4 max-w-full'>
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
        <Input
          placeholder='Invoice No.'
          value={filters.invoiceNumber}
          onChange={(e) =>
            setFilters((f) => ({ ...f, invoiceNumber: e.target.value }))
          }
        />
        <Input
          placeholder='UTR'
          value={filters.utr}
          onChange={(e) => setFilters((f) => ({ ...f, utr: e.target.value }))}
        />
        <Select
          onValueChange={(value) =>
            setFilters((f) => ({ ...f, status: value === 'all' ? '' : value }))
          }
          defaultValue='all'
        >
          <SelectTrigger className='w-[60rem]'>
            <SelectValue placeholder='Select status' />
          </SelectTrigger>
          <SelectContent className='bg-black'>
            <SelectItem value='all'>All</SelectItem>
            <SelectItem value='Completed'>Completed</SelectItem>
            <SelectItem value='Pending'>Pending</SelectItem>
          </SelectContent>
        </Select>
        <DatePickerWithRange
          date={filters.date}
          setDate={(range) =>
            setFilters((prevFilters) => ({
              ...prevFilters,
              date: range, // Set the date in the filters state (now only on "OK" click)
            }))
          }
        />
        {/* <DateRangePicker
          onUpdate={(range) => setFilters((f) => ({ ...f, date: range }))}
          initialDateFrom={filters.date.from}
          initialDateTo={filters.date.to}
          align='start'
          locale='en-US'
          showCompare={false}
        /> */}
        {/* <Button
          onClick={fetchData}
          variant={'outline'}
          className='cursor-pointer'
        >
          Apply
        </Button> */}
        {user?.role === 'admin' && (
          <div className='flex justify-end'>
            <Button
              onClick={handleExport}
              variant='link'
              className='cursor-pointer text-gray-400'
            >
              <div>
                <FileDown />
              </div>
              Export CSV
            </Button>
          </div>
        )}
        {(filters.companyName ||
          filters.distributorCode ||
          filters.invoiceNumber ||
          filters.utr) && (
          <Button
            variant='ghost'
            onClick={handleClearFilter}
            className='text-red-500 cursor-pointer'
          >
            Clear
          </Button>
        )}
      </div>
      <div className='flex gap-4 justify-between'>
        {user?.role === 'admin' && (
          <div className='mt-4 flex gap-4 items-center'>
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
        <div>
          <Button className='cursor-pointer' onClick={getFtpFiles}>
            Get data from FTP
          </Button>
        </div>
      </div>
      <div className='overflow-x-auto'>
        <Table className='text-base'>
          <TableHeader>
            <TableRow>
              <TableHead className='whitespace-nowrap'>Company Name</TableHead>
              <TableHead className='whitespace-nowrap'>
                Distributor Code
              </TableHead>
              <TableHead className='whitespace-nowrap'>
                Beneficiary Name
              </TableHead>
              <TableHead className='whitespace-nowrap'>
                Beneficiary Acc No
              </TableHead>
              <TableHead className='whitespace-nowrap'>Bank Name</TableHead>
              <TableHead className='whitespace-nowrap'>IFSC Code</TableHead>
              <TableHead className='whitespace-nowrap'>Branch</TableHead>
              <TableHead className='whitespace-nowrap'>
                Invoice Number
              </TableHead>
              <TableHead className='whitespace-nowrap'>
                Invoice Amount
              </TableHead>
              <TableHead className='whitespace-nowrap'>Invoice Date</TableHead>
              <TableHead className='whitespace-nowrap'>Loan Amount</TableHead>
              <TableHead className='whitespace-nowrap'>
                Loan Disbursement Date
              </TableHead>
              <TableHead className='whitespace-nowrap'>UTR</TableHead>
              <TableHead className='whitespace-nowrap'>Status</TableHead>
              {user?.role === 'admin' && (
                <TableHead className='whitespace-nowrap'>
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
              : data?.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell className='whitespace-nowrap'>
                      {item.companyName}
                    </TableCell>
                    <TableCell className='whitespace-nowrap'>
                      {item.distributorCode}
                    </TableCell>
                    <TableCell className='whitespace-nowrap'>
                      {item.beneficiaryName}
                    </TableCell>
                    <TableCell className='whitespace-nowrap'>
                      {item.beneficiaryAccNo}
                    </TableCell>
                    <TableCell className='whitespace-nowrap'>
                      {item.bankName}
                    </TableCell>
                    <TableCell className='whitespace-nowrap'>
                      {item.ifscCode}
                    </TableCell>
                    <TableCell className='whitespace-nowrap'>
                      {item.branch}
                    </TableCell>
                    <TableCell className='whitespace-nowrap'>
                      {item.invoiceNumber}
                    </TableCell>
                    <TableCell className='whitespace-nowrap'>
                      {formatAmount(item.invoiceAmount)}
                    </TableCell>
                    <TableCell className='whitespace-nowrap'>
                      {formatDate(item.invoiceDate)}
                    </TableCell>
                    <TableCell className='whitespace-nowrap'>
                      {formatAmount(item.loanAmount)}
                    </TableCell>
                    <TableCell className='whitespace-nowrap'>
                      {item.loanDisbursementDate
                        ? formatDate(item.loanDisbursementDate)
                        : 'N/A'}
                    </TableCell>
                    <TableCell className='whitespace-nowrap'>
                      {item.utr ? item.utr : 'N/A'}
                    </TableCell>

                    <TableCell
                      className={cn(
                        `${
                          item.status === 'Completed'
                            ? 'text-green-500'
                            : 'text-orange-400'
                        }`,
                        'whitespace-nowrap'
                      )}
                    >
                      {item.status.charAt(0).toUpperCase() +
                        item.status.slice(1)}
                    </TableCell>
                    {user?.role === 'admin' && (
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
      </div>
    </>
  )
}
