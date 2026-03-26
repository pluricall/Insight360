import { altitude } from "@/lib/axios"

export const getAllCampaigns = async (): Promise<string[]> => {
  try {
    const response = await altitude.get(`/api/instance/campaignNames`,)

    return response.data
  } catch (error) {
    console.error('Error fetching campaign names:', error)
    throw error
  }
}
