import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { WalletDto, WalletType } from '@api/models';
import { WalletService } from '@api/services';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastService } from '@shared/services/toast.service';
import { DialogSelectorComponent, DialogOption } from '../dialog-selector/dialog-selector.component';
import { PockitoCurrencyPipe } from '@shared/pipes/pockito-currency.pipe';

@Component({
  selector: 'app-wallet-selector',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    DialogSelectorComponent,
    PockitoCurrencyPipe,
  ],
  templateUrl: './wallet-selector.component.html',
  styleUrl: './wallet-selector.component.scss'
})
export class WalletSelectorComponent implements OnInit, OnChanges {
  @Input() selectedWalletId?: string;
  @Input() isInvalid: boolean = false;
  @Input() placeholder: string = 'transactions.form.walletPlaceholder';
  @Input() showAllWallets: boolean = true;
  @Input() walletType?: WalletType;
  @Output() walletSelected = new EventEmitter<string | null>();
  @Output() walletCleared = new EventEmitter<void>();
  @Output() walletTouched = new EventEmitter<void>();

  wallets: WalletDto[] = [];
  showWalletDialog: boolean = false;
  dialogOptions: DialogOption[] = [];

  constructor(
    private walletService: WalletService,
    private translate: TranslateService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadWallets();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['walletType'] || changes['showAllWallets']) {
      this.loadWallets();
    }
  }

  private loadWallets(): void {
    const loadObservable = this.showAllWallets 
      ? this.walletService.getUserWallets()
      : this.walletService.getWalletsByType(this.walletType!);

    loadObservable.subscribe({
      next: (wallets: WalletDto[]) => {
        this.wallets = wallets;
        this.updateDialogOptions();
      },
      error: (error) => {
        console.error('Error loading wallets:', error);
        this.toastService.showError(
          'wallets.loadingError',
          error.error?.message || 'Error loading wallets'
        );
      },
    });
  }

  getSelectedWallet(): WalletDto | undefined {
    if (!this.selectedWalletId || this.selectedWalletId === 'null') {
      return undefined;
    }
    return this.wallets.find(wallet => wallet.id === this.selectedWalletId);
  }

  openWalletDialog(): void {
    this.showWalletDialog = true;
  }

  closeWalletDialog(): void {
    this.showWalletDialog = false;
  }

  selectWallet(walletId: string): void {
    // Convert 'null' string back to actual null for the form
    const actualValue = walletId === 'null' ? null : walletId;
    this.walletSelected.emit(actualValue);
  }

  onDialogOptionSelected(optionId: string): void {
    this.selectWallet(optionId);
  }

  onDialogClosed(): void {
    this.closeWalletDialog();
    // Emit touched event when dialog closes to trigger validation display
    this.walletTouched.emit();
  }

  private updateDialogOptions(): void {
    // Add "Out of Pockito" option at the beginning
    const outOfPockitoOption: DialogOption = {
      id: null,
      name: this.translate.instant('common.outOfPockito'),
      fallbackIcon: 'pi pi-external-link',
      type: 'OUT_OF_POCKITO',
      typeLabel: this.translate.instant('common.outOfPockito')
    };

    const walletOptions = this.wallets.map(wallet => ({
      id: wallet.id!,
      name: wallet.name,
      iconUrl: wallet.iconUrl,
      fallbackIcon: this.getWalletIcon(wallet.type),
      type: wallet.type,
      typeLabel: this.getWalletTypeLabel(wallet.type),
      currency: wallet.currency,
      balance: wallet.balance
    }));

    this.dialogOptions = [outOfPockitoOption, ...walletOptions];
  }

  getWalletIcon(walletType?: WalletType): string {
    if (!walletType) return 'pi pi-circle';
    
    switch (walletType) {
      case WalletType.BANK_ACCOUNT:
        return 'pi pi-building';
      case WalletType.CASH:
        return 'pi pi-money-bill';
      case WalletType.CREDIT_CARD:
        return 'pi pi-credit-card';
      case WalletType.SAVINGS:
        return 'pi pi-piggy-bank';
      case WalletType.CUSTOM:
        return 'pi pi-wallet';
      default:
        return 'pi pi-circle';
    }
  }

  getWalletTypeLabel(type?: WalletType): string {
    if (!type) return '';
    return this.translate.instant(`enums.walletType.${type}`);
  }

}
