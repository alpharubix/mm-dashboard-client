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
// import { Textarea } from './ui/textarea'
import { useEditor, EditorContent } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { Table } from '@tiptap/extension-table'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableRow } from '@tiptap/extension-table-row'
import './Editor.css'

type FormDataType = {
  from: string
  to: string
  cc: string
  body: string
}



const Toolbar = ({ editor }:any) => {
  if (!editor) {
    return null
  }

  return (
    <div className="toolbar">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'is-active' : ''}
      >
        Bold
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'is-active' : ''}
      >
        Italic
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? 'is-active' : ''}
      >
        Bullet List
      </button>
      <button
        onClick={() =>
          editor
            .chain()
            .focus()
            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            .run()
        }
      >
        Insert Table
      </button>
      <button onClick={() => editor.chain().focus().addColumnAfter().run()}>
        Add Col
      </button>
      <button onClick={() => editor.chain().focus().addRowAfter().run()}>
        Add Row
      </button>
      <button onClick={() => editor.chain().focus().deleteTable().run()}>
        Delete Table
      </button>
    </div>
  )
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

  const editor = useEditor({
    extensions: [
      StarterKit,
      // Configure all the table extensions
      Table.configure({
        resizable: true, // Allows column resizing
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: `
      <h2>Hi there,</h2>
      <p>Click the 'Insert Table' button!</p>
    `,
  })

  const handleSendToBackend = () => {
    const html = editor.getHTML()

    console.log(html)
  }

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="cursor-pointer">
            Send Mail
          </Button>
        </DialogTrigger>
        {/* TODO */}
        <DialogContent className="sm:max-w-[550px] max-h-[750px] overflow-scroll">
          <DialogHeader>
            <DialogTitle>Mail Template</DialogTitle>
            <DialogDescription>
              Make changes to your template here. Click save when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <div className="grid gap-1">
                <Label htmlFor="from">From</Label>
                <Input
                  id="from"
                  name="from"
                  defaultValue="techmgr@meramerchant.com"
                />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="to">To</Label>
                <Input
                  id="to"
                  name="to"
                  defaultValue="techmgr@meramerchant.com"
                />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="cc">CC</Label>
                <Input
                  id="cc"
                  name="cc"
                  defaultValue="surajgupta3940@gmail.com"
                />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" name="subject" defaultValue="Test" />
              </div>
              <div className="grid gap-1">
                <Label htmlFor='body'>Body</Label>
                <div className="editor-wrapper">
                  <Toolbar editor={editor} />
                  <EditorContent editor={editor} />
                </div>
              </div>
            </div>
            <DialogFooter className="mt-2">
              <DialogClose asChild>
                <Button variant="outline" className="cursor-pointer">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" onClick={handleSendToBackend}>
                Send
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
