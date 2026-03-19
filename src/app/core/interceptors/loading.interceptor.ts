import { HttpInterceptorFn } from '@angular/common/http';
import { finalize } from 'rxjs';
import { inject } from '@angular/core';
import { LoadingService } from '../services/loading.service';

export const loading_interceptor: HttpInterceptorFn = (req, next) => {
  const loading_service = inject(LoadingService);

  loading_service.Show();

  return next(req).pipe(
    finalize(() => loading_service.Hide())
  );
};