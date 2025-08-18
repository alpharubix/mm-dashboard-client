import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { getAuthToken } from './lib/utils'
import axios from 'axios'
import { lazy } from 'react'

// Lazy imports
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const Home = lazy(() => import('./pages/Home'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Viewer = lazy(() => import('./pages/Viewer'))
const Users = lazy(() => import('./pages/Users'))

const Onboard = lazy(() => import('./pages/Onboard'))
const CreditLimit = lazy(() => import('./pages/CreditLimit'))
const Invoice = lazy(() => import('./pages/invoice'))
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'))
const RootRedirect = lazy(() => import('./components/RootRedirect'))

export default function App() {
  const token = getAuthToken()

  axios.defaults.headers.common['Authorization'] = `${token}`
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<RootRedirect />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/' element={<Home />}>
          <Route
            path='users'
            element={
              <ProtectedRoute requiredRoute='users'>
                <Users />
              </ProtectedRoute>
            }
          />

          {/* Admin + SuperAdmin routes */}
          <Route
            path='credit-limit'
            element={
              <ProtectedRoute requiredRoute='credit-limit'>
                <CreditLimit />
              </ProtectedRoute>
            }
          />

          <Route
            path='invoice-utr'
            element={
              <ProtectedRoute requiredRoute='invoice-utr'>
                <Invoice />
              </ProtectedRoute>
            }
          />

          {/* All roles can access */}
          <Route
            path='viewer'
            element={
              <ProtectedRoute requiredRoute='viewer'>
                <Viewer />
              </ProtectedRoute>
            }
          />

          <Route path='onboard-customer' element={<Onboard />} />
          <Route path='*' element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
