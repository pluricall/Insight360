import { api } from '@/lib/axios'

export const getCampaignByName = async (): Promise<string[]> => {
  try {
    const response = await api.get('/api/instance/campaignNames', {
      params: {
        'api-version': process.env.API_VERSION,
      },
    })
    return response.data
  } catch (error) {
    console.error('Error fetching campaign names:', error)
    throw error
  }
}
