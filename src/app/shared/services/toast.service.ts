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
  showSuccess(key: string, params?: any, life: number = 3000): void {
    const summary = this.translateService.instant(`toast.success.${key}`, params);
    const detail = this.translateService.instant(`toast.messages.${key}`, params);
    
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
  showError(key: string, params?: any, life: number = 5000): void {
    const summary = this.translateService.instant(`toast.error.${key}`, params);
    const detail = this.translateService.instant(`toast.messages.${key}`, params);
    
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
  showInfo(key: string, params?: any, life: number = 3000): void {
    const summary = this.translateService.instant(`toast.info.${key}`, params);
    const detail = this.translateService.instant(`toast.messages.${key}`, params);
    
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
  showWarning(key: string, params?: any, life: number = 5000): void {
    const summary = this.translateService.instant(`toast.warning.${key}`, params);
    const detail = this.translateService.instant(`toast.messages.${key}`, params);
    
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
  showHttpError(error: any, messageKey: string, params?: any, life: number = 5000): void {
    // Extract error details from HTTP error response
    const status = error?.status || 'Unknown';
    const errorMessage = error?.error?.message || error?.message || 'An error occurred';
    
    // Merge params with error details
    const errorParams = {
      status,
      errorMessage,
      ...params
    };

    const summary = this.translateService.instant(`toast.error.${messageKey}`, errorParams);
    const detail = this.translateService.instant(`toast.messages.${messageKey}`, errorParams);
    
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
