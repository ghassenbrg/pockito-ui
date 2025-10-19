import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<LoadingState>({ isLoading: false });
  public loading$ = this.loadingSubject.asObservable();
  private loadingCount = 0;

  show(message?: string): void {
    this.loadingCount++;
    this.loadingSubject.next({ isLoading: true, message });
  }

  hide(): void {
    this.loadingCount--;
    if (this.loadingCount <= 0) {
      this.loadingCount = 0;
      this.loadingSubject.next({ isLoading: false });
    }
  }

  getCurrentState(): LoadingState {
    return this.loadingSubject.value;
  }

  get isLoading(): boolean {
    return this.loadingSubject.value.isLoading;
  }

  get message(): string | undefined {
    return this.loadingSubject.value.message;
  }
}
