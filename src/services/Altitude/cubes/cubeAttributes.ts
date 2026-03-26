import { altitude } from "@/lib/axios"

export async function cubeAttributes(cursorId: number) {
  try {
    const response = await altitude.get('/api/instance/cubeCursor/fetchAsAttributes', {
      params: {
        cursorId: cursorId.toString(),
        position: '0',
        numberOfRows: '50',
        'api-version': process.env.API_VERSION || '',
      },
    })

    return response.data
  } catch (error: any) {
    console.error('Erro ao buscar atributos do CubeCursor:', error)
    throw new Error()
  }
}
