import { api } from '@/lib/axios'

export const logout = async () => {
  await api.put('/api/instance/logout', null, {
    params: {
      'api-version': process.env.API_VERSION,
    },
  })
}
