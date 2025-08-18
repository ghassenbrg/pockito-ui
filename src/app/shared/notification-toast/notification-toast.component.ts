import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { AppState } from '../../state/app.state';
import { selectNotificationQueue } from '../../state/notification/notification.selectors';
import { dismissById } from '../../state/notification/notification.actions';

@Component({
  selector: 'pockito-notification-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      *ngIf="hasNotifications()" 
      class="fixed top-4 right-4 z-50 max-w-sm w-full space-y-2"
      role="alert"
      aria-live="polite"
    >
      <!-- Stack multiple toasts vertically -->
      <div 
        *ngFor="let notification of getToastNotifications(); trackBy: trackByNotificationId"
        [ngClass]="getToastClasses(notification)"
        class="shadow-lg rounded-lg pointer-events-auto transition-all duration-300 ease-in-out transform"
      >
        <div class="p-4">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <!-- Dynamic Icon based on Notification Type -->
              <svg *ngIf="getNotificationType(notification) === 'error'" class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              
              <svg *ngIf="getNotificationType(notification) === 'warning'" class="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              
              <svg *ngIf="getNotificationType(notification) === 'info'" class="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
              
              <svg *ngIf="getNotificationType(notification) === 'success'" class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3 w-0 flex-1">
              <p [ngClass]="getTextClasses(notification)" class="text-sm font-medium">
                {{ getNotificationTypeTitle(notification) }}
              </p>
              <p [ngClass]="getMessageClasses(notification)" class="mt-1 text-sm">
                {{ notification?.message }}
              </p>
              <!-- Show timestamp for multiple notifications -->
              <p *ngIf="getToastNotifications().length > 1" class="text-xs text-gray-500 mt-1">
                {{ notification?.timestamp | date:'HH:mm:ss' }}
              </p>
            </div>
            <div class="ml-4 flex-shrink-0 flex">
              <button
                type="button"
                (click)="dismissNotificationById(notification?.id)"
                [ngClass]="getDismissButtonClasses(notification)"
                class="inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200"
                aria-label="Dismiss notification"
              >
                <span class="sr-only">Dismiss</span>
                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class NotificationToastComponent implements OnInit, OnDestroy {
  notificationQueue$: Observable<any[]>;
  private destroy$ = new Subject<void>();
  private currentQueue: any[] = [];

  constructor(
    // eslint-disable-next-line no-unused-vars
    private store: Store<AppState>
  ) {
    this.notificationQueue$ = this.store.select(selectNotificationQueue);
  }

  ngOnInit(): void {
    // Subscribe to queue changes and store locally
    this.notificationQueue$.pipe(takeUntil(this.destroy$)).subscribe(queue => {
      this.currentQueue = queue || [];
      
      // Auto-dismiss individual toasts after 6 seconds
      if (this.currentQueue.length > 0) {
        this.currentQueue.forEach(notification => {
          if (notification?.id) {
            setTimeout(() => {
              this.dismissNotificationById(notification.id);
            }, 6000);
          }
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  hasNotifications(): boolean {
    return this.getToastNotifications().length > 0;
  }

  getToastNotifications(): any[] {
    // Only return toast-type notifications
    return this.currentQueue.filter(n => n.displayType === 'toast');
  }

  dismissNotificationById(notificationId: string): void {
    if (notificationId) {
      this.store.dispatch(dismissById({ errorId: notificationId }));
    }
  }

  trackByNotificationId(index: number, notification: any): string {
    return notification?.id || index.toString();
  }

  getNotificationType(notification: any): string {
    // Use the explicit notification type from the state
    return notification?.notificationType || 'error';
  }

  getToastClasses(notification: any): string {
    const notificationType = this.getNotificationType(notification);
    
    switch (notificationType) {
      case 'error': return 'bg-red-50 border border-red-200';
      case 'warning': return 'bg-yellow-50 border border-yellow-200';
      case 'info': return 'bg-blue-50 border border-blue-200';
      case 'success': return 'bg-green-50 border border-green-200';
      default: return 'bg-gray-50 border border-gray-200';
    }
  }

  getIconClasses(notification: any): string {
    const notificationType = this.getNotificationType(notification);
    
    switch (notificationType) {
      case 'error': return 'text-red-500';
      case 'warning': return 'text-yellow-500';
      case 'info': return 'text-blue-500';
      case 'success': return 'text-green-500';
      default: return 'text-gray-500';
    }
  }

  getTextClasses(notification: any): string {
    const notificationType = this.getNotificationType(notification);
    
    switch (notificationType) {
      case 'error': return 'text-red-800';
      case 'warning': return 'text-yellow-800';
      case 'info': return 'text-blue-800';
      case 'success': return 'text-green-800';
      default: return 'text-gray-800';
    }
  }

  getMessageClasses(notification: any): string {
    const notificationType = this.getNotificationType(notification);
    
    switch (notificationType) {
      case 'error': return 'text-red-700';
      case 'warning': return 'text-yellow-700';
      case 'info': return 'text-blue-700';
      case 'success': return 'text-green-700';
      default: return 'text-gray-700';
    }
  }

  getDismissButtonClasses(notification: any): string {
    const notificationType = this.getNotificationType(notification);
    
    switch (notificationType) {
      case 'error': return 'bg-red-50 text-red-500 hover:bg-red-100 focus:ring-red-500';
      case 'warning': return 'bg-yellow-50 text-yellow-500 hover:bg-yellow-100 focus:ring-yellow-500';
      case 'info': return 'bg-blue-50 text-blue-500 hover:bg-blue-100 focus:ring-blue-500';
      case 'success': return 'bg-green-50 text-green-500 hover:bg-green-100 focus:ring-green-500';
      default: return 'bg-gray-50 text-gray-500 hover:bg-gray-100 focus:ring-gray-500';
    }
  }

  getNotificationTypeTitle(notification: any): string {
    const notificationType = this.getNotificationType(notification);
    
    switch (notificationType) {
      case 'error': return 'Error';
      case 'warning': return 'Warning';
      case 'info': return 'Information';
      case 'success': return 'Success';
      default: return 'Message';
    }
  }
}
