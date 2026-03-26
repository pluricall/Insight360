import { altitude } from '@/lib/axios'

export const logout = async () => {
  await altitude.put('/api/instance/logout', null, {
    params: {
      'api-version': process.env.API_VERSION,
    },
  })
}
