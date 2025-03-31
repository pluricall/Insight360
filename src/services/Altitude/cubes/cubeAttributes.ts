import { env } from '@/env'
import { api } from '@/lib/axios'

export const cubeAttributes = async(cursorId: number) => {
  try {
    const response = await api.get(
      '/api/instance/cubeCursor/fetchAsAttributes',
      {
        params: {
          cursorId,
          position: 0,
          numberOfRows: 50,
          'api-version': env.API_VERSION,
        },
      },
    )
    return response.data
  } catch (error) {
    console.error('Error fetching cube attributes:', error)
    throw error
  }
}
