import { env } from '@/env'
import { api } from '@/lib/axios'

export const getCampaignByName = async (): Promise<string[]> => {
  try {
    const response = await api.get('/api/instance/campaignNames', {
      params: {
        'api-version': env.API_VERSION,
      },
    })
    return response.data
  } catch (error) {
    console.error('Error fetching campaign names:', error)
    throw error
  }
}
