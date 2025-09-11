import { Injectable, HostListener } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface MobileFeatures {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  hasTouch: boolean;
  isStandalone: boolean;
  orientation: 'portrait' | 'landscape';
  screenWidth: number;
  screenHeight: number;
}

@Injectable({
  providedIn: 'root'
})
export class MobileService {
  private mobileFeaturesSubject = new BehaviorSubject<MobileFeatures>(this.getMobileFeatures());
  public mobileFeatures$ = this.mobileFeaturesSubject.asObservable();

  constructor() {
    this.updateMobileFeatures();
    
    // Listen for orientation changes
    window.addEventListener('orientationchange', () => {
      setTimeout(() => this.updateMobileFeatures(), 100);
    });
    
    // Listen for resize events
    window.addEventListener('resize', () => {
      this.updateMobileFeatures();
    });
  }

  private getMobileFeatures(): MobileFeatures {
    const isMobile = window.innerWidth <= 768;
    const isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
    const isDesktop = window.innerWidth > 1024;
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';

    return {
      isMobile,
      isTablet,
      isDesktop,
      hasTouch,
      isStandalone,
      orientation,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight
    };
  }

  private updateMobileFeatures(): void {
    this.mobileFeaturesSubject.next(this.getMobileFeatures());
  }

  // Utility methods
  isMobile(): boolean {
    return this.mobileFeaturesSubject.value.isMobile;
  }

  isTablet(): boolean {
    return this.mobileFeaturesSubject.value.isTablet;
  }

  isDesktop(): boolean {
    return this.mobileFeaturesSubject.value.isDesktop;
  }

  hasTouch(): boolean {
    return this.mobileFeaturesSubject.value.hasTouch;
  }

  isStandalone(): boolean {
    return this.mobileFeaturesSubject.value.isStandalone;
  }

  getOrientation(): 'portrait' | 'landscape' {
    return this.mobileFeaturesSubject.value.orientation;
  }

  // Touch gesture helpers
  createRippleEffect(element: HTMLElement, event: TouchEvent | MouseEvent): void {
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event instanceof TouchEvent ? event.touches[0].clientX - rect.left : event.clientX - rect.left;
    const y = event instanceof TouchEvent ? event.touches[0].clientY - rect.top : event.clientY - rect.top;

    const ripple = document.createElement('div');
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.5);
      transform: scale(0);
      animation: ripple 0.6s linear;
      left: ${x - size / 2}px;
      top: ${y - size / 2}px;
      width: ${size}px;
      height: ${size}px;
      pointer-events: none;
    `;

    element.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  }

  // Haptic feedback (if supported)
  hapticFeedback(type: 'light' | 'medium' | 'heavy' = 'light'): void {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30]
      };
      navigator.vibrate(patterns[type]);
    }
  }

  // Pull to refresh helper
  setupPullToRefresh(callback: () => void): () => void {
    let startY = 0;
    let pullDistance = 0;
    let isPulling = false;
    let pullThreshold = 80;

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY;
        isPulling = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling || window.scrollY > 0) return;

      const currentY = e.touches[0].clientY;
      pullDistance = Math.max(0, currentY - startY);

      if (pullDistance > pullThreshold) {
        e.preventDefault();
        this.showPullToRefreshIndicator();
      }
    };

    const handleTouchEnd = () => {
      if (isPulling && pullDistance > pullThreshold) {
        callback();
        this.hidePullToRefreshIndicator();
      }
      
      isPulling = false;
      pullDistance = 0;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }

  private showPullToRefreshIndicator(): void {
    let indicator = document.querySelector('.pull-to-refresh') as HTMLElement;
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.className = 'pull-to-refresh active';
      indicator.innerHTML = '<div class="refresh-icon"></div>';
      document.body.appendChild(indicator);
    } else {
      indicator.classList.add('active');
    }
  }

  private hidePullToRefreshIndicator(): void {
    const indicator = document.querySelector('.pull-to-refresh') as HTMLElement;
    if (indicator) {
      indicator.classList.remove('active');
      setTimeout(() => indicator.remove(), 300);
    }
  }

  // Swipe gesture helper
  setupSwipeGesture(
    element: HTMLElement,
    callbacks: {
      onSwipeLeft?: () => void;
      onSwipeRight?: () => void;
      onSwipeUp?: () => void;
      onSwipeDown?: () => void;
    },
    options: { threshold?: number; preventDefault?: boolean } = {}
  ): () => void {
    const threshold = options.threshold || 50;
    const preventDefault = options.preventDefault !== false;

    let startX = 0;
    let startY = 0;
    let endX = 0;
    let endY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      endX = e.changedTouches[0].clientX;
      endY = e.changedTouches[0].clientY;

      const deltaX = endX - startX;
      const deltaY = endY - startY;

      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      if (Math.max(absDeltaX, absDeltaY) > threshold) {
        if (preventDefault) {
          e.preventDefault();
        }

        if (absDeltaX > absDeltaY) {
          // Horizontal swipe
          if (deltaX > 0 && callbacks.onSwipeRight) {
            callbacks.onSwipeRight();
          } else if (deltaX < 0 && callbacks.onSwipeLeft) {
            callbacks.onSwipeLeft();
          }
        } else {
          // Vertical swipe
          if (deltaY > 0 && callbacks.onSwipeDown) {
            callbacks.onSwipeDown();
          } else if (deltaY < 0 && callbacks.onSwipeUp) {
            callbacks.onSwipeUp();
          }
        }
      }
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: !preventDefault });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }
}
