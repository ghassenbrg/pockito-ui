import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnChanges, SimpleChanges, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { MenuModule } from 'primeng/menu';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Wallet } from '@api/model/wallet.model';
import { WalletDisplayService } from '../../services/wallet-display.service';
import { WalletGoalProgress, FormattedAmount } from '../../models/wallet.types';
import { MenuItem } from 'primeng/api';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-wallet-list-item',
  standalone: true,
  imports: [CommonModule, ButtonModule, TooltipModule, MenuModule, OverlayPanelModule, TranslateModule],
  templateUrl: './wallet-list-item.component.html',
  styleUrl: './wallet-list-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WalletListItemComponent implements OnInit, OnChanges, OnDestroy {
  @Input() wallet!: Wallet;
  @Input() canMoveUp: boolean = false;
  @Input() canMoveDown: boolean = false;
  
  @Output() viewWallet = new EventEmitter<Wallet>();
  @Output() editWallet = new EventEmitter<Wallet>();
  @Output() deleteWallet = new EventEmitter<Wallet>();
  @Output() makeDefault = new EventEmitter<Wallet>();
  @Output() moveUp = new EventEmitter<Wallet>();
  @Output() moveDown = new EventEmitter<Wallet>();

  // Menu items for the three-dot menu
  menuItems: MenuItem[] = [];

  // Language change subscription
  private languageSubscription?: Subscription;

  // Memoized getters for better performance
  private _walletIconUrl: string | null = null;
  private _goalProgress: WalletGoalProgress | null = null;
  private _walletTypeLabel: string | null = null;

  constructor(
    private walletDisplayService: WalletDisplayService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.initializeMenuItems();
    
    // Subscribe to language changes to update menu items
    this.languageSubscription = this.translate.onLangChange.subscribe(() => {
      this.initializeMenuItems();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['wallet']) {
      this.clearMemoizedValues();
      this.initializeMenuItems();
    }
  }

  ngOnDestroy(): void {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  private initializeMenuItems(): void {
    this.menuItems = [
      {
        label: this.translate.instant('wallet.actions.edit'),
        icon: 'pi pi-pencil',
        command: () => this.onEditWallet()
      },
      {
        label: this.translate.instant('wallet.actions.make_default'),
        icon: 'pi pi-star',
        disabled: this.isWalletDefault(),
        command: () => this.onMakeDefault()
      },
      {
        separator: true
      },
      {
        label: this.translate.instant('wallet.actions.delete'),
        icon: 'pi pi-trash',
        styleClass: 'p-menuitem-danger',
        command: () => this.onDeleteWallet()
      }
    ];
  }

  getWalletIconUrl(): string {
    if (!this._walletIconUrl) {
      this._walletIconUrl = this.walletDisplayService.getWalletIconUrl(this.wallet);
    }
    return this._walletIconUrl;
  }

  getGoalProgress(): WalletGoalProgress {
    if (!this._goalProgress) {
      this._goalProgress = this.walletDisplayService.getGoalProgress(this.wallet);
    }
    return this._goalProgress;
  }

  formatAmount(amount: number | undefined): FormattedAmount {
    return this.walletDisplayService.formatAmount(amount);
  }

  getWalletTypeLabel(): string {
    if (!this._walletTypeLabel) {
      this._walletTypeLabel = this.walletDisplayService.getWalletTypeLabel(this.wallet.type);
    }
    return this._walletTypeLabel;
  }

  isWalletActive(): boolean {
    return this.walletDisplayService.isWalletActive(this.wallet);
  }

  isWalletDefault(): boolean {
    return this.walletDisplayService.isWalletDefault(this.wallet);
  }

  getWalletColor(): string {
    return this.walletDisplayService.getWalletColor(this.wallet);
  }

  getWalletColorVariants(): { primary: string; light: string; dark: string; gradient: string } {
    return this.walletDisplayService.getWalletColorVariants(this.getWalletColor());
  }

  onImageError(event: any): void {
    event.target.src = 'assets/icons/wallet.png';
  }

  // Event handlers
  onViewWallet(): void {
    this.viewWallet.emit(this.wallet);
  }

  onEditWallet(): void {
    this.editWallet.emit(this.wallet);
  }

  onDeleteWallet(): void {
    this.deleteWallet.emit(this.wallet);
  }

  onMakeDefault(): void {
    this.makeDefault.emit(this.wallet);
  }

  onMoveUp(): void {
    this.moveUp.emit(this.wallet);
  }

  onMoveDown(): void {
    this.moveDown.emit(this.wallet);
  }

  // TrackBy function for performance optimization
  trackByWalletId(index: number, wallet: Wallet): string {
    return wallet.id ?? '';
  }

  // Clear memoized values when wallet changes
  private clearMemoizedValues(): void {
    this._walletIconUrl = null;
    this._goalProgress = null;
    this._walletTypeLabel = null;
  }
}
