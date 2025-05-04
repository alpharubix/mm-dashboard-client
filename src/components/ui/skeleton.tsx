import { cn } from '../../lib/utils'

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='skeleton'
      className={cn('animate-pulse rounded-sm bg-gray-500', className)}
      {...props}
    />
  )
}

export { Skeleton }
