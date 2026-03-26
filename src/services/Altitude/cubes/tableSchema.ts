import { altitude } from "@/lib/axios"

export async function tableSchema() {
  try {
    const response = await altitude.get(
      `/api/instance/instanceManager/cubeTableSchema`,)

    return response.data
  } catch (error: any) {
   console.error('Erro ao buscar esquema da tabela:', error.response)
   throw new Error()
  }
}
