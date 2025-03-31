'use client'
import {
  createContext,
  useEffect,
  useContext,
  useCallback,
  type ReactNode,
} from 'react'
import { api } from '@/lib/axios'
import { logout, renewToken, signIn } from '@/services'
import Cookies from 'js-cookie'

interface AuthContextData {
  login: (username: string, password: string) => Promise<void>
  logoutUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData)

export function AuthProvider({ children }: { children: ReactNode }) {
  const scheduleTokenRefresh = useCallback((expires: number) => {
    const currentTime = Date.now()
    const timeUntilRefresh = expires - currentTime - 60 * 1000

    if (timeUntilRefresh > 0) {
      setTimeout(async () => {
        try {
          const refresh_token = Cookies.get('refresh_token')
          if (refresh_token) {
            const {
              access_token,
              refresh_token: new_refresh_token,
              expires_in,
            } = await renewToken({ refresh_token })

            if (access_token && new_refresh_token && expires_in) {
              Cookies.set('access_token', access_token)
              Cookies.set('refresh_token', new_refresh_token)
              Cookies.set('expires', String(Date.now() + expires_in * 1000))
              api.defaults.headers.Authorization = `Bearer ${access_token}`
              scheduleTokenRefresh(Date.now() + expires_in * 1000)
            }
          }
        } catch (error) {
          console.error('Erro ao renovar o token:', error)
          logout()
        }
      }, timeUntilRefresh)
    } else {
      logout()
    }
  }, [])

  useEffect(() => {
    const initializeAuth = () => {
      const token = Cookies.get('access_token')
      const expires = Cookies.get('expires')
      if (token && expires) {
        api.defaults.headers.Authorization = `Bearer ${token}`
        scheduleTokenRefresh(Number(expires))
      }
    }

    initializeAuth()
  }, [scheduleTokenRefresh])

  const login = async (username: string, password: string) => {
    try {
      const { access_token, refresh_token, expires_in } = await signIn({
        username,
        password,
      })

      if (access_token && refresh_token && expires_in) {
        Cookies.set('access_token', access_token)
        Cookies.set('refresh_token', refresh_token)
        Cookies.set('expires', String(Date.now() + expires_in * 1000))
        Cookies.set('username', username)
        api.defaults.headers.Authorization = `Bearer ${access_token}`
        scheduleTokenRefresh(Date.now() + expires_in * 1000)
      }
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  const logoutUser = async () => {
    await logout()
    Cookies.remove('access_token')
    Cookies.remove('refresh_token')
    Cookies.remove('expires')
    api.defaults.headers.Authorization = ''
  }

  return (
    <AuthContext.Provider value={{ login, logoutUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

