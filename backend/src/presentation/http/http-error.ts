export type ClientErrorStatus = 400 | 404;

export class HttpError extends Error {
  constructor(
    readonly status: ClientErrorStatus,
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}
