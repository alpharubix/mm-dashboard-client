import axios from 'axios'
import { format } from 'date-fns'
import { ChevronLeft, ChevronRight, Download, FileDown } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { DateRange } from 'react-day-picker'
import { toast } from 'sonner'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { DatePickerWithRange } from '../components/ui/DatePicker'
import { InputFile } from '../components/ui/file-input'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
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
import { ENV } from '../conf'
import {
  camelCaseToWords,
  cn,
  formatAmount,
  formatDate,
  formatDateHourMinute,
  getUserFromToken,
  handleExport,
} from '../lib/utils'

import { useApiQuery } from '../api/hooks'
import useDebounce from '../hooks/use-debounce'

import type { InvoiceType } from '../types'
import EmailDrawer from '@/components/EmailDrawer'

const showError = (error: any) => {
  if (!error) return
  console.log({ error })
  const { message, missingFields } = error

  let toastMessage = message
  if (missingFields?.length) {
    toastMessage += `: ${missingFields.join(', ')}`
  }

  toast.error(toastMessage)
}

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
  console.log(
    'Data ============> ',
    data?.data?.map((d: any) => d.status)
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
      // const { message, duplicates } = err.response?.data || {}

      // const duplicateInfo = duplicates?.length
      //   ? ` (${duplicates.join(', ')})`
      //   : ''

      // toast.error(`${message || `Upload failed ${message}`}${duplicateInfo}`)
      // @ts-ignore
      showError(err.response.data || {})
      console.error('Upload failed', err)
    }
  }

  const handleSendMail = (distributorCode: string, invoiceNumber: number) => {
    toast.success(
      'Email is successfully sent. Distributor Code: ' +
        distributorCode +
        ', Invoice Number: ' +
        invoiceNumber
    )
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
      <div className="flex justify-center items-center h-screen text-red-500">
        {error.message}
      </div>
    )
  }

  return (
    <>
      <Card>
        <div className="flex items-center justify-between flex-wrap px-6 gap-2">
          <div className="space-y-2">
            <Label
              htmlFor="company-name"
              className="text-sm font-medium text-gray-700"
            >
              Company name
            </Label>
            <Input
              id="company-name"
              placeholder="Example company"
              value={filters.companyName}
              onChange={(e) =>
                setFilters((f) => ({ ...f, companyName: e.target.value }))
              }
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="distributor-code"
              className="text-sm font-medium text-gray-700"
            >
              Distributor code
            </Label>
            <Input
              id="distributor-code"
              placeholder="ex: 123456"
              value={filters.distributorCode}
              onChange={(e) =>
                setFilters((f) => ({ ...f, distributorCode: e.target.value }))
              }
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Invoice No.
            </Label>
            <Input
              placeholder="Invoice No."
              value={filters.invoiceNumber}
              onChange={(e) =>
                setFilters((f) => ({ ...f, invoiceNumber: e.target.value }))
              }
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">UTR</Label>
            <Input
              placeholder="UTR"
              value={filters.utr}
              onChange={(e) =>
                setFilters((f) => ({ ...f, utr: e.target.value }))
              }
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Status</Label>
            <Select
              onValueChange={(value) =>
                setFilters((f) => ({
                  ...f,
                  status: value === 'all' ? '' : value,
                }))
              }
              defaultValue="all"
            >
              <SelectTrigger className="h-10 min-w-48">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="yetToProcess">Yet To Process</SelectItem>
                <SelectItem value="inProgress">In Progress</SelectItem>
                <SelectItem value="processed">Processed</SelectItem>
                <SelectItem value="pendingWithCustomer">
                  Pending With Customer
                </SelectItem>
                <SelectItem value="pendingWithLender">
                  Pending With Lender
                </SelectItem>
                <SelectItem value="notProcessed">Not Processed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
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

          {user?.role === 'superAdmin' && (
            <div className="space-y-2">
              <Button
                onClick={() => handleExport(queryParams)}
                variant="outline"
                size="sm"
                className="h-10 w-full cursor-pointer mt-6 font-normal text-sm text-gray-600"
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          )}

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
          <div className="flex items-center mx-5 gap-6 flex-wrap">
            <div className="space-y-2 max-w-lg">
              <Label className="text-sm font-medium text-gray-700">
                Upload File
              </Label>
              <div className="flex gap-4 items-center">
                <InputFile
                  onChange={handleFileChange}
                  ref={inputRef}
                  file={file}
                />
                {file && (
                  <div className="flex gap-2">
                    <Button onClick={handleUpload} disabled={!file}>
                      Upload CSV
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="ghost"
                      className="text-red-500"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        <span className="text-sm italic text-gray-500 ml-6 inline">
          {data?.total ? `Total - ${data?.total}` : null}
        </span>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="text-base whitespace-nowrap table-fixed">
              <TableHeader className="tracking-wide">
                <TableRow className="bg-gray-50">
                  <TableHead className="font-bold bg-gray-50 sticky left-0 w-[200px] z-20 text-gray-700 ">
                    Company Name
                  </TableHead>
                  <TableHead className="font-bold text-gray-700 sticky left-[200px] w-[150px]  z-10 bg-gray-50 ">
                    Distributor Code
                  </TableHead>
                  {/* {user?.role === 'superAdmin' && (
                    <>
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
                    </>
                  )} */}
                  <TableHead className="font-bold  text-gray-700 w-[150px] ">
                    Invoice Number
                  </TableHead>
                  <TableHead className="font-bold  text-gray-700 w-[150px] ">
                    Invoice Amount
                  </TableHead>
                  <TableHead className="font-bold  text-gray-700 w-[120px] ">
                    Invoice Date
                  </TableHead>
                  <TableHead className="font-bold  text-gray-700 w-[150px] ">
                    Loan Amount
                  </TableHead>
                  <TableHead
                    title="Limit Live Date"
                    className="font-bold  text-gray-700 w-[100px] "
                  >
                    LLD
                  </TableHead>
                  <TableHead className="font-bold  text-gray-700 w-[100px] ">
                    UTR
                  </TableHead>
                  <TableHead className="font-bold  text-gray-700 w-[170px]">
                    Status
                  </TableHead>
                  {user?.role === 'superAdmin' && (
                    <>
                      <TableHead className="font-bold  text-gray-700 min-w-28 w-[120px] ">
                        Invoice File
                      </TableHead>
                      <TableHead className="font-bold  text-gray-700 min-w-28 w-[130px] ">
                        Disbursement
                      </TableHead>
                      <TableHead className="font-bold  text-gray-700 w-[200px] ">
                        Created At
                      </TableHead>
                      <TableHead className="font-bold  text-gray-700 w-[200px]">
                        Updated At
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
                          <Skeleton className="h-4 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-32" />
                        </TableCell>
                        {/* <TableCell>
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
                        </TableCell> */}
                        <TableCell>
                          <Skeleton className="h-4 w-20" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-28" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-20" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                      </TableRow>
                    ))
                  : data?.data?.map((item: InvoiceType) => (
                      <TableRow
                        key={item._id}
                        className={cn(
                          'group transition-colors',
                          item.status === 'notProcessed'
                            ? 'bg-red-50'
                            : 'bg-white'
                        )}
                      >
                        <TableCell
                          className={cn(
                            'sticky left-0 z-20 ',
                            item.status === 'notProcessed'
                              ? 'bg-red-50 group-hover:bg-red-100'
                              : 'bg-white group-hover:bg-muted'
                          )}
                        >
                          {item.companyName}
                        </TableCell>

                        <TableCell
                          className={cn(
                            'sticky left-[200px] z-10',
                            item.status === 'notProcessed'
                              ? 'bg-red-50 group-hover:bg-red-100'
                              : 'bg-white group-hover:bg-muted'
                          )}
                        >
                          {item.distributorCode}
                        </TableCell>

                        <TableCell
                          className={cn(
                            item.status === 'notProcessed'
                              ? 'bg-red-50 group-hover:bg-red-100'
                              : 'bg-white group-hover:bg-muted'
                          )}
                        >
                          {item.invoiceNumber}
                        </TableCell>
                        <TableCell
                          className={cn(
                            item.status === 'notProcessed'
                              ? 'bg-red-50 group-hover:bg-red-100'
                              : 'bg-white group-hover:bg-muted'
                          )}
                        >
                          {formatAmount(item.invoiceAmount)}
                        </TableCell>
                        <TableCell
                          className={cn(
                            item.status === 'notProcessed'
                              ? 'bg-red-50 group-hover:bg-red-100'
                              : 'bg-white group-hover:bg-muted'
                          )}
                        >
                          {formatDate(item.invoiceDate)}
                        </TableCell>
                        <TableCell
                          className={cn(
                            item.status === 'notProcessed'
                              ? 'bg-red-50 group-hover:bg-red-100'
                              : 'bg-white group-hover:bg-muted'
                          )}
                        >
                          {formatAmount(item.loanAmount)}
                        </TableCell>
                        <TableCell
                          className={cn(
                            item.status === 'notProcessed'
                              ? 'bg-red-50 group-hover:bg-red-100'
                              : 'bg-white group-hover:bg-muted'
                          )}
                        >
                          {item.loanDisbursementDate
                            ? formatDate(item.loanDisbursementDate)
                            : 'NA'}
                        </TableCell>
                        <TableCell
                          className={cn(
                            item.status === 'notProcessed'
                              ? 'bg-red-50 group-hover:bg-red-100'
                              : 'bg-white group-hover:bg-muted'
                          )}
                        >
                          {item.utr ? item.utr : 'NA'}
                        </TableCell>
                        <TableCell
                          className={cn(
                            item.status === 'notProcessed'
                              ? 'bg-red-50 group-hover:bg-red-100'
                              : 'bg-white group-hover:bg-muted'
                          )}
                        >
                          {camelCaseToWords(item.status)}
                        </TableCell>

                        {user?.role === 'superAdmin' && (
                          <>
                            <TableCell
                              className={cn(
                                'flex justify-center',
                                item.status === 'notProcessed'
                                  ? 'bg-red-50 group-hover:bg-red-100'
                                  : 'bg-white group-hover:bg-muted'
                              )}
                            >
                              <span className="">
                                {item.invoicePdfUrl ? (
                                  <a
                                    href={item.invoicePdfUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ display: 'inline-block' }}
                                  >
                                    <FileDown className="" />
                                  </a>
                                ) : (
                                  'NA'
                                )}
                              </span>
                            </TableCell>
                            <TableCell
                              className={cn(
                                item.status === 'notProcessed'
                                  ? 'bg-red-50 group-hover:bg-red-100'
                                  : 'bg-white group-hover:bg-muted'
                              )}
                            >
                              {item.status === 'yetToProcess' && (
                                <EmailDrawer />
                              )}
                            </TableCell>
                            <TableCell
                              className={cn(
                                item.status === 'notProcessed'
                                  ? 'bg-red-50 group-hover:bg-red-100'
                                  : 'bg-white group-hover:bg-muted'
                              )}
                            >
                              {formatDateHourMinute(item.createdAt)}
                            </TableCell>
                            <TableCell
                              className={cn(
                                item.status === 'notProcessed'
                                  ? 'bg-red-50 group-hover:bg-red-100'
                                  : 'bg-white group-hover:bg-muted'
                              )}
                            >
                              {formatDateHourMinute(item.updatedAt)}
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
            {data?.data?.length !== 0 ? (
              <>
                <div className="mt-4 flex justify-center gap-4 items-center">
                  <Button
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    className="cursor-pointer text-2xl"
                    variant={'outline'}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    disabled={page === totalPages}
                    className="cursor-pointer text-2xl"
                    variant={'outline'}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center text-2xl m-3">
                {isPending ? null : 'No Data Found'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  )
}