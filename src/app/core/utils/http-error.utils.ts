import { HttpErrorResponse } from '@angular/common/http';
import { ApiError } from '../models/api-error.model';

export function GetHttpErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    const backend_error = error.error as ApiError | string | null;

    if (backend_error && typeof backend_error === 'object') {
      if ('Message' in backend_error && typeof backend_error.Message === 'string' && backend_error.Message.trim() !== '') {
        return backend_error.Message;
      }

      if ('Error' in backend_error && typeof backend_error.Error === 'string' && backend_error.Error.trim() !== '') {
        return backend_error.Error;
      }
    }

    if (typeof backend_error === 'string' && backend_error.trim() !== '') {
      return backend_error;
    }

    if (typeof error.message === 'string' && error.message.trim() !== '') {
      return error.message;
    }
  }

  return 'Ocurrió un error inesperado.';
}