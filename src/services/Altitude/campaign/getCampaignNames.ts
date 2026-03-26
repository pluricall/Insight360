import { altitude } from "@/lib/axios"

export async function getCampaignByName() {
  try {
    const response = await altitude.put(`/api/instance/campaignNames`)
    return response.data
  } catch (error) {
    console.error('Error fetching campaign names:', error)
    throw error
  }
}
