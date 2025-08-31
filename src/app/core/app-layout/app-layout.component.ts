import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  Renderer2,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { PockitoTerminalComponent } from '@core/pockito-terminal/pockito-terminal.component';
import { MenuItem, MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { DockModule } from 'primeng/dock';
import { GalleriaModule } from 'primeng/galleria';
import { MenubarModule } from 'primeng/menubar';
import { TerminalModule, TerminalService } from 'primeng/terminal';
import { TreeModule } from 'primeng/tree';
import { filter } from 'rxjs/operators';
import { KeycloakService } from './../keycloak.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    DockModule,
    MenubarModule,
    DialogModule,
    TreeModule,
    TerminalModule,
    GalleriaModule,
    PockitoTerminalComponent,
  ],
  providers: [MessageService, TerminalService],
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.scss'],
})
export class AppLayoutComponent implements OnInit {
  displayTerminal: boolean = false;
  displayMore: boolean = false;

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

  constructor(
    private messageService: MessageService,
    private router: Router,
    private KeycloakService: KeycloakService,
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {
    // Subscribe to router events to track active route
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.updateActiveRoute(event.url);
      });
  }

  ngOnInit() {
    this.dockItems = [
      {
        label: 'Dashboard',
        tooltipOptions: {
          tooltipLabel: 'Dashboard',
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
        label: 'Wallets',
        tooltipOptions: {
          tooltipLabel: 'Wallets',
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
        label: 'Transactions',
        tooltipOptions: {
          tooltipLabel: 'Transactions',
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
        label: 'Subscriptions',
        tooltipOptions: {
          tooltipLabel: 'Subscriptions',
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
        label: 'Budgets',
        tooltipOptions: {
          tooltipLabel: 'Budgets',
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
        label: 'Agreements',
        tooltipOptions: {
          tooltipLabel: 'Agreements',
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
        label: 'More',
        tooltipOptions: {
          tooltipLabel: 'More',
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
        label: 'Categories',
        tooltipOptions: {
          tooltipLabel: 'Categories',
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
        label: 'Terminal',
        tooltipOptions: {
          tooltipLabel: 'Terminal',
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
        label: 'Account',
        tooltipOptions: {
          tooltipLabel: 'Account',
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
        label: 'Settings',
        tooltipOptions: {
          tooltipLabel: 'Settings',
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
        label: 'Language',
        tooltipOptions: {
          tooltipLabel: 'Language',
          tooltipPosition: 'top',
          positionTop: -15,
          positionLeft: 15,
          showDelay: 300,
        },
        icon: '/assets/icons/language.png',
        command: () => {
          this.navigateTo('/app/language');
        },
      },
      {
        label: 'GitHub',
        tooltipOptions: {
          tooltipLabel: 'GitHub',
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
        label: 'Logout',
        tooltipOptions: {
          tooltipLabel: 'Logout',
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

    // Set mobile bottom navigation items: Dashboard, Wallets, Transactions, Budget, More
    this.mobileBottomNavItems = [
      this.dockItems[0], // Dashboard
      this.dockItems[1], // Wallets
      this.dockItems[2], // Transactions
      this.dockItems[4], // Budgets
      this.dockItems[6], // More
    ];

    // Set initial active route
    this.updateActiveRoute(this.router.url);
  }

  // Update active route based on current URL
  private updateActiveRoute(url: string): void {
    if (url.includes('/app/dashboard')) {
      this.activeRoute = 'Dashboard';
    } else if (url.includes('/app/wallets')) {
      this.activeRoute = 'Wallets';
    } else if (url.includes('/app/transactions')) {
      this.activeRoute = 'Transactions';
    } else if (url.includes('/app/budgets')) {
      this.activeRoute = 'Budgets';
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
    if (item.label === 'More') {
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
}
