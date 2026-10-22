import type { ErrorRequestHandler } from 'express';
import { HttpError } from '../http-error';

function isMalformedJsonError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    error.type === 'entity.parse.failed'
  );
}

export const errorHandlerMiddleware: ErrorRequestHandler = (
  error: unknown,
  _request,
  response,
  next,
): void => {
  if (response.headersSent) {
    next(error);
    return;
  }

  if (error instanceof HttpError) {
    response.status(error.status).json({
      code: error.code,
      message: error.message,
    });
    return;
  }

  if (isMalformedJsonError(error)) {
    response.status(400).json({
      code: 'INVALID_REQUEST',
      message: 'The request body must contain valid JSON.',
    });
    return;
  }

  console.error('Unhandled error while processing a request.', error);
  response.status(500).json({
    code: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred.',
  });
};
