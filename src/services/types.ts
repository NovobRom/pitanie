export interface AppError {
  code: string;
  message: string;
  details?: unknown;
}

export type Result<T, E = AppError> =
  | { ok: true; data: T }
  | { ok: false; error: E };
