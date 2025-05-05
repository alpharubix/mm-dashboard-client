import axios from 'axios'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { ENV } from '../conf'
import { cn } from '../lib/utils'

export default function Signup() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  })
  const navigate = useNavigate()
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      alert('Passwords do not match')
      return
    }
    try {
      const res = await axios.post(`${ENV.BACKEND_URL}/register`, {
        email: form.email,
        password: form.password,
        role: 'viewer',
      })
      // alert('Signup successful')
      setForm({ email: '', password: '', confirmPassword: '' })
      console.log(res.data)
      localStorage.setItem('mm_auth_token', res.data.token)
      navigate('/', { replace: true })
    } catch (err) {
      console.error(err)
      alert('Signup failed')
    }
  }

  return (
    <div className='flex min-h-svh w-full items-center justify-center p-6 md:p-10'>
      <div className='w-full max-w-sm'>
        <div className={cn('flex flex-col gap-6')}>
          <Card>
            <CardHeader>
              <CardTitle className='text-2xl'>Signup</CardTitle>
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
                  <div className='grid gap-3'>
                    <Label htmlFor='confirmPassword'>Confirm Password</Label>
                    <Input
                      id='confirmPassword'
                      type='password'
                      value={form.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className='flex items-center justify-center'>
                    <Button
                      type='submit'
                      className='cursor-pointer'
                      variant={'outline'}
                    >
                      Signup
                    </Button>
                  </div>
                </div>
                <div className='mt-4 text-center text-sm'>
                  Already have an account?{' '}
                  <Link to='/login' className='underline underline-offset-4'>
                    Login
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
