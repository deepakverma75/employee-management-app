import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly activeRequests$ = new BehaviorSubject<number>(0);
  readonly isLoading$ = this.activeRequests$.pipe(map((count) => count > 0));

  start(): void {
    this.activeRequests$.next(this.activeRequests$.value + 1);
  }

  stop(): void {
    const next = this.activeRequests$.value - 1;
    this.activeRequests$.next(next < 0 ? 0 : next);
  }
}
