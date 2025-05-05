import { api } from '@/lib/axios'

interface RenewTokenRequestProps {
  refresh_token: string
}

export const renewToken = async({ refresh_token }: RenewTokenRequestProps) => {
  const bodyRequest = new URLSearchParams({
    refresh_token,
    grant_type: 'refresh_token',
    instanceaddress: process.env.NEXT_PUBLIC_INSTANCE_ADDRESS_CLOUD,
    authenticationType: 'Uci',
    operation: 'attach',
  })

  try {
    const response = await api.post('/token', bodyRequest, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    return response.data
  } catch (error: any) {
    if (
      error.response &&
      error.response.data.error === 'invalid_grant' &&
      error.response.data.error_description === 'redirect'
    ) {
      throw new Error('redirect')
    }
    throw new Error(error.response?.data?.error_description || 'Unknown error')
  }
}
