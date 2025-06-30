import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { getAuthToken } from './lib/utils'
import axios from 'axios'
import { lazy } from 'react'

// Lazy imports
const Login = lazy(() => import('./pages/Login'))
const Home = lazy(() => import('./pages/Home'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Viewer = lazy(() => import('./pages/Viewer'))
const Users = lazy(() => import('./pages/Users'))

const OnboardNotification = lazy(
  () => import('./components/OnboardNotification')
)
const OutputLimit = lazy(() => import('./components/OutputLimit'))
const OutputUTR = lazy(() => import('./components/OutputUTR'))
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
                <OutputLimit />
              </ProtectedRoute>
            }
          />

          <Route
            path='invoice-utr'
            element={
              <ProtectedRoute requiredRoute='invoice-utr'>
                <OutputUTR />
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

          <Route
            path='onboard-notification'
            element={<OnboardNotification />}
          />
          <Route path='*' element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
