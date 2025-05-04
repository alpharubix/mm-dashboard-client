import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AnchorInput from './components/AnchorInput'
import OnboardNotification from './components/OnboardNotification'
import OutputLimit from './components/OutputLimit'
import OutputUTR from './components/OutputUTR'
import ProtectedRoute from './components/ProtectedRoute'
import Users from './components/Users'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path='/' element={<Navigate to='/input' replace />} />
          <Route path='/' element={<Home />}>
            <Route path='input' element={<AnchorInput />} />
            <Route
              path='onboard-notification'
              element={<OnboardNotification />}
            />
            <Route path='credit-limit' element={<OutputLimit />} />
            <Route path='invoice-utr' element={<OutputUTR />} />
            <Route path='users' element={<Users />} />
          </Route>
        </Route>
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
      </Routes>
    </BrowserRouter>
  )
}
