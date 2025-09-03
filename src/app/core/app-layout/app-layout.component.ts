import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { UserDto } from '@api/model/user.model';
import { UserService } from '@api/services/user.service';
import { PockitoTerminalComponent } from '@core/pockito-terminal/pockito-terminal.component';
import { KeycloakService } from '@core/security/keycloak.service';
import { ResponsiveService } from '@core/services/responsive.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { LanguageSwitcherComponent } from '@shared/components/language-switcher/language-switcher.component';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { ToastComponent } from '@shared/components/toast/toast.component';
import { LoadingService } from '@shared/services/loading.service';
import { MenuItem, MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { DockModule } from 'primeng/dock';
import { TerminalModule, TerminalService } from 'primeng/terminal';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    DockModule,
    DialogModule,
    TerminalModule,
    TranslatePipe,
    PockitoTerminalComponent,
    LanguageSwitcherComponent,
    LoadingSpinnerComponent,
    ToastComponent,
  ],
  providers: [MessageService, TerminalService],
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.scss'],
})
export class AppLayoutComponent implements OnInit, OnDestroy {
  displayTerminal: boolean = false;
  displayMore: boolean = false;
  displaySwitchLanguage: boolean = false;

  // Mobile navigation state
  mobileMenuOpen: boolean = false;

  // Touch gesture support
  private touchStartX: number = 0;
  private touchStartY: number = 0;
  private touchEndX: number = 0;
  private touchEndY: number = 0;
  private readonly minSwipeDistance = 50;

  dockItems: MenuItem[] | undefined;
  moreItems: MenuItem[] | undefined;

  // Mobile bottom navigation items (5 items: Dashboard, Wallets, Transactions, Budget, More)
  mobileBottomNavItems: MenuItem[] | undefined;

  // Active route tracking
  activeRoute: string = '';

  // Current user info
  currentUser: UserDto | null = null;

  private responsiveSubscription!: Subscription;

  // Loading state observable
  loading$ = this.loadingService.loading$;

