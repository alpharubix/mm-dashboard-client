import {
  Bold,
  CircleSmall,
  Columns2,
  Grid2x2,
  Grid2x2X,
  Italic,
  Rows2,
} from 'lucide-react'

const Toolbar = ({ editor }: any) => {
  if (!editor) return null

  return (
    <div className='toolbar'>
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'is-active' : ''}
        title='Bold'
        type='button'
      >
        <Bold size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'is-active' : ''}
        title='Italic'
        type='button'
      >
        <Italic size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? 'is-active' : ''}
        title='Bullet'
        type='button'
      >
        <CircleSmall fill='true' size={16} />
      </button>
      <button
        type='button'
        onClick={() => editor.chain().focus().setHardBreak().run()}
        title='Line Break'
      >
        {'<br/>'}
      </button>
      <button
        onClick={() =>
          editor
            .chain()
            .focus()
            .insertTable({ rows: 2, cols: 2, withHeaderRow: true })
            .run()
        }
        title='Insert Table'
        type='button'
      >
        <Grid2x2 size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().addColumnAfter().run()}
        title='Add Column'
        type='button'
      >
        <Columns2 size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().addRowAfter().run()}
        title='Add Row'
        type='button'
      >
        <Rows2 size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().deleteRow().run()}
        title='Delete Row'
        className='text-sm'
        type='button'
      >
        Del Row
      </button>
      <button
        onClick={() => editor.chain().focus().deleteColumn().run()}
        title='Delete Column'
        className='text-sm'
        type='button'
      >
        Del Col
      </button>
      <button
        onClick={() => editor.chain().focus().deleteTable().run()}
        type='button'
      >
        <Grid2x2X size={16} />
      </button>
    </div>
  )
}

export default Toolbar
