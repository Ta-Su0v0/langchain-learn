import * as z from 'zod'

export const ApiCode = {
  Success: 0,
  ValidationError: 4000,
  SessionNotFound: 4040,
  InternalServerError: 5000,
} as const

export type ApiCode = (typeof ApiCode)[keyof typeof ApiCode]
export type ApiErrorCode = Exclude<ApiCode, typeof ApiCode.Success>

export const apiSuccessCodeSchema = z.literal(ApiCode.Success)
export const apiErrorCodeSchema = z.union([
  z.literal(ApiCode.ValidationError),
  z.literal(ApiCode.SessionNotFound),
  z.literal(ApiCode.InternalServerError),
])
export const apiCodeSchema = z.union([apiSuccessCodeSchema, apiErrorCodeSchema])
export const apiMessageSchema = z.string().min(1)

export type ApiSuccessResponse<T> = {
  code: typeof ApiCode.Success
  message: string
  data: T
}

export const apiErrorResponseSchema = z.object({
  code: apiErrorCodeSchema,
  message: apiMessageSchema,
  data: z.null(),
})

export type ApiErrorResponse = z.infer<typeof apiErrorResponseSchema>
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

export function createApiSuccessResponseSchema<TData extends z.ZodTypeAny>(dataSchema: TData) {
  return z.object({
    code: apiSuccessCodeSchema,
    message: apiMessageSchema,
    data: dataSchema,
  })
}

export function createApiResponseSchema<TData extends z.ZodTypeAny>(dataSchema: TData) {
  return z.union([createApiSuccessResponseSchema(dataSchema), apiErrorResponseSchema])
}
