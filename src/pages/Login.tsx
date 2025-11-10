import axios from 'axios'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Eye, EyeOff } from 'lucide-react'
import { Label } from '../components/ui/label'
import { ENV } from '../conf'
import { cn, getDefaultRoute, setAuthToken } from '../lib/utils'
import { jwtDecode } from 'jwt-decode'
import { Loader2 } from 'lucide-react'

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      const res = await axios.post(`${ENV.BACKEND_URL}/login`, form)
      localStorage.setItem('mm_auth_token', res.data.token)
      setAuthToken()
      setForm({ username: '', password: '' })

      toast.success('Login successful')
      const user = jwtDecode(res.data.token)
      // @ts-ignore
      navigate(getDefaultRoute(user?.role), { replace: true })
      setIsLoading(false)
    } catch (err) {
      setIsLoading(false)
      console.error(err)
      // @ts-ignore
      toast.error(err.response.data.message)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className={cn('flex flex-col gap-6')}>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Login</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="username"
                      value={form.username}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="grid gap-3">
                    <div className="relative">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={form.password}
                        onChange={handleChange}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-8 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? (
                          <Eye className="h-5 w-5" />
                        ) : (
                          <EyeOff className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    <Button
                      type="submit"
                      className="cursor-pointer min-w-[100px]"
                      variant={'outline'}
                      disabled={isLoading}
                    >
                      {!isLoading ? (
                        'Login'
                      ) : (
                        <Loader2 className="animate-spin" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="mt-4 text-center text-sm">
                  Don&apos;t have an account? Contact Admin <br />
                  <a
                    href="mailto:support@r1xchange.com"
                    className="font-bold"
                  >
                    support@r1xchange.com
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
