import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { Wallet } from '@api/model/wallet.model';
import { WalletCardComponent } from './components/wallet-card/wallet-card.component';
import { WalletListItemComponent } from './components/wallet-list-item/wallet-list-item.component';
import { ViewSwitcherComponent } from './components/view-switcher/view-switcher.component';
import { ViewMode } from './models/wallet.types';
import { WalletFacade } from './services/wallet.facade';
import { ResponsiveService } from '@core/services/responsive.service';
import { PageHeaderComponent, PageHeaderConfig } from '../../shared/components/page-header/page-header.component';

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
    ViewSwitcherComponent,
    PageHeaderComponent
  ],
  templateUrl: './wallets.component.html',
  styleUrl: './wallets.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WalletsComponent implements OnInit, OnDestroy {
  // Use observables directly instead of component properties
  wallets$ = this.walletFacade.wallets$;
  isMobileView$ = this.responsiveService.screenSize$.pipe(
    map(screenSize => screenSize.isMobile)
  );
  currentViewMode$ = this.walletFacade.viewMode$;
  
  // Page header configuration
  headerConfig: PageHeaderConfig = {
    title: 'Wallets',
    subtitle: 'Manage your financial accounts and track balances',
    icon: 'pi pi-wallet',
    buttonText: 'New Wallet',
    buttonIcon: 'pi pi-plus',
    showButton: true,
    buttonClass: 'p-button-text',
    showSecondaryButton: true,
    secondaryButtonText: 'Import Wallets',
    secondaryButtonIcon: 'pi pi-download',
    secondaryButtonClass: 'p-button-outlined'
  };
  
  private subscriptions = new Subscription();

  constructor(
    public walletFacade: WalletFacade,
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
    this.loadWallets();
  }

  private setupSubscriptions(): void {
    // No auto-switching logic - let users choose their preferred view mode
    // The responsive CSS will handle the layout appropriately for both mobile and desktop
  }

  private loadWallets(): void {
    // Wallets are automatically loaded by the NgRx store
    this.walletFacade.loadWallets();
  }

  setViewMode(viewMode: ViewMode): void {
    this.walletFacade.setViewMode(viewMode);
  }

  createWallet(): void {
    this.walletFacade.navigateToCreateWallet();
  }

  /**
   * Handle secondary button click
   */
  onSecondaryButtonClick(): void {
    // In a real application, this would open an import wallets dialog
    console.log('Import wallets clicked');
  }

  viewWallet(wallet: Wallet): void {
    if (wallet.id) {
      this.walletFacade.navigateToWalletView(wallet.id);
    }
  }

  editWallet(wallet: Wallet): void {
    if (wallet.id) {
      this.walletFacade.navigateToEditWallet(wallet.id);
    }
  }

  deleteWallet(wallet: Wallet): void {
    this.walletFacade.deleteWallet(wallet);
  }

  makeDefault(wallet: Wallet): void {
    this.walletFacade.setDefaultWallet(wallet);
  }

  moveWalletUp(wallet: Wallet): void {
    this.walletFacade.moveWalletUp(wallet);
  }

  moveWalletDown(wallet: Wallet): void {
    this.walletFacade.moveWalletDown(wallet);
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
    // This will automatically save the view mode to localStorage via the reducer
    this.setViewMode(viewMode);
  }

  // TrackBy function for performance optimization
  trackByWalletId(index: number, wallet: Wallet): string {
    return wallet.id ?? '';
  }
}
