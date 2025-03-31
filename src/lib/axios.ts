import axios from 'axios'
import Cookies from 'js-cookie'

export const api = axios.create({
  baseURL: 'http://localhost/uAgentWeb8',
  withCredentials: true,
})

export const apiDb = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true,
})

api.interceptors.request.use(
  async (config) => {
    const token = Cookies.get('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Erro 401: Token inválido ou expirado.')
      Cookies.remove('access_token')
      Cookies.remove('refresh_token')
      Cookies.remove('token_expiration')
      window.location.href = '/sign-in'
    }
    return Promise.reject(error)
  },
)
