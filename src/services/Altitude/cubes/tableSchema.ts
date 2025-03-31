import { api } from "@/lib/axios"

export const tableSchema= async () => {
  try {
    const response = await api.get('/api/instance/instanceManager/cubeTableSchema',)
    return response.data
  } catch (error: any) {
    return console.error('Erro ao buscar esquema da tabela:', error.response)
  }
}
