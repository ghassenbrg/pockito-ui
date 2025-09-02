import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Message } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  constructor(
    private messageService: MessageService,
    private translateService: TranslateService
  ) {}

  /**
   * Show success toast
   */
  showSuccess(key: string, params?: any, life: number = 3000): void {
    this.translateService.get(`toast.success.${key}`, params).subscribe(summary => {
      this.translateService.get(`toast.messages.${key}`, params).subscribe(detail => {
        this.messageService.add({
          severity: 'success',
          summary,
          detail,
          life
        });
      });
    });
  }

  /**
   * Show info toast
   */
  showInfo(key: string, params?: any, life: number = 3000): void {
    this.translateService.get(`toast.info.${key}`, params).subscribe(summary => {
      this.translateService.get(`toast.messages.${key}`, params).subscribe(detail => {
        this.messageService.add({
          severity: 'info',
          summary,
          detail,
          life
        });
      });
    });
  }

  /**
   * Show warning toast
   */
  showWarning(key: string, params?: any, life: number = 4000): void {
    this.translateService.get(`toast.warning.${key}`, params).subscribe(summary => {
      this.translateService.get(`toast.messages.${key}`, params).subscribe(detail => {
        this.messageService.add({
          severity: 'warn',
          summary,
          detail,
          life
        });
      });
    });
  }

  /**
   * Show error toast
   */
  showError(key: string, params?: any, life: number = 5000): void {
    this.translateService.get(`toast.error.${key}`, params).subscribe(summary => {
      this.translateService.get(`toast.messages.${key}`, params).subscribe(detail => {
        this.messageService.add({
          severity: 'error',
          summary,
          detail,
          life
        });
      });
    });
  }

  /**
   * Show error toast from HTTP error
   */
  showHttpError(error: any, errorKey: string = 'general'): void {
    const params: any = {};
    
    if (error?.status) {
      params.status = error.status;
    }
    
    if (error?.error?.message) {
      params.errorMessage = error.error.message;
    } else if (error?.message) {
      params.errorMessage = error.message;
    } else if (error?.statusText) {
      params.errorMessage = `${error.statusText} (${error.status})`;
    } else if (typeof error === 'string') {
      params.errorMessage = error;
    }

    this.showError(errorKey, params);
  }

  /**
   * Show multiple toasts
   */
  showMultiple(messages: Message[]): void {
    this.messageService.addAll(messages);
  }

  /**
   * Clear all toasts
   */
  clear(): void {
    this.messageService.clear();
  }

  /**
   * Clear toasts by key
   */
  clearByKey(key: string): void {
    this.messageService.clear(key);
  }
}
