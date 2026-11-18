import { mockRequest } from "./mock";

export const API_URL: string = import.meta.env.VITE_API_URL ?? "http://localhost:8080";
export const USE_MOCK: boolean = import.meta.env.VITE_USE_MOCK !== "false";

const TOKEN_KEY = "sams_token";
export const tokenStore = {
  get: () => sessionStorage.getItem(TOKEN_KEY),
  set: (t: string) => sessionStorage.setItem(TOKEN_KEY, t),
  clear: () => sessionStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

/** Single place where every REST call goes through. Adds the JWT as a Bearer token. */
export async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = tokenStore.get();
  if (USE_MOCK) return mockRequest<T>(method, path, body, token);

  const res = await fetch(API_URL + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (res.status === 401 && token) window.dispatchEvent(new Event("auth:expired"));
  if (!res.ok) {
    let msg = res.statusText;
    try { msg = (await res.json()).message ?? msg; } catch { /* no json body */ }
    throw new ApiError(res.status, msg || "Request failed");
  }
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}