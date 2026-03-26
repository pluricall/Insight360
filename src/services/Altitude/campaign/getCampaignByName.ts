import { altitude } from "@/lib/axios"

export async function getCampaignIdByName(campaignName: string) {
  try {
    const response = await altitude.get("/api/instance/campaignByName", {
      params: { campaignName },
    })

    return response.data
  } catch (error) {
    console.error(`Error fetching ID for campaign "${campaignName}":`, error)
    throw error
  }
}
