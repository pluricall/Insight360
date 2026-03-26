import Cookies from "js-cookie";
import { renewToken } from "@/services";

export async function ensureValidToken(config: any) {
  let token = Cookies.get("access_token");
  const expires = Cookies.get("expires");
  const refreshToken = Cookies.get("refresh_token");

if (!token || !expires) {
  return Promise.reject(new Error("Sessão expirada"));
}

  const isExpired = Date.now() > Number(expires) - 30 * 1000;

  if (isExpired && refreshToken) {
    const {
      access_token,
      refresh_token: newRefresh,
      expires_in,
    } = await renewToken({ refresh_token: refreshToken });

    Cookies.set("access_token", access_token);
    Cookies.set("refresh_token", newRefresh);
    Cookies.set("expires", String(Date.now() + expires_in * 1000));

    token = access_token;
  }

  config.headers.Authorization = `Bearer ${token}`;
  return config;
}
