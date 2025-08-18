import { Menu } from 'lucide-react'
import { useEffect, useState } from 'react'
import { camelCaseToWords, getUserFromToken } from '../lib/utils'
import logo from '../assets/logo.png'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'

export default function Header() {
  const user = getUserFromToken()
  const isSuperAdmin = user?.role === 'superAdmin' || false
  const [showLoader, setShowLoader] = useState(false)

  const [anchor, setAnchor] = useState(() => {
    // Only set anchor for superAdmin
    if (isSuperAdmin) {
      return localStorage.getItem('mm_anchor') || 'ckpl'
    }
    return '' // or empty string for non-superAdmin
  })

  useEffect(() => {
    if (!localStorage.getItem('mm_auth_token')) {
      window.location.href = '/login'
      return
    }

    // Only handle mm_anchor for superAdmin
    if (isSuperAdmin) {
      if (!localStorage.getItem('mm_anchor')) {
        localStorage.setItem('mm_anchor', 'ckpl')
        setAnchor('ckpl')
      }
    } else {
      // Clean up anchor for non-superAdmin users
      localStorage.removeItem('mm_anchor')
      setAnchor('')
    }
  }, [isSuperAdmin])

  const handleLogout = () => {
    localStorage.removeItem('mm_auth_token')
    localStorage.removeItem('mm_anchor')
    window.location.href = '/login'
  }

  return (
    <header className='bg-white shadow-sm border-b'>
      <div className='flex items-center justify-between px-6 py-px'>
        {/* Logo */}
        <div>
          <img
            src={logo}
            alt='R1Xchange Logo'
            style={{
              width: '170px',
            }}
          />
        </div>
        {/* <h1 className='text-2xl font-bold text-gray-900'>R1Xchange</h1> */}

        {/* Desktop user info */}
        <div className='hidden md:flex items-center space-x-4'>
          {user?.role === 'superAdmin' ? (
            <>
              {showLoader ? (
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='20'
                  height='20'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  stroke-width='2'
                  stroke-linecap='round'
                  stroke-linejoin='round'
                  className='lucide lucide-rotate-icon-icon lucide-rotate-icon cursor-pointer size-4'
                  data-v-c31f8f1d=''
                  onClick={() => window.location.reload()}
                >
                  <path d='M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8'></path>
                  <path d='M21 3v5h-5'></path>
                </svg>
              ) : null}
              <Select
                value={anchor}
                onValueChange={(value) => {
                  setShowLoader(true)
                  setAnchor(value)
                  localStorage.setItem('mm_anchor', value)
                }}
              >
                <SelectTrigger className='h-10'>
                  <SelectValue placeholder='Select anchor' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='ckpl'>CavinKare</SelectItem>
                  <SelectItem value='hwc'>Himalaya</SelectItem>
                </SelectContent>
              </Select>
            </>
          ) : null}

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
                    {user?.role === 'superAdmin' ? (
                      <Select
                        value={anchor}
                        onValueChange={(value) => {
                          setAnchor(value)
                          localStorage.setItem('mm_anchor', value)
                        }}
                      >
                        <SelectTrigger className='h-10'>
                          <SelectValue placeholder='Select status' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='ckpl'>CavinKare</SelectItem>
                          <SelectItem value='hwc'>Himalaya</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : null}
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
  )
}
