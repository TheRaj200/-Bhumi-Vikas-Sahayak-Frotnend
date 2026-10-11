import type { ApiErrorCode } from './types'

export class ApiClientError extends Error {
  code: ApiErrorCode | 'NETWORK'
  status: number
  details?: { field: string; message: string }[]

  constructor(status: number, code: ApiErrorCode | 'NETWORK', message: string, details?: { field: string; message: string }[]) {
    super(message)
    this.status = status
    this.code = code
    this.details = details
  }
}
