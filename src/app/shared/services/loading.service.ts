import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface LoadingState {
  isLoading: boolean;
  activeLoadings: Map<string, string>;
}

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<LoadingState>({ 
    isLoading: false, 
    activeLoadings: new Map() 
  });
  public loading$ = this.loadingSubject.asObservable();
  private activeLoadings = new Map<string, string>();

  show(message?: string): string {
    const id = this.generateUniqueId();
    return this.showWithId(id, message);
  }

  showWithId(id: string, message?: string): string {
    this.activeLoadings.set(id, message || '');
    this.updateLoadingState();
    return id;
  }

  hide(id: string): void {
    if (id && this.activeLoadings.has(id)) {
      this.activeLoadings.delete(id);
      this.updateLoadingState();
    }
  }

  hideAll(): void {
    this.activeLoadings.clear();
    this.updateLoadingState();
  }

  private updateLoadingState(): void {
    const isLoading = this.activeLoadings.size > 0;
    const activeLoadingsCopy = new Map(this.activeLoadings);
    this.loadingSubject.next({ 
      isLoading, 
      activeLoadings: activeLoadingsCopy 
    });
  }

  private generateUniqueId(): string {
    return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
  }

  getCurrentState(): LoadingState {
    return this.loadingSubject.value;
  }

  get isLoading(): boolean {
    return this.activeLoadings.size > 0;
  }

  get activeLoadingMessages(): string[] {
    return Array.from(this.activeLoadings.values()).filter(msg => msg);
  }

  get activeLoadingCount(): number {
    return this.activeLoadings.size;
  }
}
