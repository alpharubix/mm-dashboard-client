import { ChangeEvent, forwardRef } from 'react'
import { Upload } from 'lucide-react'

type Props = {
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  file?: File | null
}

export const InputFile = forwardRef<HTMLInputElement, Props>(
  ({ onChange, file }, ref) => (
    <div className='relative w-full'>
      <input
        type='file'
        onChange={onChange}
        ref={ref}
        className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
        accept='.csv'
      />
      <div className='flex items-center gap-2 p-3 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors'>
        <Upload className='h-4 w-4 text-gray-500' />
        <span className='text-sm text-gray-600'>
          {file ? file.name : 'No file chosen'}
        </span>
      </div>
    </div>
  )
)
