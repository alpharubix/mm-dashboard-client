import { EditorContent } from '@tiptap/react'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import Toolbar from './Toolbar'

export default function EmailDrawerView({
  open,
  setOpen,
  template,
  editor,
  handleSubmit,
  handleMailCheck,
}: any) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant='outline'
          className='cursor-pointer'
          onClick={() => handleMailCheck()}
        >
          Send Mail
        </Button>
      </DialogTrigger>

      <DialogContent
        className='sm:max-w-[650px] max-h-[750px] overflow-scroll'
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle aria-describedby={undefined}></DialogTitle>
        </DialogHeader>

        {!template ? (
          <div className='p-4 text-sm text-gray-500'>Loading template...</div>
        ) : (
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
                <Input id='to' name='to' placeholder='To' />
              </div>

              <div className='grid gap-1'>
                <Label htmlFor='cc'>Cc</Label>
                <Input id='cc' name='cc' placeholder='Cc' />
              </div>

              <div className='grid gap-1'>
                <Label htmlFor='subject'>Subject</Label>
                <Input id='subject' name='subject' placeholder='Subject' />
              </div>

              {editor && (
                <div className='editor-wrapper'>
                  <Toolbar editor={editor} />
                  <div className='overflow-scroll'>
                    <EditorContent editor={editor} className='min-w-[900px]' />
                  </div>
                </div>
              )}
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
        )}
      </DialogContent>
    </Dialog>
  )
}
