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

  constructor(
    // eslint-disable-next-line no-unused-vars
    private store: Store<AppState>
  ) {

    this.initializePwaDetection();
  }

  private initializePwaDetection(): void {

    
    // Check PWA installation criteria
    this.checkPwaCriteria();
    
    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {

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
        // Already running in standalone mode
      }
  }

  private checkPwaCriteria(): void {
    // Check PWA installation criteria silently
  }

  private showInstallPrompt(): void {
    if (!this.deferredPrompt) {
  
      return;
    }


    this.store.dispatch(raise({
      message: 'Add Pockito to your home screen for quick access! 📱',
      status: 200,
      displayType: 'toast',
      notificationType: 'info'
    }));
  }

  public async promptForInstall(): Promise<boolean> {
    if (!this.deferredPrompt) {
  
      return false;
    }

    try {
  
      // Show the native install prompt
      await this.deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const choiceResult = await this.deferredPrompt.userChoice;
  
      
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

    this.deferredPrompt = null;
    this.installPromptAvailable$.next(false);
  }

  // Debug method to check PWA readiness
  public debugPwaStatus(): void {
    // PWA status debug information (removed for production)
  }
}
