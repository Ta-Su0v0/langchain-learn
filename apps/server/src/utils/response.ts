import {
  ApiCode,
  type ApiErrorCode,
  type ApiErrorResponse,
  type ApiSuccessResponse,
} from '@lcl/shared/types/api'

export function createSuccessResponse<T>(data: T, message = 'OK'): ApiSuccessResponse<T> {
  return {
    code: ApiCode.Success,
    message,
    data,
  }
}

export function createErrorResponse(code: ApiErrorCode, message: string): ApiErrorResponse {
  return {
    code,
    message,
    data: null,
  }
}
