import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription, Wallet, WalletType } from '@api/models';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { PockitoDialogComponent } from '@shared/components/pockito-dialog/pockito-dialog.component';
import { PockitoSelectorComponent } from '@shared/components/pockito-selector/pockito-selector.component';
import { PockitoButtonComponent, PockitoButtonType, PockitoButtonSize } from '@shared/components/pockito-button/pockito-button.component';
import { PockitoCurrencyPipe } from '@shared/pipes/pockito-currency.pipe';
import { DialogOption } from '@shared/components/dialog-selector/dialog-selector.component';
import { InputNumberModule } from 'primeng/inputnumber';
import { SubscriptionStateService } from '../../state/subscription/subscription-state.service';
import { WalletStateService } from '../../state/wallet/wallet-state.service';
import { ToastService } from '@shared/services/toast.service';
import { LoadingService } from '@shared/services/loading.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-pay-subscription-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslatePipe,
    PockitoDialogComponent,
    PockitoSelectorComponent,
    PockitoButtonComponent,
    PockitoCurrencyPipe,
    InputNumberModule,
  ],
  templateUrl: './pay-subscription-dialog.component.html',
  styleUrl: './pay-subscription-dialog.component.scss'
})
export class PaySubscriptionDialogComponent implements OnInit, OnDestroy, OnChanges {
  @Input() visible: boolean = false;
  @Input() subscription?: Subscription;
  
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() paymentCompleted = new EventEmitter<void>();

  payForm: FormGroup;
  wallets: Wallet[] = [];
  walletOptions: DialogOption[] = [];
  
