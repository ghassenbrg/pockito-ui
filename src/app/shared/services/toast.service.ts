import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { ToastMessage } from '../models/toast-message.model';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastMessagesSubject = new BehaviorSubject<ToastMessage[]>([]);
  public toastMessages$ = this.toastMessagesSubject.asObservable();

  constructor(private translateService: TranslateService) {}

  /**
   * Show success toast
   */
  showSuccess(title: string, message: string, params?: any, life: number = 3000): void {
    const summary = this.translateService.instant(title, params);
    const detail = this.translateService.instant(message, params);
    
    this.addToast({
      severity: 'success',
      summary,
      detail,
      life,
    });
  }

  /**
   * Show error toast
   */
  showError(title: string, message: string, params?: any, life: number = 5000): void {
    const summary = this.translateService.instant(title, params);
    const detail = this.translateService.instant(message, params);
    
    this.addToast({
      severity: 'error',
      summary,
      detail,
      life,
    });
  }

  /**
   * Show info toast
   */
  showInfo(title: string, message: string, params?: any, life: number = 3000): void {
    const summary = this.translateService.instant(title, params);
    const detail = this.translateService.instant(message, params);
    
    this.addToast({
      severity: 'info',
      summary,
      detail,
      life,
    });
  }

  /**
   * Show warning toast
   */
  showWarning(title: string, message: string, params?: any, life: number = 5000): void {
    const summary = this.translateService.instant(title, params);
    const detail = this.translateService.instant(message, params);
    
    this.addToast({
      severity: 'warn',
      summary,
      detail,
      life,
    });
  }

  /**
   * Show HTTP error toast (for API service errors)
   */
  showHttpError(error: any, title: string, message: string, params?: any, life: number = 5000): void {
    // Extract error details from HTTP error response
    const status = error?.status || 'Unknown';
    const errorMessage = error?.error?.message || error?.message || 'An error occurred';
    
    // Merge params with error details
    const errorParams = {
      status,
      errorMessage,
      ...params
    };

    const summary = this.translateService.instant(title, errorParams);
    const detail = this.translateService.instant(message, errorParams);
    
    this.addToast({
      severity: 'error',
      summary,
      detail,
      life,
    });
  }

  /**
   * Add toast to the list
   */
  private addToast(toast: ToastMessage): void {
    const currentToasts = this.toastMessagesSubject.value;
    this.toastMessagesSubject.next([...currentToasts, toast]);
  }

  /**
   * Clear all toasts
   */
  clearAll(): void {
    this.toastMessagesSubject.next([]);
  }

  /**
   * Get current toasts
   */
  getToasts(): ToastMessage[] {
    return this.toastMessagesSubject.value;
  }
}
