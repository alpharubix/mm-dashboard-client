import { useMutation, useQuery } from '@tanstack/react-query'
import { api } from './index'

export const useApiQuery = (endpoint: string, params = {}) => {
  return useQuery({
    queryKey: [endpoint, params],
    queryFn: async () => {
      const res = await api.get(endpoint, { params })
      return res.data
    },
  })
}

export const useApiPost = (endpoint: string) => {
  return useMutation({
    mutationFn: (data: any) => {
      return api.post(endpoint, data)
    },
  })
}

export const useApiPut = (endpoint: string) => {
  return useMutation({
    mutationFn: (data) => api.put(endpoint, data),
  })
}

export const useApiCsv = (endpoint: string) => {
  return useMutation({
    mutationFn: (data: any) =>
      api.post(endpoint, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
  })
}
