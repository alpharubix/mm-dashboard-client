import { api } from '@/api'
import {
  Table,
  TableCell,
  TableHeader,
  TableRow,
} from '@tiptap/extension-table'
import { useEditor } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import './Editor.css'
import EmailDrawerView from './email/EmailView'
import { Button } from './ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'

export default function EmailContainer({
  distributorCode,
  invoiceNumber,
  onStatusUpdated,
  totalEligibleInvoiceCount,
}: any) {
  const [open, setOpen] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [template, setTemplate] = useState('')
  const [body, setBody] = useState('')
  const [attachments, setAttachments] = useState<any>(null)
  const [emailDetails, setEmailDetails] = useState({
    to: '',
    from: '',
    cc: '',
    subject: '',
    body: '',
  })
  const [formPayload, setFormPayload] = useState<any>(null)
  const editor = useEditor({
    extensions: [
      StarterKit,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: template,
    onUpdate: ({ editor }) => setBody(editor.getHTML()),
  })

  useEffect(() => {
    return () => editor?.destroy()
  }, [editor])

  const fetchTemplate = async () => {
    const url = `/email-template?distributorCode=${distributorCode}&invoiceNumber=${invoiceNumber}`
    const res = await api.get(url)
    return res.data.data
  }

  const checkEligibility = async () => {
    try {
      const res = await api.post('/email-eligibility-check', {
        distributorCode,
        invoiceNumber,
      })
      toast.success(res.data.message)
      return res.data
    } catch (err: any) {
      toast.error(err.response.data.message)
      return { isEligible: false }
    }
  }

  const handleMailCheckAndSubmit = async () => {
    const eligibility = await checkEligibility()
    if (!eligibility.isEligible) {
      setOpen(false)
      onStatusUpdated?.()
      return
    }

    setOpen(true)

    try {
      const tpl = await fetchTemplate()
      setEmailDetails(tpl)

      const cleanHtml = (tpl?.body || '<p>Default content...</p>')
        .replace(/\\"/g, '"')
        .replace(/\\'/g, "'")

      setTemplate(cleanHtml)
      setBody(cleanHtml)
      setAttachments(tpl.attachments)
      editor?.commands.setContent(cleanHtml)
    } catch {
      const fallback = '<p>Default content...</p>'
      setTemplate(fallback)
      setBody(fallback)
      editor?.commands.setContent(fallback)
      toast.error('Something went wrong')
    }
  }

  const handleSendButton = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault()
    const formData = new FormData(evt.currentTarget)

    setFormPayload({
      ...Object.fromEntries(formData.entries()),
      distributorCode,
      invoiceNumber,
      body,
      csv: attachments?.csv,
      pdfUrl: attachments?.pdf?.url,
    })

    setConfirmDialogOpen(true)
  }

  const handleSubmit = async () => {
    setConfirmDialogOpen(false)
    setOpen(false)
    if (!formPayload) return

    try {
      const res = await api.post('/send-mail', formPayload)
      // refetch()
      onStatusUpdated?.()
      toast.success(res.data.message)
    } catch (err: any) {
      toast.error(err.response.data.message)
    }
  }

  return (
    <>
      <EmailDrawerView
        open={open}
        setOpen={setOpen}
        template={template}
        editor={editor}
        handleMailCheck={handleMailCheckAndSubmit}
        emailDetails={emailDetails}
        attachments={attachments}
        handleSendButton={handleSendButton}
        totalEligibleInvoiceCount={totalEligibleInvoiceCount}
      />

      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent
          className="sm:max-w-[400px]"
          aria-describedby={undefined}
        >
          <DialogHeader>
            <DialogTitle>Confirm Send</DialogTitle>
          </DialogHeader>

          <p>Are you sure you want to send this email?</p>

          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSubmit}>Yes, Send</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
