import { Bell } from 'lucide-react'

export default function HolidayBanner() {
  return (
    <div className='w-full bg-yellow-50 border-b border-yellow-200 p-4 shadow-sm'>
      <div className='container mx-auto flex items-start gap-3 text-sm text-yellow-800 px-4 sm:px-6 lg:px-8'>
        <Bell className='h-5 w-5 text-yellow-600 mt-0.5 shrink-0' />
        <div className='space-y-2'>
          <p>
            Kindle note that On{' '}
            <span className='font-semibold'>19th March 2026</span> is a Holiday
            "Ugadi"
          </p>
          <p>
            Transactions and invoices received after the cut-off time will be
            processed on the next working day{' '}
            <span className='font-semibold'>20th March 2026</span>. Kindly plan
            your transactions accordingly.
          </p>
        </div>
      </div>
    </div>
  )
}
