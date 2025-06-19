import { Menu } from 'lucide-react'
import { useEffect } from 'react'
import { camelCaseToWords, getUserFromToken } from '../lib/utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog'
import { Button } from './ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTrigger,
} from './ui/drawer'
import { Badge } from './ui/badge'

export default function Header() {
  const user = getUserFromToken()

  useEffect(() => {
    if (!localStorage.getItem('mm_auth_token')) {
      window.location.href = '/login'
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('mm_auth_token')
    window.location.href = '/login'
  }

  return (
    <header className='bg-white shadow-sm border-b'>
      <div className='flex items-center justify-between px-6 py-4'>
        {/* Logo */}
        <h1 className='text-2xl font-bold text-gray-900'>Meramerchant</h1>

        {/* Desktop user info */}
        <div className='hidden md:flex items-center space-x-4'>
          <span className='text-sm text-gray-600'>{user?.companyName}</span>
          <Badge
            variant='outline'
            className='bg-blue-50 text-blue-700 border-blue-200 uppercase'
          >
            {camelCaseToWords(user?.role || '')}
          </Badge>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant='ghost'
                className='text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer'
              >
                Logout
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Do you want to Logout?</AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className='cursor-pointer'>
                  No
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleLogout}
                  className='cursor-pointer'
                >
                  Yes
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Mobile drawer trigger */}
        <div className='md:hidden'>
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant='ghost' size='sm'>
                <Menu size={24} />
              </Button>
            </DrawerTrigger>
            <DrawerContent className=''>
              <div className='mx-auto w-full max-w-sm'>
                <DrawerHeader className='flex items-center justify-between'>
                  {/* <DrawerTitle>Menu</DrawerTitle> */}
                </DrawerHeader>
                <DrawerDescription>
                  <div className='flex gap-2 mt-4 items-center justify-center'>
                    <span className='text-lg font-bold'>{user?.username}</span>
                    <span className='px-2 py-1 text-xs font-semibold uppercase rounded-full bg-blue-100 text-blue-800'>
                      {camelCaseToWords(user?.role || '')}
                    </span>
                  </div>
                </DrawerDescription>
                <DrawerFooter>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant='outline'
                        className='mx-auto text-red-500 cursor-pointer'
                      >
                        Logout
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Do you want to Logout ?
                        </AlertDialogTitle>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className='cursor-pointer'>
                          No
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleLogout}
                          className='cursor-pointer'
                        >
                          Yes
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <DrawerClose asChild>
                    <Button
                      variant='outline'
                      size='sm'
                      className='cursor-pointer mx-auto w-full max-w-20'
                    >
                      Cancel
                    </Button>
                  </DrawerClose>
                </DrawerFooter>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </header>
    // <header className='bg-white border-b border-gray-200 px-6 py-4'>
    //   <div className='flex items-center justify-between'>
    //     <h1 className='text-2xl font-bold text-gray-900'>Meramerchant</h1>
    //     <div className='flex items-center gap-4'>
    //       <span className='text-sm text-gray-600'>tester@gmail.com</span>
    //       <Badge
    //         variant='outline'
    //         className='bg-blue-50 text-blue-700 border-blue-200'
    //       >
    //         SUPER ADMIN
    //       </Badge>
    //       <Button
    //         variant='ghost'
    //         className='text-red-600 hover:text-red-700 hover:bg-red-50'
    //       >
    //         Logout
    //       </Button>
    //     </div>
    //   </div>
    // </header>
  )
}
