import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

let getAuthState: () => { accessToken: string | null; refreshToken: string | null } = () => ({ accessToken: null, refreshToken: null });
let onAuthRefreshed: (token: string) => void = () => {};
let onAuthFailed: () => void = () => {};

export function configureApiAuth(opts: {
  getAuthState: () => { accessToken: string | null; refreshToken: string | null };
  onAuthRefreshed: (token: string) => void;
  onAuthFailed: () => void;
}) {
  getAuthState = opts.getAuthState;
  onAuthRefreshed = opts.onAuthRefreshed;
  onAuthFailed = opts.onAuthFailed;
}

// Attach access token to every request unless explicitly skipped
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const skipAuth = (config as InternalAxiosRequestConfig & { skipAuth?: boolean }).skipAuth;
  if (!skipAuth) {
    const { accessToken } = getAuthState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
  }
  return config;
});

// Shared in-flight refresh promise so concurrent 401s only trigger one refresh
let refreshPromise: Promise<string> | null = null;

async function refreshToken(): Promise<string> {
  if (refreshPromise) return refreshPromise;
  const { refreshToken } = getAuthState();
  if (!refreshToken) throw new Error('No refresh token');
  refreshPromise = axios
    .post(`${API_BASE}/api/accounts/token/refresh/`, { refresh: refreshToken })
    .then((res) => {
      const newToken = res.data.access as string;
      onAuthRefreshed(newToken);
      return newToken;
    })
    .finally(() => { refreshPromise = null; });
  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      const skipAuth = (originalRequest as InternalAxiosRequestConfig & { skipAuth?: boolean }).skipAuth;
      if (skipAuth) return Promise.reject(error);
      originalRequest._retry = true;
      try {
        const newToken = await refreshToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch {
        onAuthFailed();
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export async function get<T = unknown>(url: string, config?: Parameters<typeof api.get>[1]): Promise<T> {
  const res = await api.get<T>(url, config);
  return res.data;
}

export async function post<T = unknown>(url: string, data?: unknown, config?: Parameters<typeof api.post>[2]): Promise<T> {
  const res = await api.post<T>(url, data, config);
  return res.data;
}

export async function patch<T = unknown>(url: string, data?: unknown, config?: Parameters<typeof api.patch>[2]): Promise<T> {
  const res = await api.patch<T>(url, data, config);
  return res.data;
}

export async function del<T = unknown>(url: string, config?: Parameters<typeof api.delete>[1]): Promise<T> {
  const res = await api.delete<T>(url, config);
  return res.data;
}

export { API_BASE };
