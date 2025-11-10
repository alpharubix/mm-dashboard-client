import { Table } from '@tiptap/extension-table'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableRow } from '@tiptap/extension-table-row'
import { useEditor } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { useApiPost } from '../api/hooks'

import { api } from '@/api'
import { useEffect, useState } from 'react'
import './Editor.css'
import EmailDrawerView from './email/EmailView'

export default function EmailContainer({
  distributorCode,
  invoiceNumber,
}: any) {
  const [open, setOpen] = useState(false)
  const [template, setTemplate] = useState('')
  const [body, setBody] = useState('')
  console.log({ distributorCode })
  const mutation = useApiPost('/email-send')

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

  // useEffect(() => {
  // if (!open) return
  // refetch()
  //   .then((res) => {
  //     const html = res?.data?.body || '<p>Default content...</p>'
  //     setTemplate(html)
  //     setBody(html)
  //     editor?.commands.setContent(html)
  //   })
  //   .catch(() => {
  //     const fallback = '<p>Default content...</p>'
  //     setTemplate(fallback)
  //     setBody(fallback)
  //     editor?.commands.setContent(fallback)
  //   })
  // }, [open])

  useEffect(() => {
    return () => editor?.destroy()
  }, [editor])

  const fetchTemplate = async (
    distributorCode: string,
    invoiceNumber: string
  ) => {
    const url = `/email-template?distributorCode=${distributorCode}&invoiceNumber=${invoiceNumber}`
    const res = await api.get(url)
    console.log(res.data)
    return res.data.data
  }

  // After clicking on the check eligiblity button
  const handleMailCheck = async (
    distributorCode: string,
    invoiceNumber: string
  ) => {
    try {
      const res = await fetchTemplate(distributorCode, invoiceNumber)
      console.log(res.body)
      const html = res?.body || '<p>Default content...</p>'
      const cleanHtml = html.replace(/\\"/g, '"').replace(/\\'/g, "'")

      setTemplate(cleanHtml)
      setBody(cleanHtml)
      editor?.commands.setContent(cleanHtml)
    } catch {
      const fallback = '<p>Default content...</p>'
      setTemplate(fallback)
      setBody(fallback)
      editor?.commands.setContent(fallback)
    }
  }

  const handleSubmit = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault()
    const formData = new FormData(evt.currentTarget)
    const payload = {
      ...Object.fromEntries(formData.entries()),
      distributorCode,
      invoiceNumber,
      body,
    }
    mutation.mutate(payload)
  }

  return (
    <EmailDrawerView
      open={open}
      setOpen={setOpen}
      template={template}
      editor={editor}
      handleMailCheck={() => handleMailCheck(distributorCode, invoiceNumber)}
      handleSubmit={handleSubmit}
    />
  )
}
