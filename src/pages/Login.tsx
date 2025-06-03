import axios from 'axios'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { ENV } from '../conf'
import { cn, setAuthToken } from '../lib/utils'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const navigate = useNavigate()
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const res = await axios.post(`${ENV.BACKEND_URL}/login`, form)
      localStorage.setItem('mm_auth_token', res.data.token)
      setAuthToken()
      setForm({ email: '', password: '' })

      toast.success('Login successful')
      navigate('/', { replace: true })
    } catch (err) {
      console.error(err)
      // @ts-ignore
      toast.error(err.response.data.message)
    }
  }

  return (
    <div className='flex min-h-svh w-full items-center justify-center p-6 md:p-10'>
      <div className='w-full max-w-sm'>
        <div className={cn('flex flex-col gap-6')}>
          <Card>
            <CardHeader>
              <CardTitle className='text-2xl'>Login</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className='flex flex-col gap-6'>
                  <div className='grid gap-3'>
                    <Label htmlFor='email'>Email</Label>
                    <Input
                      id='email'
                      type='email'
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className='grid gap-3'>
                    <Label htmlFor='password'>Password</Label>
                    <Input
                      id='password'
                      type='password'
                      value={form.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className='flex items-center justify-center'>
                    <Button
                      type='submit'
                      className='cursor-pointer '
                      variant={'outline'}
                    >
                      Login
                    </Button>
                  </div>
                </div>
                <div className='mt-4 text-center text-sm'>
                  Don&apos;t have an account? Contact Admin <br />
                  <a
                    href='mailto:prathap@meramerchant.com'
                    className='font-bold'
                  >
                    prathap@meramerchant.com
                  </a>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
