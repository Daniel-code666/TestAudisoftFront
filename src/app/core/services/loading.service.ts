import { Injectable, computed, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private readonly _request_count = signal(0);

  readonly is_loading = computed(() => this._request_count() > 0);

  Show(): void {
    this._request_count.update(value => value + 1);
  }

  Hide(): void {
    this._request_count.update(value => Math.max(0, value - 1));
  }
}