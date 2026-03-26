import { altitude } from '@/lib/axios'

export const serviceIdByName = async (serviceName: string) => {
  try {
    const response = await altitude.get('/api/instance/serviceByName', {
      params: {
        serviceName,
        'api-version': process.env.API_VERSION,
      },
    })
    return response.data
  } catch (error: any) {
    console.error(`Error fetching ID for campaign "${serviceName}":`, error.response)
    throw error
  }
}
