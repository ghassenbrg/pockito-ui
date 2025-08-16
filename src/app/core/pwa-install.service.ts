import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable } from 'rxjs';
import { AppState } from '../state/app.state';
import { raise } from '../state/notification/notification.actions';

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

@Injectable({
  providedIn: 'root'
})
export class PwaInstallService {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private installPromptAvailable$ = new BehaviorSubject<boolean>(false);

  constructor(private store: Store<AppState>) {
    console.log('PWA Install Service initialized');
    this.initializePwaDetection();
  }

  private initializePwaDetection(): void {
    console.log('Initializing PWA detection...');
    
    // Check PWA installation criteria
    this.checkPwaCriteria();
    
    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('beforeinstallprompt event fired');
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      this.installPromptAvailable$.next(true);
      
      // Show the install prompt toast after a delay
      setTimeout(() => {
        this.showInstallPrompt();
      }, 3000); // Show after 3 seconds
    });

    // Listen for successful installation
    window.addEventListener('appinstalled', () => {
      console.log('App installed successfully');
      this.installPromptAvailable$.next(false);
      this.deferredPrompt = null;
      
      // Show success message
      this.store.dispatch(raise({
        message: 'Pockito has been added to your home screen! 🎉',
        status: 200,
        displayType: 'toast',
        notificationType: 'success'
      }));
    });

    // Check if already installed
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      console.log('App is already running in standalone mode');
    }
  }

  private checkPwaCriteria(): void {
    console.log('=== Checking PWA Installation Criteria ===');
    
    // Check if service worker is supported
    const hasServiceWorker = 'serviceWorker' in navigator;
    console.log('Service Worker supported:', hasServiceWorker);
    
    // Check if running in HTTPS or localhost
    const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
    console.log('Secure context (HTTPS/localhost):', isSecure);
    
    // Check if manifest exists
    const manifestLink = document.querySelector('link[rel="manifest"]');
    console.log('Manifest link exists:', !!manifestLink);
    if (manifestLink) {
      console.log('Manifest href:', manifestLink.getAttribute('href'));
    }
    
    // Check if already installed
    const isStandalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
    console.log('Already running in standalone mode:', isStandalone);
    
    // Check if user has interacted with the site
    console.log('User has interacted with site:', true); // We assume this since they're on the page
    
    console.log('=========================================');
  }

  private showInstallPrompt(): void {
    if (!this.deferredPrompt) {
      console.log('No deferred prompt available');
      return;
    }

    console.log('Showing install prompt toast');
    this.store.dispatch(raise({
      message: 'Add Pockito to your home screen for quick access! 📱',
      status: 200,
      displayType: 'toast',
      notificationType: 'info'
    }));
  }

  public async promptForInstall(): Promise<boolean> {
    if (!this.deferredPrompt) {
      console.log('No install prompt available');
      return false;
    }

    try {
      console.log('Prompting for installation...');
      // Show the native install prompt
      await this.deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const choiceResult = await this.deferredPrompt.userChoice;
      console.log('Install choice result:', choiceResult);
      
      if (choiceResult.outcome === 'accepted') {
        this.installPromptAvailable$.next(false);
        this.deferredPrompt = null;
        return true;
      } else {
        // User dismissed the prompt, but we can show it again later
        return false;
      }
    } catch (error) {
      console.error('Error showing install prompt:', error);
      return false;
    }
  }

  public isInstallPromptAvailable(): Observable<boolean> {
    return this.installPromptAvailable$.asObservable();
  }

  public getInstallPromptAvailable(): boolean {
    return this.installPromptAvailable$.value;
  }

  public clearInstallPrompt(): void {
    console.log('Clearing install prompt');
    this.deferredPrompt = null;
    this.installPromptAvailable$.next(false);
  }

  // Debug method to check PWA readiness
  public debugPwaStatus(): void {
    console.log('=== PWA Status Debug ===');
    console.log('Service Worker supported:', 'serviceWorker' in navigator);
    console.log('Standalone mode:', window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
    console.log('Deferred prompt available:', !!this.deferredPrompt);
    console.log('Install prompt available:', this.installPromptAvailable$.value);
    console.log('Manifest link exists:', !!document.querySelector('link[rel="manifest"]'));
    console.log('========================');
  }
}
