'use client'
import {
  createContext,
  useEffect,
  useContext,
  useCallback,
  useState,
  type ReactNode,
} from 'react'
import { logout, renewToken, signIn } from '@/services'
import Cookies from 'js-cookie'
import { api } from '@/lib/axios'

interface AuthContextData {
  login: (username: string, password: string) => Promise<void>
  logoutUser: () => Promise<void>
  token: string | null
  username: string | null
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)

  const scheduleTokenRefresh = useCallback(() => {
    const interval = 3 * 60 * 1000;
  
    const intervalId = setInterval(async () => {
      console.log('[Auth] Tentando renovar token às', new Date().toLocaleTimeString());
  
      try {
        const refresh_token = Cookies.get('refresh_token');
        const storedUsername = Cookies.get('username');
  
        if (refresh_token) {
          const {
            access_token,
            refresh_token: new_refresh_token,
            expires_in,
          } = await renewToken({ refresh_token });
  
          if (access_token && new_refresh_token && storedUsername) {
            console.log('[Auth] Token renovado com sucesso às', new Date().toLocaleTimeString());
  
            Cookies.set('access_token', access_token);
            Cookies.set('refresh_token', new_refresh_token);
            Cookies.set('expires', String(Date.now() + expires_in * 1000));
            api.defaults.headers.Authorization = `Bearer ${access_token}`;
  
            setToken(access_token);
            setUsername(storedUsername);
  
            try {
              console.log("Enviando para AltitudeToken:", {
                userName: storedUsername,
                token: access_token,
              });
              const response = await fetch('https://pluridashlab/api/AltitudeToken/RefreshToken', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  userName: storedUsername,
                  token: access_token,
                }),
              });
              
              const data = await response.json();
              console.log("Resposta:", data);
            } catch (altitudeError) {
              console.warn('[Auth] Erro ao enviar token para o AltitudeToken, mas sem impacto:', altitudeError);
            }
          }
        }
      } catch (error) {
        console.error('[Auth] Erro ao renovar o token:', error);
        logoutUser();
        window.location.href = '/Insight360/sign-in'
      }
    }, interval);
  
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const token = Cookies.get('access_token')
    const storedUsername = Cookies.get('username')

    if (token && storedUsername) {
      api.defaults.headers.Authorization = `Bearer ${token}`
      setToken(token)
      setUsername(storedUsername)

      const clear = scheduleTokenRefresh()
      return clear
    }
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

        setToken(access_token)
        setUsername(username)

        scheduleTokenRefresh()
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
    Cookies.remove('username')
    api.defaults.headers.Authorization = ''

    setToken(null)
    setUsername(null)
  }

  return (
    <AuthContext.Provider
      value={{ login, logoutUser, token, username }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
