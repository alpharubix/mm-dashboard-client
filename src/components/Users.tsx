import axios from 'axios'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { ENV } from '../conf'
import { capitalize, getUserFromToken } from '../lib/utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { Skeleton } from './ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table'

type UserType = {
  _id: string
  email: string
  role: string
}

export default function Users() {
  const [data, setData] = useState<UserType[]>([])
  const [selectedUser, setSelectedUser] = useState<{
    id: string
    role: string
  } | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const user = getUserFromToken()

  const handleRoleChange = (userId: string, newRole: string) => {
    setSelectedUser({ id: userId, role: newRole })
    setIsModalOpen(true)
  }

  const handleRoleChangeFetch = async (id: string, role: string) => {
    // 1. Snapshot previous state
    const previousData = [...data]

    // 2. Optimistically update UI
    setData(data.map((u) => (u._id === id ? { ...u, role } : u)))
    setIsModalOpen(false)

    try {
      // 3. Fire off the request using async/await
      const res = await axios.put(`${ENV.BACKEND_URL}/user/${id}`, { role })
      console.log(res.data)
      toast.success(`${res.data.message}`)
    } catch (err: any) {
      console.error(err)
      // 4. Roll back on error
      toast.error(`Error while changing user role: ${err.message}`)
      setData(previousData)
    }
  }

  const fetchMe = () => {
    setIsLoading(true)
    axios
      .get(`${ENV.BACKEND_URL}/users`)
      .then((res) => setData(res.data))
      .catch((er) => console.log(er))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    fetchMe()
  }, [])

  return (
    <>
      <Table className='text-base'>
        <TableHeader>
          <TableRow>
            <TableHead>S.No</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Change Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
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
                </TableRow>
              ))
            : data.map((u, idx) => (
                <TableRow key={u._id}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell
                    className={u.role === 'admin' ? 'text-red-400' : ''}
                  >
                    {capitalize(u.role)}
                  </TableCell>
                  <TableCell>
                    {u.email !== user?.email ? (
                      <Select
                        value={u.role}
                        onValueChange={(v) => handleRoleChange(u._id, v)}
                        disabled={u.email === user?.email}
                      >
                        <SelectTrigger
                          className={`w-[180px] ${
                            u.email === user?.email
                              ? 'opacity-50 cursor-not-allowed'
                              : ''
                          }`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent
                          side='top'
                          className='bg-black text-white'
                        >
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
                  </TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>
      {isModalOpen && selectedUser && (
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
      )}
    </>
  )
}
