import { getSessionToken } from "../storage/session-store";

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "https://unified-app-n8d.pages.dev";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function isNetworkError(error: unknown): boolean {
  return error instanceof TypeError || (error instanceof ApiError && (error.status === 0 || error.status >= 500));
}

type ApiOptions = Omit<RequestInit, "headers"> & { headers?: Record<string, string> };

export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const token = await getSessionToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers ?? {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text };
    }
  }

  if (!response.ok) {
    const message =
      data && typeof data === "object" && "error" in data
        ? String((data as { error: unknown }).error)
        : `HTTP ${response.status}`;
    throw new ApiError(response.status, message);
  }
  return data as T;
}
