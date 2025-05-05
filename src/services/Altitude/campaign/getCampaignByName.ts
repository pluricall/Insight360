import { api } from "@/lib/axios"

export const getCampaignIdByName = async (
  campaignName: string,
) => {
  try {
    const response = await api.get('/api/instance/campaignByName', {
      params: {
        campaignName,
        'api-version': process.env.API_VERSION,
      },
    })
    return response.data
  } catch (error) {
    console.error(`Error fetching ID for campaign "${campaignName}":`, error)
    throw error
  }
}
