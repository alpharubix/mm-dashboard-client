import axios from 'axios'
import { getAuthToken } from '../lib/utils'
import { ENV } from '../conf'

export const api = axios.create({
  baseURL: ENV.BACKEND_URL,
})

// Attach auth token dynamically on every request
api.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) {
    config.headers['Authorization'] = token
  }
  return config
})
