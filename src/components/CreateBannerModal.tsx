import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Button } from './ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { useApiPost, useApiPut } from '../api/hooks'
import { toast } from 'sonner'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  initialData?: {
    _id?: string
    title?: string
    description?: string
    startDate?: string
    endDate?: string
  }
}

function parseDateTime12Hr(dateStr: string) {
  if (!dateStr) return { date: '', h: '12', m: '00', ampm: 'AM' }
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return { date: '', h: '12', m: '00', ampm: 'AM' }

  const date = d.toISOString().split('T')[0]
  let hours = d.getHours()
  const minutes = d.getMinutes().toString().padStart(2, '0')
  const ampm = hours >= 12 ? 'PM' : 'AM'

  hours = hours % 12
  hours = hours ? hours : 12 // the hour '0' should be '12'
  const hStr = hours.toString().padStart(2, '0')

  return { date, h: hStr, m: minutes, ampm }
}

function combineDateTime12Hr(date: string, h: string, m: string, ampm: string) {
  if (!date) return ''
  let hours = parseInt(h, 10)
  if (ampm === 'PM' && hours !== 12) hours += 12
  if (ampm === 'AM' && hours === 12) hours = 0

  const d = new Date(date)
  d.setHours(hours, parseInt(m, 10), 0, 0)
  return d.toISOString()
}

export default function CreateBannerModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const [startDate, setStartDate] = useState('')
  const [startH, setStartH] = useState('12')
  const [startM, setStartM] = useState('00')
  const [startAmpm, setStartAmpm] = useState('AM')

  const [endDate, setEndDate] = useState('')
  const [endH, setEndH] = useState('12')
  const [endM, setEndM] = useState('00')
  const [endAmpm, setEndAmpm] = useState('PM') // default to PM for end time

  const createMutation = useApiPost('/banner')
  const updateMutation = useApiPut('/banner')

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '')
      setDescription(initialData.description || '')

      const s = parseDateTime12Hr(initialData.startDate || '')
      if (s.date) {
        setStartDate(s.date)
        setStartH(s.h)
        setStartM(s.m)
        setStartAmpm(s.ampm)
      }

      const e = parseDateTime12Hr(initialData.endDate || '')
      if (e.date) {
        setEndDate(e.date)
        setEndH(e.h)
        setEndM(e.m)
        setEndAmpm(e.ampm)
      }
    } else {
      // Default dates
      const now = new Date()
      const start = parseDateTime12Hr(now.toISOString())
      setStartDate(start.date)
      setStartH(start.h)
      setStartM(start.m)
      setStartAmpm(start.ampm)

      now.setDate(now.getDate() + 7)
      const end = parseDateTime12Hr(now.toISOString())
      setEndDate(end.date)
      setEndH('11')
      setEndM('59')
      setEndAmpm('PM')
    }
  }, [initialData, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast.error('Title is required')
      return
    }
    if (!startDate || !endDate) {
      toast.error('Start and End dates are required')
      return
    }

    const sDate = combineDateTime12Hr(startDate, startH, startM, startAmpm)
    const eDate = combineDateTime12Hr(endDate, endH, endM, endAmpm)

    if (new Date(sDate) > new Date(eDate)) {
      toast.error('Start date cannot be after end date')
      return
    }

    const payload = {
      title,
      description,
      startDate: sDate,
      endDate: eDate,
    }

    try {
      if (initialData?._id) {
        await updateMutation.mutateAsync(payload)
        toast.success('Banner updated successfully')
      } else {
        await createMutation.mutateAsync(payload)
        toast.success('Banner created successfully')
      }
      onSuccess()
      onClose()
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(
          (err as unknown as { response?: { data?: { message?: string } } })
            .response?.data?.message ||
            err.message ||
            'Failed to save banner',
        )
      } else {
        toast.error('Failed to save banner')
      }
    }
  }

  const hours = Array.from({ length: 12 }, (_, i) =>
    (i + 1).toString().padStart(2, '0'),
  )
  const mins = ['00', '15', '30', '45', '59'] // common intervals for simplicity or all 60 but let's provide common

  const TimeSelector = ({
    h,
    setH,
    m,
    setM,
    ampm,
    setAmpm,
  }: {
    h: string
    setH: (v: string) => void
    m: string
    setM: (v: string) => void
    ampm: string
    setAmpm: (v: string) => void
  }) => (
    <div className='flex gap-2 w-full sm:w-auto'>
      <Select value={h} onValueChange={setH}>
        <SelectTrigger className='w-[70px]'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {hours.map((hour) => (
            <SelectItem key={hour} value={hour}>
              {hour}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className='self-center'>:</span>
      <Select value={m} onValueChange={setM}>
        <SelectTrigger className='w-[70px]'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 60 }, (_, i) =>
            i.toString().padStart(2, '0'),
          ).map((min) => (
            <SelectItem key={min} value={min}>
              {min}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={ampm} onValueChange={setAmpm}>
        <SelectTrigger className='w-20'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='AM'>AM</SelectItem>
          <SelectItem value='PM'>PM</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[550px]'>
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Edit Banner' : 'Create Banner'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4 mt-4'>
          <div className='space-y-2'>
            <Label>Title</Label>
            <Input
              placeholder='Ex: Disbursement Closed'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className='space-y-2'>
            <Label>Description</Label>
            <Textarea
              className='min-h-[100px]'
              placeholder='Enter details here...'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className='grid sm:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label>Start Date</Label>
              <Input
                type='date'
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
              <TimeSelector
                h={startH}
                setH={setStartH}
                m={startM}
                setM={setStartM}
                ampm={startAmpm}
                setAmpm={setStartAmpm}
              />
            </div>

            <div className='space-y-2'>
              <Label>End Date</Label>
              <Input
                type='date'
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
              <TimeSelector
                h={endH}
                setH={setEndH}
                m={endM}
                setM={setEndM}
                ampm={endAmpm}
                setAmpm={setEndAmpm}
              />
            </div>
          </div>

          <div className='flex justify-end gap-2 pt-4'>
            <Button type='button' variant='outline' onClick={onClose}>
              Cancel
            </Button>
            <Button type='submit'>Save Banner</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
