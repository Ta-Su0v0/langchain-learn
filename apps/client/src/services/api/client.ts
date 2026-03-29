/**
 * Client API service — base HTTP client.
 * All server communication goes through this layer.
 */
import type { ApiResponse, ApiError } from '@lcl/types'

const API_BASE_URL = import.meta.env['VITE_API_BASE_URL'] ?? '/api/v1'

class ApiClientError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
  ) {
    super(message)
    this.name = 'ApiClientError'
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const error = (await response.json()) as { error: ApiError }
    throw new ApiClientError(error.error.code, error.error.message, response.status)
  }

  return response.json() as Promise<ApiResponse<T>>
}

export const apiClient = {
  get: <T>(path: string): Promise<ApiResponse<T>> => request<T>(path, { method: 'GET' }),

  post: <T>(path: string, body: unknown): Promise<ApiResponse<T>> =>
    request<T>(path, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
}
