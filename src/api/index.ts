import axios from 'axios'
import { getAuthToken } from '../lib/utils'
import { ENV } from '../conf'

const token = getAuthToken()

axios.defaults.headers.common['Authorization'] = `${token}`

export const api = axios.create({
  baseURL: ENV.BACKEND_URL,
})
