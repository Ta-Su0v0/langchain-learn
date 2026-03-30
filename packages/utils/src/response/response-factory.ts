import type { ApiError, ApiErrorResponse, ApiResponse } from '@lcl/types'

export function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return {
    status: 'success',
    data,
  }
}

export function createErrorResponse(error: ApiError): ApiErrorResponse {
  return {
    status: 'error',
    error,
  }
}
