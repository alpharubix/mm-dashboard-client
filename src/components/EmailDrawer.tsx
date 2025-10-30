import { useApiPost } from '../api/hooks'
import { Button } from './ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'

type FormDataType = {
  from: string
  to: string
  cc: string
  body: string
}

export default function EmailDrawer() {
  const mutation = useApiPost('/test-mail')

  const handleFormData = (form: HTMLFormElement) => {
    const formData = new FormData(form)
    const payload = Object.fromEntries(formData.entries())
    const data = mutation.mutate(payload)
    console.log({ data })
  }

  const handleSubmit = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault()
    handleFormData(evt.currentTarget)
  }

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant='outline' className='cursor-pointer'>
            Send Mail
          </Button>
        </DialogTrigger>
        {/* TODO */}
        <DialogContent className='sm:max-w-[550px] max-h-[750px] overflow-scroll'>
          <DialogHeader>
            <DialogTitle>Mail Template</DialogTitle>
            <DialogDescription>
              Make changes to your template here. Click save when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className='grid gap-2'>
              <div className='grid gap-1'>
                <Label htmlFor='from'>From</Label>
                <Input
                  id='from'
                  name='from'
                  defaultValue='techmgr@meramerchant.com'
                />
              </div>
              <div className='grid gap-1'>
                <Label htmlFor='to'>To</Label>
                <Input
                  id='to'
                  name='to'
                  defaultValue='techmgr@meramerchant.com'
                />
              </div>
              <div className='grid gap-1'>
                <Label htmlFor='cc'>CC</Label>
                <Input
                  id='cc'
                  name='cc'
                  defaultValue='surajgupta3940@gmail.com'
                />
              </div>
              <div className='grid gap-1'>
                <Label htmlFor='subject'>Subject</Label>
                <Input id='subject' name='subject' defaultValue='Test' />
              </div>
              <div className='grid gap-1'>
                <Label htmlFor='body'>Body</Label>
                <Textarea
                  rows={8}
                  id='body'
                  name='body'
                  defaultValue='Lorem ips Lorem ipsum dolor sit amet consectetur adipisicing elit. Optio, fugit!'
                />
              </div>
            </div>
            <DialogFooter className='mt-2'>
              <DialogClose asChild>
                <Button variant='outline' className='cursor-pointer'>
                  Cancel
                </Button>
              </DialogClose>
              <Button type='submit' className='cursor-pointer'>
                Send
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
