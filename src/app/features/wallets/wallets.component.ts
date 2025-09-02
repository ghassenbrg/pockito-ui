import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { Wallet } from '@api/model/wallet.model';
import { WalletCardComponent } from './components/wallet-card/wallet-card.component';
import { WalletListItemComponent } from './components/wallet-list-item/wallet-list-item.component';
import { ViewSwitcherComponent, ViewMode } from './components/view-switcher/view-switcher.component';
import { WalletStateService } from './services/wallet-state.service';
import { WalletActionsService } from './services/wallet-actions.service';
import { ResponsiveService } from '@core/services/responsive.service';

@Component({
  selector: 'app-wallets',
  standalone: true,
  imports: [
    CommonModule, 
    ButtonModule, 
    TooltipModule, 
    TranslateModule,
    WalletCardComponent,
    WalletListItemComponent,
    ViewSwitcherComponent
  ],
  templateUrl: './wallets.component.html',
  styleUrl: './wallets.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WalletsComponent implements OnInit, OnDestroy {
  wallets: Wallet[] = [];
  isMobileView: boolean = false;
  currentViewMode: ViewMode = 'cards';
  
  private subscriptions = new Subscription();

  constructor(
    private walletStateService: WalletStateService,
    private walletActionsService: WalletActionsService,
    private responsiveService: ResponsiveService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeComponent();
    this.setupSubscriptions();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private initializeComponent(): void {
    this.checkScreenSize();
    this.loadWallets();
  }

  private setupSubscriptions(): void {
    // Subscribe to wallet state changes
    this.subscriptions.add(
      this.walletStateService.wallets$.subscribe(wallets => {
        this.wallets = wallets;
      })
    );

    // Subscribe to view mode changes
    this.subscriptions.add(
      this.walletStateService.viewMode$.subscribe(viewMode => {
        this.currentViewMode = viewMode;
      })
    );

    // Subscribe to responsive service
    this.subscriptions.add(
      this.responsiveService.screenSize$.subscribe(screenSize => {
        this.isMobileView = screenSize.isMobile;
        // Auto-switch to list view on mobile if currently in cards view
        if (this.isMobileView && this.currentViewMode === 'cards') {
          this.setViewMode('list');
        }
      })
    );
  }

  private checkScreenSize(): void {
    this.isMobileView = this.responsiveService.isMobileView();
  }

  private loadWallets(): void {
    // Wallets are automatically loaded by the state service
    // This method is kept for backward compatibility
  }

  setViewMode(viewMode: ViewMode): void {
    this.walletStateService.setViewMode(viewMode);
  }

  createWallet(): void {
    this.walletActionsService.navigateToCreateWallet();
  }

  viewWallet(wallet: Wallet): void {
    if (wallet.id) {
      this.walletActionsService.navigateToWalletView(wallet.id);
    }
  }

  editWallet(wallet: Wallet): void {
    if (wallet.id) {
      this.walletActionsService.navigateToEditWallet(wallet.id);
    }
  }

  deleteWallet(wallet: Wallet): void {
    this.walletActionsService.deleteWallet(wallet).subscribe({
      next: () => {
        // Refresh wallets after deletion
        this.walletStateService.refreshWallets();
      },
      error: (error) => {
        console.error('Failed to delete wallet:', error);
      }
    });
  }

  makeDefault(wallet: Wallet): void {
    this.walletActionsService.setDefaultWallet(wallet).subscribe({
      next: () => {
        // Update state after setting default
        if (wallet.id) {
          this.walletStateService.setDefaultWallet(wallet.id);
        }
      },
      error: (error) => {
        console.error('Failed to set default wallet:', error);
      }
    });
  }

  moveWalletUp(wallet: Wallet): void {
    this.walletActionsService.moveWalletUp(wallet);
    // Update state after moving
    this.walletStateService.moveWalletUp(wallet);
  }

  moveWalletDown(wallet: Wallet): void {
    this.walletActionsService.moveWalletDown(wallet);
    // Update state after moving
    this.walletStateService.moveWalletDown(wallet);
  }

  // Event handlers for child components
  onViewWallet(wallet: Wallet): void {
    this.viewWallet(wallet);
  }

  onEditWallet(wallet: Wallet): void {
    this.editWallet(wallet);
  }

  onDeleteWallet(wallet: Wallet): void {
    this.deleteWallet(wallet);
  }

  onMakeDefault(wallet: Wallet): void {
    this.makeDefault(wallet);
  }

  onMoveUp(wallet: Wallet): void {
    this.moveWalletUp(wallet);
  }

  onMoveDown(wallet: Wallet): void {
    this.moveWalletDown(wallet);
  }

  onViewModeChange(viewMode: ViewMode): void {
    this.setViewMode(viewMode);
  }

  // Utility methods
  canMoveWalletUp(wallet: Wallet): boolean {
    const walletIndex = this.wallets.findIndex(w => w.id === wallet.id);
    return walletIndex > 0;
  }

  canMoveWalletDown(wallet: Wallet): boolean {
    const walletIndex = this.wallets.findIndex(w => w.id === wallet.id);
    return walletIndex < this.wallets.length - 1;
  }

  // TrackBy function for performance optimization
  trackByWalletId(index: number, wallet: Wallet): string {
    return wallet.id ?? '';
  }
}