  constructor(
    private router: Router,
    private KeycloakService: KeycloakService,
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private translate: TranslateService,
    private responsiveService: ResponsiveService,
    private loadingService: LoadingService,
    private userService: UserService
  ) {
    // Subscribe to router events to track active route
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.updateActiveRoute(event.url);
      });
  }

  ngOnInit() {
    // Get current user info
    this.loadCurrentUser();

    this.initializeMenuItems();

    // Subscribe to language changes to refresh menu items
    this.translate.onLangChange.subscribe(() => {
      this.initializeMenuItems();
      this.updateActiveRoute(this.router.url);
    });

    // Subscribe to screen size changes to refresh menu items
    this.responsiveSubscription = this.responsiveService.screenSize$.subscribe(
      () => {
        this.initializeMenuItems();
      }
    );

    // Set initial active route
    this.updateActiveRoute(this.router.url);
  }

  ngOnDestroy() {
    if (this.responsiveSubscription) {
      this.responsiveSubscription.unsubscribe();
    }
  }

  private initializeMenuItems() {
    this.dockItems = [
      {
        label: this.translate.instant('appLayout.navigation.dashboard'),
        tooltipOptions: {
          tooltipLabel: this.translate.instant(
            'appLayout.navigation.dashboard'
          ),
          tooltipPosition: 'top',
          positionTop: -15,
          positionLeft: 15,
          showDelay: 300,
        },
        icon: '/assets/favicon.png',
        command: () => {
          this.navigateTo('/app/dashboard');
        },
      },
      {
        label: this.translate.instant('appLayout.navigation.wallets'),
        tooltipOptions: {
          tooltipLabel: this.translate.instant('appLayout.navigation.wallets'),
          tooltipPosition: 'top',
          positionTop: -15,
          positionLeft: 15,
          showDelay: 300,
        },
        icon: '/assets/icons/wallet.png',
        command: () => {
          this.navigateTo('/app/wallets');
        },
      },
      {
        label: this.translate.instant('appLayout.navigation.transactions'),
        tooltipOptions: {
          tooltipLabel: this.translate.instant(
            'appLayout.navigation.transactions'
          ),
          tooltipPosition: 'top',
          positionTop: -15,
          positionLeft: 15,
          showDelay: 300,
        },
        icon: '/assets/icons/transaction.png',
        command: () => {
          this.navigateTo('/app/transactions');
        },
      },
      {
        label: this.translate.instant('appLayout.navigation.subscriptions'),
        tooltipOptions: {
          tooltipLabel: this.translate.instant(
            'appLayout.navigation.subscriptions'
          ),
          tooltipPosition: 'top',
          positionTop: -15,
          positionLeft: 15,
          showDelay: 300,
        },
        icon: '/assets/icons/subscription.png',
        command: () => {
          this.navigateTo('/app/subscriptions');
        },
      },
      {
        label: this.translate.instant('appLayout.navigation.budgets'),
        tooltipOptions: {
          tooltipLabel: this.translate.instant('appLayout.navigation.budgets'),
          tooltipPosition: 'top',
          positionTop: -15,
          positionLeft: 15,
          showDelay: 300,
        },
        icon: '/assets/icons/budget.png',
        command: () => {
          this.navigateTo('/app/budgets');
        },
      },
      {
        label: this.translate.instant('appLayout.navigation.agreements'),
        tooltipOptions: {
          tooltipLabel: this.translate.instant(
            'appLayout.navigation.agreements'
          ),
          tooltipPosition: 'top',
          positionTop: -15,
          positionLeft: 15,
          showDelay: 300,
        },
        icon: '/assets/icons/agreement.png',
        command: () => {
          this.navigateTo('/app/agreements');
        },
      },
      {
        label: this.translate.instant('appLayout.navigation.more'),
        tooltipOptions: {
          tooltipLabel: this.translate.instant('appLayout.navigation.more'),
          tooltipPosition: 'top',
          positionTop: -15,
          positionLeft: 15,
          showDelay: 300,
        },
        icon: '/assets/icons/more.png',
        command: () => {
          this.displayMore = true;
        },
      },
    ];

    this.moreItems = [
      {
        label: this.translate.instant('appLayout.navigation.categories'),
        tooltipOptions: {
          tooltipLabel: this.translate.instant(
            'appLayout.navigation.categories'
          ),
          tooltipPosition: 'top',
          positionTop: -15,
          positionLeft: 15,
          showDelay: 300,
        },
        icon: '/assets/icons/category.png',
        command: () => {
          this.navigateTo('/app/categories');
        },
      },
      {
        label: this.translate.instant('appLayout.navigation.terminal'),
        tooltipOptions: {
          tooltipLabel: this.translate.instant('appLayout.navigation.terminal'),
          tooltipPosition: 'top',
          positionTop: -15,
          positionLeft: 15,
          showDelay: 300,
        },
        icon: '/assets/icons/terminal.svg',
        command: () => {
          this.displayTerminal = true;
        },
      },
      {
        label: this.translate.instant('appLayout.navigation.account'),
        tooltipOptions: {
          tooltipLabel: this.translate.instant('appLayout.navigation.account'),
          tooltipPosition: 'top',
          positionTop: -15,
          positionLeft: 15,
          showDelay: 300,
        },
        icon: '/assets/icons/account.png',
        command: () => {
          this.navigateTo('/app/account');
        },
      },
      {
        label: this.translate.instant('appLayout.navigation.settings'),
        tooltipOptions: {
          tooltipLabel: this.translate.instant('appLayout.navigation.settings'),
          tooltipPosition: 'top',
          positionTop: -15,
          positionLeft: 15,
          showDelay: 300,
        },
        icon: '/assets/icons/settings.png',
        command: () => {
          this.navigateTo('/app/settings');
        },
      },
      {
        label: this.translate.instant('appLayout.navigation.language'),
        tooltipOptions: {
          tooltipLabel: this.translate.instant('appLayout.navigation.language'),
          tooltipPosition: 'top',
          positionTop: -15,
          positionLeft: 15,
          showDelay: 300,
        },
        icon: '/assets/icons/language.png',
        command: () => {
          this.displaySwitchLanguage = true;
        },
      },
      {
        label: this.translate.instant('appLayout.navigation.github'),
        tooltipOptions: {
          tooltipLabel: this.translate.instant('appLayout.navigation.github'),
          tooltipPosition: 'top',
          positionTop: -15,
          positionLeft: 15,
          showDelay: 300,
        },
        icon: '/assets/icons/github.svg',
        command: () => {
          window.open('https://github.com/ghassenbrg/pockito', '_blank');
        },
      },
      {
        label: this.translate.instant('appLayout.navigation.logout'),
        tooltipOptions: {
          tooltipLabel: this.translate.instant('appLayout.navigation.logout'),
          tooltipPosition: 'top',
          positionTop: -15,
          positionLeft: 15,
          showDelay: 300,
        },
        icon: '/assets/icons/logout.png',
        command: () => {
          this.KeycloakService.logout();
        },
      },
    ];

    // Add mobile-specific items to moreItems when in mobile mode
    if (
      this.responsiveService.isTabletView() ||
      this.responsiveService.isMobileView()
    ) {
      // Add subscriptions (dockItems[3]) and agreements (dockItems[5]) to moreItems
      if (this.dockItems && this.dockItems.length >= 6) {
        // Insert subscriptions at the beginning
        this.moreItems.unshift({
          ...this.dockItems[3], // Subscriptions
          icon: '/assets/icons/subscription-no-bg.png',
        });

        // Insert agreements after subscriptions
        this.moreItems.splice(2, 0, {
          ...this.dockItems[5], // Agreements
          icon: '/assets/icons/agreement-no-bg.png',
        });
      }
    }

    // Set mobile bottom navigation items: Dashboard, Wallets, Transactions, Budget, More
    // Use no-bg icons for mobile navigation
    this.mobileBottomNavItems = [
      {
        ...this.dockItems[0], // Dashboard
      },
      {
        ...this.dockItems[1], // Wallets
        icon: '/assets/icons/wallet-no-bg.png',
      },
      {
        ...this.dockItems[2], // Transactions
        icon: '/assets/icons/transaction-no-bg.png',
      },
      {
        ...this.dockItems[4], // Budgets
        icon: '/assets/icons/budget-no-bg.png',
      },
      {
        ...this.dockItems[6], // More
        icon: '/assets/icons/more-no-bg.png',
      },
    ];

    // Set initial active route
    this.updateActiveRoute(this.router.url);
  }

  /**
   * Load current user information from the /me endpoint
   */
  private loadCurrentUser(): void {
    this.userService.getOrCreateCurrentUser().subscribe({
      next: (user: UserDto) => {
        this.currentUser = user;
      },
      error: (error) => {
        console.error('Failed to load current user:', error);
        // Don't throw error here as it's not critical for the app to function
      },
    });
  }

  // Update active route based on current URL
  private updateActiveRoute(url: string): void {
    if (url.includes('/app/dashboard')) {
      this.activeRoute = this.translate.instant(
        'appLayout.navigation.dashboard'
      );
    } else if (url.includes('/app/wallets')) {
      this.activeRoute = this.translate.instant('appLayout.navigation.wallets');
    } else if (url.includes('/app/transactions')) {
      this.activeRoute = this.translate.instant(
        'appLayout.navigation.transactions'
      );
    } else if (url.includes('/app/budgets')) {
      this.activeRoute = this.translate.instant('appLayout.navigation.budgets');
    } else {
      this.activeRoute = '';
    }
  }

  // Check if a navigation item is active
  isActiveTab(item: MenuItem): boolean {
    return item.label === this.activeRoute;
  }

  // Touch gesture support
  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.changedTouches[0].screenX;
    this.touchStartY = event.changedTouches[0].screenY;
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent) {
    this.touchEndX = event.changedTouches[0].screenX;
    this.touchEndY = event.changedTouches[0].screenY;
    this.handleSwipe();
  }

  private handleSwipe() {
    const distanceX = this.touchStartX - this.touchEndX;
    const distanceY = this.touchStartY - this.touchEndY;
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);

    if (isHorizontalSwipe && Math.abs(distanceX) > this.minSwipeDistance) {
      if (distanceX > 0) {
        // Swipe left - open menu
        if (!this.mobileMenuOpen) {
          this.openMobileMenu();
        }
      } else {
        // Swipe right - close menu
        if (this.mobileMenuOpen) {
          this.closeMobileMenu();
        }
      }
    }
  }

  // Mobile navigation methods
  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    this.updateBodyScroll();
  }

  openMobileMenu(): void {
    this.mobileMenuOpen = true;
    this.updateBodyScroll();
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
    this.updateBodyScroll();
  }

  private updateBodyScroll(): void {
    if (this.mobileMenuOpen) {
      this.renderer.addClass(document.body, 'mobile-menu-open');
    } else {
      this.renderer.removeClass(document.body, 'mobile-menu-open');
    }
  }

  handleMobileNavigation(item: MenuItem): void {
    this.closeMobileMenu();
    if (item.command) {
      item.command({} as any); // Pass empty event object
    }
  }

  // Handle mobile bottom navigation clicks
  handleMobileBottomNavClick(item: MenuItem): void {
    if (item.label === this.translate.instant('appLayout.navigation.more')) {
      // Open the more options dialog (same behavior as top bar)
      this.displayMore = true;
    } else {
      // Navigate to the selected item
      if (item.command) {
        item.command({} as any);
      }
    }
  }

  // Close menu when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const mobileNav =
      this.elementRef.nativeElement.querySelector('.mobile-side-nav');

    if (this.mobileMenuOpen && !mobileNav?.contains(target)) {
      this.closeMobileMenu();
    }
  }

  // Handle escape key
  @HostListener('document:keydown.escape')
  onEscapeKey() {
    if (this.mobileMenuOpen) {
      this.closeMobileMenu();
    }
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  commandHandler(command: any) {
    this.displayMore = false;
    if (command && typeof command === 'function') {
      command();
    }
  }

  // Handle language change from language switcher
  onLanguageChanged(_langCode: string): void {
    // Close the language switcher dialog
    this.displaySwitchLanguage = false;

    // The translation service has already been updated
    // The menu items will be refreshed automatically via the language change subscription
    // in ngOnInit()
  }
}
