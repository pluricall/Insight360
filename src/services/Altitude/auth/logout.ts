import { env } from '@/env'
import { api } from '@/lib/axios'

export const logout = async () => {
  await api.put('/api/instance/logout', null, {
    params: {
      'api-version': env.API_VERSION,
    },
  })
}
