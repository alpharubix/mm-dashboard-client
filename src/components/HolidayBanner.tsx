import { useState } from 'react'
import { Bell, Edit, Trash2 } from 'lucide-react'
import { useApiQuery, useApiPut } from '../api/hooks'
import { getUserFromToken } from '../lib/utils'
import { Button } from './ui/button'
import { toast } from 'sonner'
import CreateBannerModal from './CreateBannerModal'

export default function HolidayBanner() {
  const user = getUserFromToken()
  const isSuperAdmin = user?.role === 'superAdmin'
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const {
    data: bannerData,
    refetch,
    isError,
  } = useApiQuery('/banner', { enabled: true }, { retry: false })

  const deactivateMutation: any = useApiPut('/banner/deactivate')

  const banner = (bannerData as Record<string, any>)?.data

  const handleDeactivate = async () => {
    try {
      await deactivateMutation.mutateAsync({})
      toast.success('Banner deactivated successfully')
      refetch()
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(
          (error as unknown as { response?: { data?: { message?: string } } })
            .response?.data?.message ||
            error.message ||
            'Failed to deactivate banner',
        )
      } else {
        toast.error('Failed to deactivate banner')
      }
    }
  }

  if (isError || !banner || !banner.isActive) {
    return (
      <>
        {isEditModalOpen && (
          <CreateBannerModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSuccess={refetch}
            initialData={banner}
          />
        )}
      </>
    )
  }

  return (
    <>
      <div className='w-full bg-yellow-50 border-b border-yellow-200 p-4 shadow-sm relative group'>
        <div className='container mx-auto flex items-start gap-3 text-sm text-yellow-800 px-4 sm:px-6 lg:px-8 relative'>
          <Bell className='h-5 w-5 text-yellow-600 mt-0.5 shrink-0' />
          <div className='space-y-2 pr-20'>
            <p className='font-semibold'>{banner.title}</p>
            <div className='whitespace-pre-wrap'>{banner.description}</div>
          </div>

          {isSuperAdmin && (
            <div className='absolute top-0 right-4 flex items-center gap-2'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setIsEditModalOpen(true)}
                className='text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100 cursor-pointer h-8 w-8 p-0'
              >
                <Edit className='h-4 w-4' />
              </Button>
              <Button
                variant='ghost'
                size='sm'
                onClick={handleDeactivate}
                className='text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer h-8 w-8 p-0'
              >
                <Trash2 className='h-4 w-4' />
              </Button>
            </div>
          )}
        </div>
      </div>

      {isEditModalOpen && (
        <CreateBannerModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={refetch}
          initialData={banner}
        />
      )}
    </>
  )
}
