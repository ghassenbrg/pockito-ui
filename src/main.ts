import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Register service worker for PWA functionality


if ('serviceWorker' in navigator) {

  
  window.addEventListener('load', () => {
    
    
    // Try to register the service worker
    navigator.serviceWorker.register('/assets/ngsw-worker.js')
      .then((registration) => {

        
        // Check for updates
        registration.addEventListener('updatefound', () => {

          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker available
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
    // Service Worker not supported in this browser
  }


bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error('Main.ts: Angular bootstrap failed:', err));
