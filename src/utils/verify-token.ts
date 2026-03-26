import { jwtDecode } from "jwt-decode";

export function verifyToken(token: string): boolean {
  try {
    const decoded = jwtDecode<{ exp: number; nbf?: number }>(token);

    if (!decoded.exp) return false;

    const now = Math.floor(Date.now() / 1000);

    if (decoded.nbf && now < decoded.nbf) {
      return false;
    }

    return decoded.exp > now;
  } catch {
    return false;
  }
}