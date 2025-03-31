import { env } from '@/env'
import { api } from '@/lib/axios'
import { AxiosError } from 'axios'

export const closeCube= async (cursorId: number) => {
  try {
    const response = await api.put('/api/instance/cubeCursor/close', null, {
      params: {
        cursorId,
        'api-version': env.API_VERSION,
      },
    })
    return response.status
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      console.error({
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      })
    } else {
      console.error('Unexpected error:', error)
    }
  }
}
