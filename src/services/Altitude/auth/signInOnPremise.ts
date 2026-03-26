import { altitudeOnPrem } from '@/lib/axios'
import axios from 'axios'

interface SignInBodyRequest {
  username: string
  password: string
}

interface AltitudeSignInResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token: string
}

interface AltitudeErrorResponse {
  error: string
  error_description: string
}

export async function signInOnPremise({ username, password }: SignInBodyRequest): Promise<AltitudeSignInResponse> {
  const instanceAddress = process.env.NEXT_PUBLIC_INSTANCE_ADDRESS_ON_PREMISE
  if (!instanceAddress) {
    throw new Error('Variável de ambiente NEXT_PUBLIC_INSTANCE_ADDRESS_ON_PREMISE não definida.')
  }
  const payload = {
    username,
    password,
    grant_type: 'password',
    instanceaddress: instanceAddress,
    secureaccess: 'false',
    authenticationType: 'Uci',
    forced: 'true',
    operation: 'login',
  }
  try {
    const response = await axios.post<AltitudeSignInResponse>(
      'https://agent.tejo.cc/uAgentWeb8/token',
      new URLSearchParams(payload),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    )
    return response.data
  } catch (error) {
    if (axios.isAxiosError<AltitudeErrorResponse>(error)) {
      const apiError = error.response?.data;
      if (apiError?.error_description?.includes('AuthenticationFailed')) {
        throw new Error('Usuário ou senha incorretos no Altitude.');
      }
      throw new Error(apiError?.error_description ?? 'Erro ao autenticar com o Altitude On Premise.');
    }
    throw new Error('Erro desconhecido ao tentar autenticar com o Altitude.');
  }
}
