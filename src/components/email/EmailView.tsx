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
import { Spinner } from '../ui/spinner'
import Toolbar from './Toolbar'

export default function EmailDrawerView({
  open,
  setOpen,
  template,
  editor,
  handleMailCheck,
  emailDetails,
  handleSendButton,
  attachments,
  eligiblityStatus,
  totalEligibleInvoiceCount,
}: any) {
  const isEligible =
    totalEligibleInvoiceCount === undefined || totalEligibleInvoiceCount > 0

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {isEligible ? (
        <DialogTrigger asChild>
          <div>
            <Button
              variant='outline'
              className='w-24 relative cursor-pointer hover:border-ring hover:ring-ring/50 hover:ring-[3px]'
              onClick={() => handleMailCheck()}
            >
              Send
              {totalEligibleInvoiceCount > 0 && (
                <span className='absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-green-400 text-xs text-white'>
                  {totalEligibleInvoiceCount}
                </span>
              )}
            </Button>
          </div>
        </DialogTrigger>
      ) : (
        <Button variant='outline' className='w-24' disabled>
          No Invoices
        </Button>
      )}

      <DialogContent
        onOpenAutoFocus={(e) => {
          e.preventDefault()
        }}
        className='sm:max-w-[650px] max-h-[750px] overflow-scroll'
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle aria-describedby={undefined}></DialogTitle>
        </DialogHeader>

        {!template ? (
          <Spinner className='mx-auto' />
        ) : (
          <form onSubmit={handleSendButton}>
            <div className='grid gap-2'>
              <div className='grid gap-1'>
                <Label htmlFor='from'>From</Label>
                <Input id='from' name='from' defaultValue={emailDetails.from} />
              </div>

              <div className='grid gap-1'>
                <Label htmlFor='to'>To</Label>
                <Input
                  id='to'
                  name='to'
                  placeholder='To'
                  defaultValue={emailDetails.to}
                />
              </div>

              <div className='grid gap-1'>
                <Label htmlFor='cc'>Cc</Label>
                <Input
                  id='cc'
                  name='cc'
                  placeholder='Cc'
                  defaultValue={emailDetails.cc}
                />
              </div>

              <div className='grid gap-1'>
                <Label htmlFor='subject'>Subject</Label>
                <Input
                  id='subject'
                  name='subject'
                  placeholder='Subject'
                  defaultValue={emailDetails.subject}
                />
              </div>

              <div className='flex items-center gap-2'>
                {attachments?.csv && (
                  <span>
                    <a
                      download={attachments.csv.filename}
                      href={`data:${attachments.csv.mime};base64,${attachments.csv.base64}`}
                      className='inline underline text-blue-500'
                    >
                      Download CSV
                    </a>
                  </span>
                )}

                {attachments?.pdf && (
                  <span>
                    <a
                      href={attachments.pdf.url}
                      target='_blank'
                      rel='noreferrer'
                      className='inline underline text-blue-500'
                    >
                      View PDF
                    </a>
                  </span>
                )}
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