  PockitoButtonType = PockitoButtonType;
  PockitoButtonSize = PockitoButtonSize;
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private subscriptionState: SubscriptionStateService,
    private walletState: WalletStateService,
    private toastService: ToastService,
    private translate: TranslateService,
    private loadingService: LoadingService
  ) {
    this.payForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadWallets();
    this.bindLoading();
    this.payForm.valueChanges.subscribe(() => this.updateExchangeRateLogic());
  }

  ngOnChanges(changes: SimpleChanges): void {
    // When subscription changes and wallets are loaded, update default wallet
    if (changes['subscription'] && this.wallets.length > 0) {
      this.setDefaultWallet();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.loadingService.hideAll();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      walletId: [null, Validators.required],
      exchangeRate: [1, [Validators.required, Validators.min(0.0001)]]
    });
  }

  private loadWallets(): void {
    this.walletState.wallets$
      .pipe(takeUntil(this.destroy$))
      .subscribe((wallets) => {
        if (wallets) {
          this.wallets = wallets;
          this.updateWalletOptions();
          // Set default wallet: subscription default first, then global default
          this.setDefaultWallet();
        }
      });
    
    this.walletState.loadWallets();
  }

  private setDefaultWallet(): void {
    // Don't override if wallet is already selected
    if (this.payForm.get('walletId')?.value) {
      return;
    }

    let defaultWallet: Wallet | undefined;

    // First priority: subscription's default wallet
    if (this.subscription?.defaultWalletId) {
      defaultWallet = this.wallets.find(w => w.id === this.subscription?.defaultWalletId);
    }

    // Fallback: global default wallet
    if (!defaultWallet) {
      defaultWallet = this.wallets.find(w => w.isDefault);
    }

    // Set the wallet if found
    if (defaultWallet) {
      this.payForm.patchValue({ walletId: defaultWallet.id });
    }
  }

  private updateWalletOptions(): void {
    this.walletOptions = this.wallets.map(wallet => ({
      id: wallet.id!,
      name: wallet.name,
      iconUrl: wallet.iconUrl || this.getWalletIcon(wallet.type),
      type: wallet.type,
      typeLabel: this.getWalletTypeLabel(wallet.type),
      currency: wallet.currency,
      balance: wallet.balance
    }));
  }

  private updateExchangeRateLogic(): void {
    const walletId = this.payForm.get('walletId')?.value;
    const subscription = this.subscription;

    if (!walletId || !subscription) {
      this.payForm.patchValue({ exchangeRate: 1 }, { emitEvent: false });
      return;
    }

    const wallet = this.wallets.find(w => w.id === walletId);
    if (!wallet) {
      this.payForm.patchValue({ exchangeRate: 1 }, { emitEvent: false });
      return;
    }

    if (wallet.currency === subscription.currency) {
      // Same currency - set exchange rate to 1
      this.payForm.patchValue({ exchangeRate: 1 }, { emitEvent: false });
    }
  }

  shouldShowExchangeRateField(): boolean {
    const walletId = this.payForm.get('walletId')?.value;
    const subscription = this.subscription;

    if (!walletId || !subscription) {
      return false;
    }

    const wallet = this.wallets.find(w => w.id === walletId);
    if (!wallet) {
      return false;
    }

    return wallet.currency !== subscription.currency;
  }

  getSelectedWallet(walletId?: string): Wallet | undefined {
    if (!walletId) {
      return undefined;
    }
    const wallet = this.wallets.find(w => w.id === walletId);
    if (wallet) {
      wallet.iconUrl = wallet.iconUrl || this.getWalletIcon(wallet.type);
    }
    return wallet;
  }

  getWalletCurrency(walletId?: string): string {
    if (!walletId) {
      return '';
    }
    const wallet = this.wallets.find(w => w.id === walletId);
    return wallet?.currency || '';
  }

  getWalletIcon(walletType?: WalletType): string {
    if (!walletType) return 'pi pi-circle';
    
    switch (walletType) {
      case WalletType.BANK_ACCOUNT:
        return `/assets/icons/${walletType}.png`;
      case WalletType.CASH:
        return `/assets/icons/${walletType}.png`;
      case WalletType.CREDIT_CARD:
        return `/assets/icons/${walletType}.png`;
      case WalletType.SAVINGS:
        return `/assets/icons/${walletType}.png`;
      case WalletType.CUSTOM:
        return `/assets/icons/${walletType}.png`;
      default:
        return `/assets/icons/CUSTOM.png`;
    }
  }

  getWalletTypeLabel(type?: WalletType): string {
    if (!type) return '';
    return this.translate.instant(`enums.walletType.${type}`);
  }

  getFieldError(fieldName: string): string {
    const control = this.payForm.get(fieldName);
    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        return this.translate.instant('common.fieldRequired');
      }
      if (control.errors['min']) {
        return this.translate.instant('common.valueTooSmall');
      }
    }
    return '';
  }

  onWalletSelected(walletId: string | null): void {
    this.payForm.patchValue({ walletId });
    this.payForm.get('walletId')?.markAsTouched();
    this.updateExchangeRateLogic();
  }

  onWalletCleared(): void {
    this.payForm.patchValue({ walletId: null });
  }

  onWalletTouched(): void {
    this.payForm.get('walletId')?.markAsTouched();
  }

  onDialogVisibleChange(visible: boolean): void {
    this.visibleChange.emit(visible);
    if (!visible) {
      this.payForm.reset({ walletId: null, exchangeRate: 1 });
    } else {
      // When dialog opens, set the default wallet
      this.setDefaultWallet();
    }
  }

  onConfirm(): void {
    if (this.payForm.invalid || !this.subscription) {
      this.payForm.markAllAsTouched();
      return;
    }

    const formValue = this.payForm.value;
    const request = {
      walletId: formValue.walletId,
      exchangeRate: this.shouldShowExchangeRateField() ? formValue.exchangeRate : undefined
    };

    this.subscriptionState.paySubscription(this.subscription.id, request).subscribe({
      next: () => {
        this.toastService.showSuccess(
          'subscriptions.pay.success',
          'subscriptions.pay.successMessage'
        );
        this.paymentCompleted.emit();
        this.closeDialog();
      },
      error: () => {
        this.toastService.showError('subscriptions.pay.error', 'subscriptions.pay.errorMessage');
      }
    });
  }

  onCancel(): void {
    this.closeDialog();
  }

  private closeDialog(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  private bindLoading(): void {
    const LOADING_ID = 'pay-subscription-dialog';
    
    this.subscriptionState.isLoading$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isLoading) => {
        if (isLoading) {
          this.loadingService.showWithId(LOADING_ID, this.translate.instant('common.loading'));
        } else {
          this.loadingService.hide(LOADING_ID);
        }
      });
  }
}
