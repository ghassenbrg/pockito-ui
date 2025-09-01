import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ScreenSize {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ResponsiveService implements OnDestroy {
  private screenSizeSubject = new BehaviorSubject<ScreenSize>(this.getCurrentScreenSize());
  public screenSize$ = this.screenSizeSubject.asObservable();

  private resizeListener: () => void;

  constructor() {
    this.resizeListener = () => this.updateScreenSize();
    window.addEventListener('resize', this.resizeListener);
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.resizeListener);
  }

  getCurrentScreenSize(): ScreenSize {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    return {
      width,
      height,
      isMobile: width <= 768,
      isTablet: width > 768 && width <= 1024,
      isDesktop: width > 1024
    };
  }

  private updateScreenSize(): void {
    this.screenSizeSubject.next(this.getCurrentScreenSize());
  }

  isMobileView(): boolean {
    return this.screenSizeSubject.value.isMobile;
  }

  isTabletView(): boolean {
    return this.screenSizeSubject.value.isTablet;
  }

  isDesktopView(): boolean {
    return this.screenSizeSubject.value.isDesktop;
  }

  getScreenWidth(): number {
    return this.screenSizeSubject.value.width;
  }

  getScreenHeight(): number {
    return this.screenSizeSubject.value.height;
  }

  // Utility methods for responsive behavior
  shouldShowMobileView(): boolean {
    return this.isMobileView();
  }

  shouldShowTabletView(): boolean {
    return this.isTabletView();
  }

  shouldShowDesktopView(): boolean {
    return this.isDesktopView();
  }

  // Breakpoint checks
  isBelowBreakpoint(breakpoint: number): boolean {
    return this.getScreenWidth() < breakpoint;
  }

  isAboveBreakpoint(breakpoint: number): boolean {
    return this.getScreenWidth() >= breakpoint;
  }

  // Common breakpoints
  isBelowMobile(): boolean {
    return this.isBelowBreakpoint(480);
  }

  isBelowTablet(): boolean {
    return this.isBelowBreakpoint(768);
  }

  isBelowDesktop(): boolean {
    return this.isBelowBreakpoint(1024);
  }

  isAboveMobile(): boolean {
    return this.isAboveBreakpoint(768);
  }

  isAboveTablet(): boolean {
    return this.isAboveBreakpoint(1024);
  }
}
