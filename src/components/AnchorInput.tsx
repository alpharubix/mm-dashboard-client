import axios from 'axios'
import { FileDown } from 'lucide-react'
import { useEffect, useState } from 'react'
import { formatAmount, formatDate, handleExport } from '../lib/utils'
import { Button } from './ui/button'
import { Skeleton } from './ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table'

type InputType = {
  companyName: string
  distributorCode: string
  beneficiaryName: string
  beneficiaryAccountNo: string
  bankName: string
  ifscCode: string
  branch: string
  invoiceNum: string
  invoiceAmount: number
  invoiceDate: string
  loanAmountExclCreditBalance: number
}

export default function AnchorInput() {
  const [data, setData] = useState<InputType[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchMe = () => {
    setIsLoading(true)
    axios
      .get('http://localhost:3001/input')
      .then((res) => setData(res.data))
      .catch((er) => console.log(er))
      .finally(() => setIsLoading(false))
  }
  useEffect(() => {
    fetchMe()
  }, [])

  return (
    <>
      <div className='flex flex-col gap-2'>
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
                Beneficiary Account No
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
              <TableHead className='whitespace-nowrap'>
                Loan Amount (Excl. Credit Balance)
              </TableHead>
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
                      <Skeleton className='h-4 w-24' />
                    </TableCell>
                  </TableRow>
                ))
              : data.map((inv) => (
                  <TableRow key={inv.invoiceNum}>
                    <TableCell>{inv.companyName}</TableCell>
                    <TableCell>{inv.distributorCode}</TableCell>
                    <TableCell>{inv.beneficiaryName}</TableCell>
                    <TableCell>{inv.beneficiaryAccountNo}</TableCell>
                    <TableCell>{inv.bankName}</TableCell>
                    <TableCell>{inv.ifscCode}</TableCell>
                    <TableCell>{inv.branch}</TableCell>
                    <TableCell>{inv.invoiceNum}</TableCell>
                    <TableCell>{formatAmount(inv.invoiceAmount)}</TableCell>
                    <TableCell className='whitespace-nowrap'>
                      {formatDate(inv.invoiceDate)}
                    </TableCell>
                    <TableCell>
                      {formatAmount(inv.loanAmountExclCreditBalance)}
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
        {/* <div className=''>
          <InputFile />
          <Button className='mt-2.5'>Send</Button>
        </div> */}
      </div>
    </>
  )
}
