import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { useState } from 'react' // Import useState
import { DateRange } from 'react-day-picker'
import { cn } from '../../lib/utils'
import { Button } from './button'
import { Calendar } from './calendar'
import { Popover, PopoverContent, PopoverTrigger } from './popover'

export function DatePickerWithRange({
  className,
  date: initialDate, // Rename prop to avoid confusion with local state
  setDate,
}: {
  className?: string
  date?: DateRange
  setDate: (range: DateRange | undefined) => void
}) {
  const [open, setOpen] = useState(false)
  const [localDate, setLocalDate] = useState<DateRange | undefined>(initialDate) // Local state for date

  const handleOkClick = () => {
    setDate(localDate) // Update parent filters state
    setOpen(false) // Close the popover
  }

  const handleClearClick = () => {
    setLocalDate(undefined)
    setDate(undefined)
    setOpen(false)
  }

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id='date'
            variant={'outline'}
            className={cn(
              'w-[300px] justify-start text-left font-normal',
              !localDate && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className='mr-2 h-4 w-4' />
            {localDate?.from ? (
              localDate.to ? (
                <>
                  {format(localDate.from, 'LLL dd, y')} -{' '}
                  {format(localDate.to, 'LLL dd, y')}
                </>
              ) : (
                format(localDate.from, 'LLL dd, y')
              )
            ) : (
              'Pick a date'
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0' align='end'>
          <Calendar
            initialFocus
            mode='range'
            defaultMonth={localDate?.from}
            selected={localDate}
            onSelect={setLocalDate} // Update local date state
            numberOfMonths={2}
          />
          <div className='flex justify-end p-2 gap-2'>
            <Button
              size='sm'
              variant='outline'
              onClick={handleClearClick}
              className='cursor-pointer'
            >
              Clear
            </Button>
            <Button
              size='sm'
              onClick={handleOkClick}
              className='cursor-pointer'
            >
              OK
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
