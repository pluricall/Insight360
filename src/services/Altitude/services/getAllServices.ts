import { env } from '@/env'
import { api } from '@/lib/axios'

export const allServices = async() => {
  try {
    const response = await api.get('/api/instance/serviceNames', {
      params: {
        'api-version': env.API_VERSION,
      },
    })
    return response.data
  } catch (error: any) {
    return console.error('Error fetching service names:', error.response)
  }
}
