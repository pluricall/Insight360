import { env } from '@/env'
import { api } from '@/lib/axios'

interface TokenRequestProps {
  username: string
  password: string
}

export const signIn = async ({ username, password }: TokenRequestProps) => {
  const bodyRequest = new URLSearchParams({
    username,
    password,
    grant_type: 'password',
    instanceaddress: env.NEXT_PUBLIC_INSTANCE_ADDRESS_ONPREMISE || '',
    secureaccess: 'false',
    authenticationType: 'Uci',
    forced: 'true',
    operation: 'login',
  })

  try {
    const response = await api.post('/token', bodyRequest, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })

    return response.data
  } catch (error: any) {
    throw new Error(error.response.data.error_description)
  }
}
