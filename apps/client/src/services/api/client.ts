/**
 * Client API service — base HTTP client.
 * All server communication goes through this layer.
 */
import {
  ApiCode,
  apiErrorResponseSchema,
  type ApiErrorResponse,
  type ApiSuccessResponse,
} from '@lcl/shared/types'

interface ResponseParser<T> {
  parse(input: unknown): T
}

const API_BASE_URL = import.meta.env['VITE_API_BASE_URL'] ?? '/api/v1'

class ApiClientError extends Error {
  constructor(
    public readonly code: ApiErrorResponse['code'],
    message: string,
    public readonly status: number,
  ) {
    super(message)
    this.name = 'ApiClientError'
  }
}

async function request<T>(
  path: string,
  parser: ResponseParser<ApiSuccessResponse<T>>,
  options?: RequestInit,
): Promise<ApiSuccessResponse<T>> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  const payload = await response.json()

  if (!response.ok) {
    const error = apiErrorResponseSchema.safeParse(payload)

    if (error.success) {
      throw new ApiClientError(error.data.code, error.data.message, response.status)
    }

    throw new ApiClientError(
      ApiCode.InternalServerError,
      'Unexpected API error response',
      response.status,
    )
  }

  return parser.parse(payload)
}

export const apiClient = {
  get: <T>(
    path: string,
    parser: ResponseParser<ApiSuccessResponse<T>>,
  ): Promise<ApiSuccessResponse<T>> => request<T>(path, parser, { method: 'GET' }),

  post: <T>(
    path: string,
    body: unknown,
    parser: ResponseParser<ApiSuccessResponse<T>>,
  ): Promise<ApiSuccessResponse<T>> =>
    request<T>(path, parser, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
}
