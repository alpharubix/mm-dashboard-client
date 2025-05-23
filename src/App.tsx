import { BrowserRouter, Route, Routes } from 'react-router-dom'
import OnboardNotification from './components/OnboardNotification'
import OutputLimit from './components/OutputLimit'
import OutputUTR from './components/OutputUTR'
import ProtectedRoute from './components/ProtectedRoute'
import Users from './components/Users'
import Home from './pages/Home'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import Signup from './pages/Signup'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />

        <Route element={<ProtectedRoute />}>
          <Route path='/' element={<Home />}>
            <Route element={<ProtectedRoute allowedRoles='admin' />}>
              {/* <Route path='input' element={<AnchorInput />} /> */}
              <Route path='users' element={<Users />} />
            </Route>

            <Route
              path='onboard-notification'
              element={<OnboardNotification />}
            />
            <Route path='credit-limit' element={<OutputLimit />} />
            <Route path='invoice-utr' element={<OutputUTR />} />

            <Route path='*' element={<NotFound />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
