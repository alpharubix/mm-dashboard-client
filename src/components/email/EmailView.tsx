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
  attachments, // This is now an Array [{filename, content, contentType}, ...]
  isSendMailLoading,
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
              disabled={isSendMailLoading}
            >
              {isSendMailLoading ? 'Sending...' : 'Send'}
              {totalEligibleInvoiceCount > 0 && !isSendMailLoading ? (
                <span className='absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-green-400 text-xs text-white'>
                  {totalEligibleInvoiceCount}
                </span>
              ) : null}
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

              {/* ✅ UPDATED: Attachments section for Array */}
              <div className='grid gap-1'>
                <Label>Attachments</Label>
                <div className='flex flex-wrap items-center gap-3'>
                  {Array.isArray(attachments) && attachments.length > 0 ? (
                    attachments.map((att: any, index: number) => {
                      // Handle fallback for keys depending on your exact backend response
                      const mime =
                        att.contentType ||
                        att.mime ||
                        'application/octet-stream'
                      const content = att.content || att.base64

                      return (
                        <a
                          key={index}
                          // Create data URI for download
                          href={`data:${mime};base64,${content}`}
                          download={att.filename}
                          className='text-sm text-blue-600 underline hover:text-blue-800 flex items-center gap-1'
                        >
                          {/* Display Filename */}
                          📄 {att.filename}
                        </a>
                      )
                    })
                  ) : (
                    <span className='text-sm text-gray-400'>
                      No attachments found
                    </span>
                  )}
                </div>
              </div>

              {editor && (
                <div className='editor-wrapper mt-2'>
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
