import axios from 'axios'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { ENV } from '../conf'
import { getCompanyName, getUserFromToken } from '../lib/utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog'

import { Skeleton } from '../components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table'
import type { UserType } from '../types'
import { Card, CardContent } from '../components/ui/card'
import RoleBadge from '../components/ui/role-badge'
import CompanyType from '../components/ui/company-type'
import { useApiQuery } from '../api/hooks'

export default function Users() {
  // const [data, setData] = useState<UserType[]>([])
  const [selectedUser, setSelectedUser] = useState<{
    id: string
    role: string
  } | null>(null)
  // const [isModalOpen, setIsModalOpen] = useState(false)
  // const [isLoading, setIsLoading] = useState(true)
  const user = getUserFromToken()
  const { data, isPending, error } = useApiQuery('/users')

  // const handleRoleChange = (userId: string, newRole: string) => {
  //   setSelectedUser({ id: userId, role: newRole })
  //   setIsModalOpen(true)
  // }

  // const handleRoleChangeFetch = async (id: string, role: string) => {
  //   // 1. Snapshot previous state
  //   const previousData = [...data]

  //   // 2. Optimistically update UI
  //   setData(data.map((u) => (u._id === id ? { ...u, role } : u)))
  //   setIsModalOpen(false)

  //   try {
  //     // 3. Fire off the request using async/await
  //     const res = await axios.put(`${ENV.BACKEND_URL}/user/${id}`, { role })
  //     console.log(res.data)
  //     toast.success(`${res.data.message}`)
  //   } catch (err: any) {
  //     console.error(err)
  //     // 4. Roll back on error
  //     toast.error(`Error while changing user role: ${err.message}`)
  //     setData(previousData)
  //   }
  // }

  // const fetchMe = () => {
  //   setIsLoading(true)
  //   axios
  //     .get(`${ENV.BACKEND_URL}/users`)
  //     .then((res) => setData(res.data))
  //     .catch((er) => console.log(er))
  //     .finally(() => setIsLoading(false))
  // }

  // useEffect(() => {
  //   fetchMe()
  // }, [])

  if (error) {
    return (
      <div className='flex justify-center items-center h-screen text-red-500'>
        {error.message}
      </div>
    )
  }
  return (
    <>
      <Card>
        <CardContent>
          <Table className='text-base whitespace-nowrap'>
            <TableHeader>
              <TableRow className='bg-gray-50'>
                <TableHead>S.No</TableHead>
                <TableHead>Company Name</TableHead>
                <TableHead>Who</TableHead>
                <TableHead>Company ID</TableHead>
                <TableHead>Role</TableHead>
                {/* <TableHead>Change Role</TableHead> */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isPending
                ? Array.from({ length: 10 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className='h-4 w-6' />
                      </TableCell>
                      <TableCell>
                        <Skeleton className='h-4 w-48' />
                      </TableCell>
                      <TableCell>
                        <Skeleton className='h-4 w-24' />
                      </TableCell>
                      <TableCell>
                        <Skeleton className='h-4 w-32' />
                      </TableCell>
                      <TableCell>
                        <Skeleton className='h-4 w-32' />
                      </TableCell>
                      {/* <TableCell>
                    <Skeleton className='h-4 w-32' />
                  </TableCell> */}
                    </TableRow>
                  ))
                : data?.map((u: UserType, idx: number) => (
                    <TableRow key={u._id} className='font-semibold'>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>{u.companyName}</TableCell>
                      <TableCell>
                        <CompanyType role={u.role} />
                        {/* {u.role === 'admin' ? (
                          <Badge
                            variant='outline'
                            className='bg-blue-50 text-green-600 border-blue-200 uppercase'
                          >
                            anchor
                          </Badge>
                        ) : (
                          <Badge
                            variant='outline'
                            className='bg-blue-50 text-blue-600 border-blue-200 uppercase'
                          >
                            distributor
                          </Badge>
                        )} */}
                      </TableCell>

                      <TableCell className=''>
                        {getCompanyName(u.companyId)}
                      </TableCell>
                      <TableCell
                        className={u.role === 'admin' ? 'text-red-400' : ''}
                      >
                        <RoleBadge role={u.role} />
                      </TableCell>
                      {/* <TableCell>
                    {u.username !== user?.username ? (
                      <Select
                        value={u.role}
                        onValueChange={(v) => handleRoleChange(u._id, v)}
                        disabled={u.username === user?.username}
                      >
                        <SelectTrigger
                          className={`w-[180px] ${
                            u.username === user?.username
                              ? 'opacity-50 cursor-not-allowed'
                              : ''
                          }`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent side='top' className=''>
                          <SelectGroup>
                            <SelectItem value='admin'>Admin</SelectItem>
                            <SelectItem value='viewer'>Viewer</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className='w-[180px] flex items-center justify-center'>
                        <p className='font-semibold text-blue-400'>You</p>
                      </div>
                    )}
                  </TableCell> */}
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
          {/* {isModalOpen && selectedUser && (
            <AlertDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <AlertDialogContent className='bg-black'>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Role Change</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to change role to {selectedUser.role}?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    onClick={() => setIsModalOpen(false)}
                    className='cursor-pointer'
                  >
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() =>
                      handleRoleChangeFetch(selectedUser.id, selectedUser.role)
                    }
                    className='cursor-pointer bg-white text-black'
                  >
                    Ok
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )} */}
        </CardContent>
      </Card>
    </>
  )
}
