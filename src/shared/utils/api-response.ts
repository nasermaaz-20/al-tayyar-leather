import { NextResponse } from 'next/server';

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiError;
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Create a success response
 */
export function successResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
    } as ApiSuccessResponse<T>,
    { status }
  );
}

/**
 * Create an error response
 */
export function errorResponse(
  code: string,
  message: string,
  status = 400,
  details?: any
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        details,
      },
    } as ApiErrorResponse,
    { status }
  );
}

/**
 * Create a validation error response
 */
export function validationError(details: any): NextResponse {
  return errorResponse('VALIDATION_ERROR', 'Invalid request data', 400, details);
}

/**
 * Create an unauthorized error response
 */
export function unauthorizedError(message = 'Authentication required'): NextResponse {
  return errorResponse('UNAUTHORIZED', message, 401);
}

/**
 * Create a forbidden error response
 */
export function forbiddenError(message = 'Access denied'): NextResponse {
  return errorResponse('FORBIDDEN', message, 403);
}

/**
 * Create a not found error response
 */
export function notFoundError(message = 'Resource not found'): NextResponse {
  return errorResponse('NOT_FOUND', message, 404);
}

/**
 * Create a server error response
 */
export function serverError(message = 'Internal server error'): NextResponse {
  return errorResponse('SERVER_ERROR', message, 500);
}
