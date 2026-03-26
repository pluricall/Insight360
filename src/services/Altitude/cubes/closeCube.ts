import { altitude } from '@/lib/axios'
import { AxiosError } from 'axios'

export async function closeCube(cursorId: number) {
  try {
    const response = await altitude.get("/api/instance/cubeCursor/close", {
      params: { cursorId },
    })

    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      console.error({
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      })
      throw new Error()
    } else {
      console.error('Unexpected error:', error)
    }
    throw new Error()
  }
}
