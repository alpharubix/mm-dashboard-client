import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import axios from 'axios'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'
import './App.css'
import App from './App.tsx'
import { getAuthToken } from './lib/utils.ts'

const queryClient = new QueryClient()

if (process.env.NODE_ENV === 'production') {
  console.log = () => {}
  console.warn = () => {}
  console.error = () => {}
}

const token = getAuthToken()

axios.defaults.headers.common['Authorization'] = `${token}`

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    {/* <StrictMode> */}
    <App />
    <Toaster richColors />
    {/* </StrictMode> */}
  </QueryClientProvider>
)
