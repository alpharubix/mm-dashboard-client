import { Menu } from 'lucide-react'
import { useEffect } from 'react'
import { getUserFromToken } from '../lib/utils'
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
    <>
      <header className='flex items-center justify-between px-6 py-4'>
        {/* Logo */}
        <div className='text-2xl font-extrabold tracking-wide'>
          Meramerchant
        </div>

        {/* Desktop user info */}
        <div className='hidden md:flex items-center space-x-4'>
          <span className='text-sm font-medium'>{user?.email}</span>
          <span className='px-2 py-1 text-xs font-semibold uppercase rounded-full bg-blue-100 text-blue-800'>
            {user?.role}
          </span>

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
            <DrawerContent className='bg-black'>
              <div className='mx-auto w-full max-w-sm'>
                <DrawerHeader className='flex items-center justify-between'>
                  {/* <DrawerTitle>Menu</DrawerTitle> */}
                </DrawerHeader>
                <DrawerDescription>
                  <div className='flex gap-2 mt-4 items-center justify-center'>
                    <span className='text-lg font-bold'>{user?.email}</span>
                    <span className='px-2 py-1 text-xs font-semibold uppercase rounded-full bg-blue-100 text-blue-800'>
                      {user?.role}
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
      </header>
    </>
  )
}
