import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subject, takeUntil } from 'rxjs';
import { PwaInstallService } from '../../core/pwa-install.service';

@Component({
  selector: 'pockito-pwa-install-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      *ngIf="showInstallPrompt$ | async" 
      class="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto"
      role="alert"
      aria-live="polite"
    >
      <div class="bg-blue-50 border border-blue-200 shadow-lg rounded-lg pointer-events-auto transition-all duration-300 ease-in-out transform">
        <div class="p-4">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <!-- Install icon -->
              <svg class="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3 w-0 flex-1">
              <p class="text-sm font-medium text-blue-800">
                Install Pockito
              </p>
              <p class="mt-1 text-sm text-blue-700">
                Add to your home screen for quick access! 📱
              </p>
              <!-- Action buttons -->
              <div class="mt-3 flex space-x-2">
                <button
                  type="button"
                  (click)="installApp()"
                  class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  Install
                </button>
                <button
                  type="button"
                  (click)="dismissPrompt()"
                  class="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  Maybe Later
                </button>
              </div>
            </div>
            <div class="ml-4 flex-shrink-0 flex">
              <button
                type="button"
                (click)="dismissPrompt()"
                class="inline-flex rounded-md p-1.5 bg-blue-50 text-blue-500 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                aria-label="Dismiss install prompt"
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
export class PwaInstallToastComponent implements OnInit, OnDestroy {
  showInstallPrompt$: Observable<boolean>;
  private destroy$ = new Subject<void>();

  constructor(
    // eslint-disable-next-line no-unused-vars
    private pwaInstallService: PwaInstallService
  ) {
    this.showInstallPrompt$ = this.pwaInstallService.isInstallPromptAvailable();
  }

  ngOnInit(): void {
    // Auto-dismiss the prompt after 30 seconds if user doesn't interact
    this.showInstallPrompt$.pipe(takeUntil(this.destroy$)).subscribe(show => {
      if (show) {
        setTimeout(() => {
          this.dismissPrompt();
        }, 30000); // 30 seconds
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async installApp(): Promise<void> {
    try {
      const installed = await this.pwaInstallService.promptForInstall();
      if (installed) {
        // The native install prompt will handle the rest
        // Success message will be shown by the service
      }
    } catch (error) {
      console.error('Failed to install app:', error);
    }
  }

  dismissPrompt(): void {
    this.pwaInstallService.clearInstallPrompt();
  }
}
