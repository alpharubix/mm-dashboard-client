import { ChangeEvent, forwardRef } from 'react'
import { Input } from './input'

type Props = {
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
}

export const InputFile = forwardRef<HTMLInputElement, Props>(
  ({ onChange }, ref) => (
    <div className='grid w-full max-w-sm items-center gap-1.5'>
      <Input
        id='file'
        type='file'
        accept='.csv'
        onChange={onChange}
        ref={ref}
      />
    </div>
  )
)
