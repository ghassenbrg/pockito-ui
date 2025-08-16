import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Register service worker for PWA functionality
console.log('Main.ts: Starting PWA initialization...');

if ('serviceWorker' in navigator) {
  console.log('Main.ts: Service Worker is supported');
  
  window.addEventListener('load', () => {
    console.log('Main.ts: Window loaded, attempting to register service worker...');
    
    // Try to register the service worker
    navigator.serviceWorker.register('/assets/ngsw-worker.js')
      .then((registration) => {
        console.log('Main.ts: Service Worker registered successfully:', registration);
        console.log('Main.ts: Service Worker scope:', registration.scope);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          console.log('Main.ts: Service Worker update found');
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              console.log('Main.ts: Service Worker state changed to:', newWorker.state);
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('Main.ts: New service worker available');
              }
            });
          }
        });
      })
      .catch((registrationError) => {
        console.error('Main.ts: Service Worker registration failed:', registrationError);
        console.error('Main.ts: Error details:', {
          name: registrationError.name,
          message: registrationError.message,
          stack: registrationError.stack
        });
        // Don't fail the app if service worker registration fails
      });
  });
} else {
  console.warn('Main.ts: Service Worker not supported in this browser');
}

console.log('Main.ts: Bootstrapping Angular application...');
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error('Main.ts: Angular bootstrap failed:', err));
