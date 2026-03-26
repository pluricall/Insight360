"use client";
import {
  createContext,
  useEffect,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { logout, renewToken, signIn } from "@/services";
import Cookies from "js-cookie";

interface AuthContextData {
  signInAltitude: (username: string, password: string) => Promise<void>;
  signOutAltitude: () => Promise<void>;
  token: string | null;
  username: string | null;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const token = Cookies.get("access_token");
    const storedUsername = Cookies.get("username");

    if (token && storedUsername) {
      setToken(token);
      setUsername(storedUsername);
    }
  }, []);

  async function signInAltitude(username: string, password: string) {
    const { access_token, refresh_token, expires_in } = await signIn({
      username,
      password,
    });

    Cookies.set("access_token", access_token);
    Cookies.set("refresh_token", refresh_token);
    Cookies.set("expires", String(Date.now() + expires_in * 1000));
    Cookies.set("username", username);

    setToken(access_token);
    setUsername(username);
  }

  async function signOutAltitude() {
    await logout();
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    Cookies.remove("expires");
    Cookies.remove("username");

    setToken(null);
    setUsername(null);
  }

  return (
    <AuthContext.Provider
      value={{ signInAltitude, signOutAltitude, token, username }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
