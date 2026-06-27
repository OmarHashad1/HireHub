import axios, { AxiosError, type AxiosRequestConfig } from "axios";

export const API_BASE = "/api";

export const GOOGLE_OAUTH_URL = `${API_BASE}/auth/login/google`;

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  timeout: 45000,
});

type RetriableConfig = AxiosRequestConfig & { _retried?: boolean };

let refreshing: Promise<void> | null = null;

function refreshSession() {
  if (!refreshing) {
    refreshing = api
      .get("/auth/refresh-token")
      .then(() => undefined)
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined;
    const status = error.response?.status;
    const url = config?.url ?? "";

    if (
      status === 401 &&
      config &&
      !config._retried &&
      !url.includes("/auth/refresh-token") &&
      !url.includes("/auth/login")
    ) {
      config._retried = true;
      try {
        await refreshSession();
        return api(config);
      } catch {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("hirehub:signed-out"));
        }
      }
    }
    return Promise.reject(error);
  },
);

export type Envelope<T> = {
  statusCode: number;
  message: string;
  data?: T;
};

export type Paginated<T> = {
  docs: T[];
  meta: {
    count?: number;
    page?: number;
    size?: number;
    pages?: number;
  };
};

export async function unwrap<T>(promise: Promise<{ data: Envelope<T> }>) {
  const res = await promise;
  return res.data.data as T;
}

export function apiMessage(error: unknown, fallback = "Something went wrong") {
  if (error instanceof AxiosError) {
    return (
      (error.response?.data as { message?: string } | undefined)?.message ??
      error.message ??
      fallback
    );
  }
  return fallback;
}
