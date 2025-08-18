import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { AppState } from '../../state/app.state';
import { 
  selectCurrentNotification, 
  selectShouldShowBanner, 
  selectBannerQueueLength,
  selectHasMultipleNotifications,
  selectNextNotification,
  selectNotificationType
} from '../../state/notification/notification.selectors';
import { dismiss } from '../../state/notification/notification.actions';

@Component({
  selector: 'pockito-notification-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      *ngIf="shouldShowBanner$ | async" 
      [ngClass]="getBannerClasses()"
      class="fixed bottom-0 left-0 right-0 z-50 border-t-4 transition-all duration-300 ease-in-out transform"
      role="alert"
      aria-live="polite"
    >
      <div class="p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <!-- Dynamic Icon based on Notification Type -->
            <svg *ngIf="(notificationType$ | async) === 'error'" class="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            
            <svg *ngIf="(notificationType$ | async) === 'warning'" class="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            
            <svg *ngIf="(notificationType$ | async) === 'info'" class="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
            
            <svg *ngIf="(notificationType$ | async) === 'success'" class="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3 flex-1">
            <div class="flex items-center justify-between">
              <div>
                <p [ngClass]="getTextClasses()" class="text-sm font-medium">
                  <span class="font-semibold">{{ getNotificationTypeTitle() }}</span>
                  <span class="ml-2">{{ (currentNotification$ | async)?.message }}</span>
                </p>
                <p *ngIf="getNotificationDescription()" [ngClass]="getDescriptionClasses()" class="text-xs mt-1">
                  {{ getNotificationDescription() }}
                </p>
                
                <!-- Queue Information - Only show banner notifications count -->
                <div *ngIf="(hasMultipleNotifications$ | async)" class="mt-2 flex items-center space-x-2">
                  <span class="text-xs px-2 py-1 bg-white bg-opacity-50 rounded-full font-medium">
                    {{ (bannerQueueLength$ | async) }} banner notifications in queue
                  </span>
                  <button
                    (click)="showNextNotification()"
                    class="text-xs px-2 py-1 bg-white bg-opacity-30 hover:bg-opacity-50 rounded-full transition-colors duration-200"
                  >
                    Show next ({{ (nextNotification$ | async)?.message | slice:0:20 }}{{ (nextNotification$ | async)?.message.length > 20 ? '...' : '' }})
                  </button>
                </div>
              </div>
              <div class="ml-4 flex-shrink-0 flex items-center space-x-2">
                <!-- Queue Navigation -->
                <div *ngIf="(hasMultipleNotifications$ | async)" class="flex items-center space-x-1">
                  <button
                    (click)="showNextNotification()"
                    class="inline-flex rounded-md p-1.5 text-gray-500 hover:bg-white hover:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200"
                    aria-label="Show next notification"
                  >
                    <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>
                
                <!-- Dismiss Button -->
                <button
                  type="button"
                  (click)="dismissNotification()"
                  [ngClass]="getDismissButtonClasses()"
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
    </div>
  `,
  styles: []
})
export class NotificationBannerComponent implements OnInit, OnDestroy {
  currentNotification$: Observable<any>;
  shouldShowBanner$: Observable<boolean>;
  bannerQueueLength$: Observable<number>;
  hasMultipleNotifications$: Observable<boolean>;
  nextNotification$: Observable<any>;
  notificationType$: Observable<string>;
  private destroy$ = new Subject<void>();

  constructor(
    // eslint-disable-next-line no-unused-vars
    private store: Store<AppState>
  ) {
    this.currentNotification$ = this.store.select(selectCurrentNotification);
    this.shouldShowBanner$ = this.store.select(selectShouldShowBanner);
    this.bannerQueueLength$ = this.store.select(selectBannerQueueLength);
    this.hasMultipleNotifications$ = this.store.select(selectHasMultipleNotifications);
    this.nextNotification$ = this.store.select(selectNextNotification);
    this.notificationType$ = this.store.select(selectNotificationType);
  }

  ngOnInit(): void {
    // Auto-dismiss notifications after 10 seconds
    this.shouldShowBanner$.pipe(takeUntil(this.destroy$)).subscribe(shouldShow => {
      if (shouldShow) {
        setTimeout(() => {
          this.dismissNotification();
        }, 10000);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  dismissNotification(): void {
    this.store.dispatch(dismiss());
  }

  showNextNotification(): void {
    // This will trigger the next notification to be displayed
    this.store.dispatch(dismiss());
  }

  getBannerClasses(): string {
    const notificationType = this.getCurrentNotificationType();
    
    switch (notificationType) {
      case 'error': return 'bg-red-50 border-red-500';
      case 'warning': return 'bg-yellow-50 border-yellow-500';
      case 'info': return 'bg-blue-50 border-blue-500';
      case 'success': return 'bg-green-50 border-green-500';
      default: return 'bg-gray-50 border-gray-500';
    }
  }

  getIconClasses(): string {
    const notificationType = this.getCurrentNotificationType();
    
    switch (notificationType) {
      case 'error': return 'text-red-500';
      case 'warning': return 'text-yellow-500';
      case 'info': return 'text-blue-500';
      case 'success': return 'text-green-500';
      default: return 'text-gray-500';
    }
  }

  getTextClasses(): string {
    const notificationType = this.getCurrentNotificationType();
    
    switch (notificationType) {
      case 'error': return 'text-red-700';
      case 'warning': return 'text-yellow-700';
      case 'info': return 'text-blue-700';
      case 'success': return 'text-green-700';
      default: return 'text-gray-700';
    }
  }

  getDescriptionClasses(): string {
    const notificationType = this.getCurrentNotificationType();
    
    switch (notificationType) {
      case 'error': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      case 'info': return 'text-blue-600';
      case 'success': return 'text-green-600';
      default: return 'text-gray-600';
    }
  }

  getDismissButtonClasses(): string {
    const notificationType = this.getCurrentNotificationType();
    
    switch (notificationType) {
      case 'error': return 'bg-red-50 text-red-500 hover:bg-red-100 focus:ring-red-500';
      case 'warning': return 'bg-yellow-50 text-yellow-500 hover:bg-yellow-100 focus:ring-yellow-500';
      case 'info': return 'bg-blue-50 text-blue-500 hover:bg-blue-100 focus:ring-blue-500';
      case 'success': return 'bg-green-50 text-green-500 hover:bg-green-100 focus:ring-green-500';
      default: return 'bg-gray-50 text-gray-500 hover:bg-gray-100 focus:ring-blue-500';
    }
  }

  getNotificationTypeTitle(): string {
    const notificationType = this.getCurrentNotificationType();
    
    switch (notificationType) {
      case 'error': return 'Error:';
      case 'warning': return 'Warning:';
      case 'info': return 'Information:';
      case 'success': return 'Success:';
      default: return 'Message:';
    }
  }

  getNotificationDescription(): string {
    const notification = this.getCurrentNotification();
    if (!notification) return '';
    
    switch (notification.status) {
      case 400: return 'Bad Request - Please check your input and try again.';
      case 401: return 'Unauthorized - Please log in to continue.';
      case 403: return 'Forbidden - You don\'t have permission to access this resource.';
      case 404: return 'Not Found - The requested resource was not found.';
      case 408: return 'Request Timeout - The request took too long to complete.';
      case 429: return 'Too Many Requests - Please wait before trying again.';
      case 500: return 'Internal Server Error - Something went wrong on our end.';
      case 503: return 'Service Unavailable - The service is temporarily unavailable.';
      default: return '';
    }
  }

  private getCurrentNotification(): any {
    let notification: any = null;
    this.currentNotification$.pipe(takeUntil(this.destroy$)).subscribe(n => notification = n);
    return notification;
  }

  private getCurrentNotificationType(): string {
    let notificationType: string = 'error';
    this.notificationType$.pipe(takeUntil(this.destroy$)).subscribe(type => notificationType = type);
    return notificationType;
  }
}
