import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AppState } from '../../state/app.state';
import { raise, raiseMultiple, clear, clearAll, setDisplayType, setMaxQueueSize } from '../../state/notification/notification.actions';
import { selectGlobalDisplayType, selectBannerQueueLength, selectToastQueueLength, selectMaxQueueSize } from '../../state/notification/notification.selectors';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">Pockito Budget Management</h1>
          <p class="text-xl text-gray-600 mb-2">Centralized notification handling with NgRx</p>
          <p class="text-sm text-gray-500">Test various notification scenarios below</p>
        </div>

        <!-- Display Type Control -->
        <div class="bg-white shadow rounded-lg p-6 mb-8 max-w-md mx-auto">
          <h2 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <svg class="w-5 h-5 text-indigo-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
            </svg>
            Display Type Control
          </h2>
          <div class="flex space-x-4">
            <button
              (click)="setDisplayType('banner')"
              [ngClass]="(globalDisplayType$ | async) === 'banner' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'"
              class="flex-1 px-4 py-2 rounded-md font-medium transition-colors duration-200"
            >
              Banner Mode
            </button>
            <button
              (click)="setDisplayType('toast')"
              [ngClass]="(globalDisplayType$ | async) === 'toast' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'"
              class="flex-1 px-4 py-2 rounded-md font-medium transition-colors duration-200"
            >
              Toast Mode
            </button>
          </div>
          <p class="text-sm text-gray-600 mt-3 text-center">
            Current: <span class="font-medium">{{ (globalDisplayType$ | async) | titlecase }}</span>
          </p>
        </div>

        <!-- Queue Status -->
        <div class="bg-white shadow rounded-lg p-6 mb-8 max-w-md mx-auto">
          <h2 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <svg class="w-5 h-5 text-purple-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
            </svg>
            Notification Queue Status
          </h2>
          <div class="grid grid-cols-2 gap-4 text-center">
            <div>
              <p class="text-2xl font-bold text-purple-600">{{ (bannerQueueLength$ | async) || 0 }}</p>
              <p class="text-sm text-gray-600">banner notifications</p>
            </div>
            <div>
              <p class="text-2xl font-bold text-purple-600">{{ (toastQueueLength$ | async) || 0 }}</p>
              <p class="text-sm text-gray-600">toast notifications</p>
            </div>
          </div>
          <p class="text-xs text-gray-500 mt-2 text-center">Max: {{ (maxQueueSize$ | async) || 10 }}</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- HTTP Notifications -->
          <div class="bg-white shadow rounded-lg p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <svg class="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              HTTP Notifications
            </h2>
            <div class="space-y-3">
              <button
                (click)="testHttpNotification(404)"
                class="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 text-sm"
              >
                Test 404 Notification
              </button>
              
              <button
                (click)="testHttpNotification(500)"
                class="w-full bg-red-700 text-white px-4 py-2 rounded-md hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 text-sm"
              >
                Test 500 Notification
              </button>
              
              <button
                (click)="testHttpNotification(403)"
                class="w-full bg-red-800 text-white px-4 py-2 rounded-md hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2 text-sm"
              >
                Test 403 Notification
              </button>
            </div>
          </div>

          <!-- Custom Notifications -->
          <div class="bg-white shadow rounded-lg p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <svg class="w-5 h-5 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              Custom Notifications
            </h2>
            <div class="space-y-3">
              <button
                (click)="testCustomNotification('This is a custom notification for testing purposes', 500)"
                class="w-full bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 text-sm"
              >
                Test Custom Notification
              </button>
              
              <button
                (click)="testCustomNotification('Something went wrong in the application', 500)"
                class="w-full bg-yellow-700 text-white px-4 py-2 rounded-md hover:bg-yellow-800 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2 text-sm"
              >
                Test Generic Notification
              </button>
              
              <button
                (click)="testCustomNotification('Database connection failed', 503)"
                class="w-full bg-yellow-800 text-white px-4 py-2 rounded-md hover:bg-yellow-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 text-sm"
              >
                Test Service Notification
              </button>
            </div>
          </div>

          <!-- Explicit Notification Types -->
          <div class="bg-white shadow rounded-lg p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <svg class="w-5 h-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
              Explicit Notification Types
            </h2>
            <div class="space-y-3">
              <button
                (click)="testExplicitNotificationType('This is explicitly set as a success message', 400, 'success')"
                class="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm"
              >
                Force Success Type
              </button>
              
              <button
                (click)="testExplicitNotificationType('This is explicitly set as an info message', 500, 'info')"
                class="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm"
              >
                Force Info Type
              </button>
              
              <button
                (click)="testExplicitNotificationType('This is explicitly set as a warning message', 200, 'warning')"
                class="w-full bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 text-sm"
              >
                Force Warning Type
              </button>
            </div>
          </div>

          <!-- Validation Notifications -->
          <div class="bg-white shadow rounded-lg p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <svg class="w-5 h-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
              Validation Notifications
            </h2>
            <div class="space-y-3">
              <button
                (click)="testValidationNotification('Required fields are missing', 400)"
                class="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm"
              >
                Test Validation Notification
              </button>
              
              <button
                (click)="testValidationNotification('Invalid email format', 400)"
                class="w-full bg-blue-700 text-white px-4 py-2 rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 text-sm"
              >
                Test Format Notification
              </button>
              
              <button
                (click)="testValidationNotification('Amount must be positive', 400)"
                class="w-full bg-blue-700 text-white px-4 py-2 rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 text-sm"
              >
                Test Business Rule Notification
              </button>
            </div>
          </div>

          <!-- Network Notifications -->
          <div class="bg-white shadow rounded-lg p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <svg class="w-5 h-5 text-purple-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
              </svg>
              Network Notifications
            </h2>
            <div class="space-y-3">
              <button
                (click)="testNetworkNotification()"
                class="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 text-sm"
              >
                Test Network Notification
              </button>
              
              <button
                (click)="testTimeoutNotification()"
                class="w-full bg-purple-700 text-white px-4 py-2 rounded-md hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 text-sm"
              >
                Test Timeout Notification
              </button>
            </div>
          </div>

          <!-- Notification Management -->
          <div class="bg-white shadow rounded-lg p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <svg class="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              Notification Management
            </h2>
            <div class="space-y-3">
              <button
                (click)="clearAllNotifications()"
                class="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm"
              >
                Clear All Notifications
              </button>
              
              <button
                (click)="testMultipleNotifications()"
                class="w-full bg-green-700 text-white px-4 py-2 rounded-md hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 text-sm"
              >
                Test Multiple Notifications
              </button>
            </div>
          </div>

          <!-- Override Display Type -->
          <div class="bg-white shadow rounded-lg p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <svg class="w-5 h-5 text-orange-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
              </svg>
              Override Display Type
            </h2>
            <div class="space-y-3">
              <button
                (click)="testOverrideBanner()"
                class="w-full bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 text-sm"
              >
                Force Banner Display
              </button>
              
              <button
                (click)="testOverrideToast()"
                class="w-full bg-orange-700 text-white px-4 py-2 rounded-md hover:bg-orange-800 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2 text-sm"
              >
                Force Toast Display
              </button>
            </div>
          </div>

          <!-- Queue Testing -->
          <div class="bg-white shadow rounded-lg p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <svg class="w-5 h-5 text-pink-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
              </svg>
              Queue Testing
            </h2>
            <div class="space-y-3">
              <button
                (click)="testRapidNotifications()"
                class="w-full bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 text-sm"
              >
                Test Rapid Notifications (10)
              </button>
              
              <button
                (click)="testBulkNotifications()"
                class="w-full bg-pink-700 text-white px-4 py-2 rounded-md hover:bg-pink-800 focus:outline-none focus:ring-2 focus:ring-pink-600 focus:ring-offset-2 text-sm"
              >
                Test Bulk Notifications (5)
              </button>
              
              <button
                (click)="testQueueOverflow()"
                class="w-full bg-pink-800 text-white px-4 py-2 rounded-md hover:bg-pink-900 focus:outline-none focus:ring-2 focus:ring-pink-700 focus:ring-offset-2 text-sm"
              >
                Test Queue Overflow (15)
              </button>
            </div>
          </div>

          <!-- Info Panel -->
          <div class="bg-white shadow rounded-lg p-6 md:col-span-2 lg:col-span-3">
            <h2 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <svg class="w-5 h-5 text-gray-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
              How It Works
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <h3 class="font-medium text-gray-900 mb-2">Notification Queue System</h3>
                <ul class="space-y-1">
                  <li>• <strong>Queue Management:</strong> Stores up to 10 notifications (configurable)</li>
                  <li>• <strong>Sequential Display:</strong> Shows one notification at a time</li>
                  <li>• <strong>Navigation:</strong> Use arrow button to see next notification</li>
                  <li>• <strong>Auto-advance:</strong> Dismissing shows next notification automatically</li>
                </ul>
              </div>
              <div>
                <h3 class="font-medium text-gray-900 mb-2">Display Types</h3>
                <ul class="space-y-1">
                  <li>• <strong>Banner:</strong> Full-width at bottom of page (10s auto-dismiss)</li>
                  <li>• <strong>Toast:</strong> Fixed position top-right (6s auto-dismiss)</li>
                  <li>• <strong>Global Setting:</strong> Set default for all notifications</li>
                  <li>• <strong>Override:</strong> Force specific display type per notification</li>
                </ul>
              </div>
              <div>
                <h3 class="font-medium text-gray-900 mb-2">Notification Types</h3>
                <ul class="space-y-1">
                  <li>• <strong>Auto-calculated:</strong> Based on HTTP status codes</li>
                  <li>• <strong>Explicit override:</strong> Force specific type regardless of status</li>
                  <li>• <strong>Types:</strong> Error (red), Warning (yellow), Info (blue), Success (green)</li>
                  <li>• <strong>Smart fallback:</strong> Uses status-based calculation if no explicit type</li>
                </ul>
              </div>
              <div>
                <h3 class="font-medium text-gray-900 mb-2">Testing Scenarios</h3>
                <ul class="space-y-1">
                  <li>• <strong>Rapid Notifications:</strong> 10 notifications in quick succession</li>
                  <li>• <strong>Bulk Notifications:</strong> 5 notifications at once using raiseMultiple</li>
                  <li>• <strong>Queue Overflow:</strong> Test behavior when queue is full</li>
                  <li>• <strong>Explicit Types:</strong> Test forcing specific notification types</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class HomeComponent {
  globalDisplayType$: Observable<'banner' | 'toast'>;
  bannerQueueLength$: Observable<number>;
  toastQueueLength$: Observable<number>;
  maxQueueSize$: Observable<number>;

  constructor(
    private http: HttpClient,
    private store: Store<AppState>
  ) {
    this.globalDisplayType$ = this.store.select(selectGlobalDisplayType);
    this.bannerQueueLength$ = this.store.select(selectBannerQueueLength);
    this.toastQueueLength$ = this.store.select(selectToastQueueLength);
    this.maxQueueSize$ = this.store.select(selectMaxQueueSize);
  }

  setDisplayType(displayType: 'banner' | 'toast'): void {
    this.store.dispatch(setDisplayType({ displayType }));
  }

  testHttpNotification(status: number): void {
    // This will trigger an HTTP notification and be caught by the notification interceptor
    this.http.get(`/api/nonexistent-endpoint-${status}`).subscribe({
      error: (error: HttpErrorResponse) => {
        // The interceptor will handle this automatically
        console.log(`HTTP ${status} notification triggered:`, error);
      }
    });
  }

  testCustomNotification(message: string, status: number): void {
    // This will dispatch a custom notification to the store
    this.store.dispatch(raise({ message, status }));
  }

  testExplicitNotificationType(message: string, status: number, notificationType: 'error' | 'warning' | 'info' | 'success'): void {
    // This will dispatch a notification with explicit type override
    this.store.dispatch(raise({ message, status, notificationType }));
  }

  testValidationNotification(message: string, status: number): void {
    // This will dispatch a validation notification
    this.store.dispatch(raise({ message, status }));
  }

  testNetworkNotification(): void {
    // Simulate a network notification
    this.store.dispatch(raise({
      message: 'Network connection failed. Please check your internet connection.',
      status: 0
    }));
  }

  testTimeoutNotification(): void {
    // Simulate a timeout notification
    this.store.dispatch(raise({
      message: 'Request timed out. Please try again.',
      status: 408
    }));
  }

  clearAllNotifications(): void {
    // Clear all notifications from the store
    this.store.dispatch(clearAll());
  }

  testMultipleNotifications(): void {
    // Test multiple notifications in sequence
    setTimeout(() => {
      this.store.dispatch(raise({
        message: 'First notification: Database connection failed',
        status: 503
      }));
    }, 100);

    setTimeout(() => {
      this.store.dispatch(raise({
        message: 'Second notification: Authentication expired',
        status: 401
      }));
    }, 2000);

    setTimeout(() => {
      this.store.dispatch(raise({
        message: 'Third notification: Rate limit exceeded',
        status: 429
      }));
    }, 4000);
  }

  testOverrideBanner(): void {
    // Force banner display regardless of global setting
    this.store.dispatch(raise({
      message: 'This notification is forced to display as a banner',
      status: 400,
      displayType: 'banner'
    }));
  }

  testOverrideToast(): void {
    // Force toast display regardless of global setting
    this.store.dispatch(raise({
      message: 'This notification is forced to display as a toast',
      status: 400,
      displayType: 'toast'
    }));
  }

  testRapidNotifications(): void {
    // Test rapid notification generation
    for (let i = 1; i <= 10; i++) {
      setTimeout(() => {
        this.store.dispatch(raise({
          message: `Rapid notification ${i}: This is notification number ${i}`,
          status: 400 + (i % 3)
        }));
      }, i * 100); // 100ms apart
    }
  }

  testBulkNotifications(): void {
    // Test bulk notification creation using raiseMultiple
    const bulkNotifications = [
      { message: 'Bulk notification 1: Database timeout', status: 500 },
      { message: 'Bulk notification 2: Validation failed', status: 400 },
      { message: 'Bulk notification 3: Network error', status: 0 },
      { message: 'Bulk notification 4: Service unavailable', status: 503 },
      { message: 'Bulk notification 5: Rate limit exceeded', status: 429 }
    ];
    
    this.store.dispatch(raiseMultiple({ errors: bulkNotifications }));
  }

  testQueueOverflow(): void {
    // Test what happens when queue exceeds max size
    for (let i = 1; i <= 15; i++) {
      setTimeout(() => {
        this.store.dispatch(raise({
          message: `Overflow notification ${i}: Testing queue limits`,
          status: 400 + (i % 4)
        }));
      }, i * 50); // 50ms apart for faster overflow
    }
  }
}
