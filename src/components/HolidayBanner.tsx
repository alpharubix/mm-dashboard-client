import { Bell } from 'lucide-react'

export default function HolidayBanner() {
  return (
    <div className='w-full bg-yellow-50 border-b border-yellow-200 p-4 shadow-sm'>
      <div className='container mx-auto flex items-start gap-3 text-sm text-yellow-800 px-4 sm:px-6 lg:px-8'>
        <Bell className='h-5 w-5 text-yellow-600 mt-0.5 shrink-0' />
        <div className='space-y-2'>
          <p>
            Disbursement Closed –{' '}
            <span className='font-semibold'> 21st March 2026</span>
          </p>
          <p>
            All lenders will remain closed on 21-03-2026 on account of
            Eid-ul-Fitr (Ramzan-Id)
          </p>
          <p>
            Invoices received after the cut-off on 20-03-2026 will be processed
            on next working day (23-03-2026). The updated Limit Report will be
            shared on 23-03-2026.
          </p>
        </div>
      </div>
    </div>
  )
}
