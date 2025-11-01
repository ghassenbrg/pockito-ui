import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Currency, User, Wallet, WalletRequest, WalletType } from '@api/models';
import { UserService } from '@api/services';
import { getCurrencyFlagIcon, getCurrencySymbol } from '@core/utils/currency-country.mapping';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DialogOption } from '@shared/components/dialog-selector/dialog-selector.component';
import {
  PockitoButtonComponent,
  PockitoButtonSize,
  PockitoButtonType,
} from '@shared/components/pockito-button/pockito-button.component';
import { PockitoSelectorComponent } from '@shared/components/pockito-selector/pockito-selector.component';
import { ToastService } from '@shared/services/toast.service';
import { WalletStateService } from '../../../state/wallet/wallet-state.service';
import { LoadingService } from '@shared/services/loading.service';
import { filter, take } from 'rxjs/operators';
import { PockitoToggleComponent } from '@shared/components/pockito-toggle/pockito-toggle.component';

// PrimeNG imports
import { ColorPickerModule } from 'primeng/colorpicker';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-wallet-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    PockitoButtonComponent,
    PockitoSelectorComponent,
    PockitoToggleComponent,
    TranslateModule,
    // PrimeNG modules
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    ColorPickerModule,
  ],
  templateUrl: './wallet-form.component.html',
  styleUrl: './wallet-form.component.scss',
})
export class WalletFormComponent implements OnInit {
  @Input() walletId?: string;
  @Output() walletSaved = new EventEmitter<Wallet>();
  @Output() formCancelled = new EventEmitter<void>();

  walletForm: FormGroup;
  currentUser: User | null = null;
  isEditMode: boolean = false;
  isLoading: boolean = false;

  // Available options for dropdowns
  currencies = Object.values(Currency);
  walletTypes = Object.values(WalletType);

  // PrimeNG dropdown options
  currencyOptions: any[] = [];
  walletTypeOptions: any[] = [];

  // Dialog options for selectors
  currencyDialogOptions: DialogOption[] = [];
  walletTypeDialogOptions: DialogOption[] = [];

  // Button types and sizes for template
  PockitoButtonType = PockitoButtonType;
  PockitoButtonSize = PockitoButtonSize;

  constructor(
    private fb: FormBuilder,
    private walletState: WalletStateService,
    private userService: UserService,
    private translate: TranslateService,
    private toastService: ToastService,
    private loadingService: LoadingService
  ) {
    this.walletForm = this.createForm();
  }

  ngOnInit(): void {
    this.isEditMode = !!this.walletId;
    if (this.isEditMode) {
      this.walletForm.get('currency')?.disable();
    }

    this.initializeDropdownOptions();

    this.userService.currentUser$.subscribe((user: User | null) => {
      if (user) {
        this.currentUser = user;
        if (!this.isEditMode) {
          this.walletForm.patchValue({
            currency: user.defaultCurrency ?? undefined,
          });
        }
      }
    });

    if (this.isEditMode && this.walletId) {
      this.loadWallet(this.walletId);
    }
  }

  private createForm(): FormGroup {
    const form = this.fb.group({
      name: [
        null,
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(100),
        ],
      ],
      currency: [undefined, Validators.required],
      type: [undefined, Validators.required],
      initialBalance: [0, [Validators.min(0)]],
      description: [undefined, Validators.maxLength(500)],
      color: ['#1d4ed8'],
      iconUrl: [
        undefined,
        [
          Validators.pattern(
            /^https?:\/\/.+\.(jpg|jpeg|png|gif|svg|webp)(\?.*)?$/i
          ),
        ],
      ],
      isDefault: [false],
    });

    return form;
  }

  private loadWallet(walletId: string): void {
    const loadingId = this.loadingService.show(this.translate.instant('common.loading'));
    this.walletState.loadWallet(walletId);
    this.walletState.currentWallet$
      .pipe(
        filter((wallet): wallet is Wallet => !!wallet && wallet.id === walletId),
        take(1)
      )
      .subscribe({
        next: (wallet) => {
          this.patchWalletForm(wallet);
          this.loadingService.hide(loadingId);
        },
        error: (error) => {
          console.error('Error loading wallet:', error);
          this.toastService.showError('wallets.loadingWalletError', 'common.loadingErrorMessage');
          this.loadingService.hide(loadingId);
        },
      });
  }

  private patchWalletForm(wallet: Wallet): void {
    this.walletForm.patchValue({
      name: wallet.name,
      currency: wallet.currency,
      type: wallet.type,
      initialBalance: wallet.initialBalance,
      description: wallet.description || '',
      color: wallet.color || '#1d4ed8',
      iconUrl: wallet.iconUrl || '',
      isDefault: wallet.isDefault,
    });
  }

  onSubmit(): void {
    if (this.walletForm.valid) {
      const formValue = this.walletForm.value;
      const walletData: WalletRequest = {
        name: formValue.name,
        currency: formValue.currency,
        type: formValue.type,
        initialBalance: formValue.initialBalance,
        description: formValue.description,
        color: formValue.color,
        iconUrl: formValue.iconUrl || '',
        isDefault: formValue.isDefault,
        goalAmount: 0,
      };

      if (this.isEditMode && this.walletId) {
        this.updateWallet(this.walletId, walletData);
      } else {
        this.createWallet(walletData);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private createWallet(walletData: WalletRequest): void {
    const loadingId = this.loadingService.show(this.translate.instant('common.loading'));
    
    this.walletState.createWallet(walletData).subscribe({
      next: (created) => {
        this.loadingService.hide(loadingId);
        this.walletSaved.emit(created);
        this.toastService.showSuccess(
          'wallets.createWalletSuccess',
          'wallets.createWalletSuccessMessage',
          { name: created.name }
        );
      },
      error: () => {
        this.loadingService.hide(loadingId);
        this.toastService.showError('wallets.createWalletError', 'wallets.createWalletErrorMessage');
      }
    });
  }

  private updateWallet(walletId: string, walletData: WalletRequest): void {
    const loadingId = this.loadingService.show(this.translate.instant('common.loading'));
    
    this.walletState.updateWallet(walletId, walletData).subscribe({
      next: (updated) => {
        this.loadingService.hide(loadingId);
        this.walletSaved.emit(updated);
        this.toastService.showSuccess(
          'wallets.updateWalletSuccess',
          'wallets.updateWalletSuccessMessage',
          { name: updated.name }
        );
      },
      error: () => {
        this.loadingService.hide(loadingId);
        this.toastService.showError('wallets.updateWalletError', 'wallets.updateWalletErrorMessage');
      }
    });
  }

  onCancel(): void {
    this.formCancelled.emit();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.walletForm.controls).forEach((key) => {
      const control = this.walletForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const control = this.walletForm.get(fieldName);
    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        return this.translate.instant(
          `wallets.form.errors.${fieldName}Required`
        );
      }
      if (control.errors['minlength']) {
        return this.translate.instant(
          `wallets.form.errors.${fieldName}MinLength`
        );
      }
      if (control.errors['maxlength']) {
        return this.translate.instant(
          `wallets.form.errors.${fieldName}MaxLength`
        );
      }
      if (control.errors['min']) {
        return this.translate.instant(`wallets.form.errors.${fieldName}Min`);
      }
      if (control.errors['pattern']) {
        if (fieldName === 'iconUrl') {
          return this.translate.instant('wallets.form.errors.iconUrlPattern');
        }
        return this.translate.instant(
          `wallets.form.errors.${fieldName}Pattern`
        );
      }
    }
    return '';
  }

  getWalletTypeLabel(type: WalletType): string {
    return this.translate.instant(`enums.walletType.${type}`);
  }

  getCurrencyLabel(currency: Currency): string {
    const label = this.translate.instant(`enums.currency.${currency}`);
    const symbol = getCurrencySymbol(currency);
    return `${label} (${symbol})`;
  }

  getIconUrl(): string {
    return this.walletForm.get('iconUrl')?.value || '';
  }

  isValidImageUrl(url: string): boolean {
    if (!url) return false;
    const pattern = /^https?:\/\/.+\.(jpg|jpeg|png|gif|svg|webp)(\?.*)?$/i;
    return pattern.test(url);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    console.warn('Failed to load image:', this.getIconUrl());
  }

  onWalletTypeIconError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    console.warn('Failed to load wallet type icon:', img.src);
  }

  // Currency selector event handlers
  onCurrencySelected(currency: string | null): void {
    this.walletForm.patchValue({ currency: currency || undefined });
    this.walletForm.get('currency')?.markAsTouched();
  }

  onCurrencyCleared(): void {
    this.walletForm.patchValue({ currency: undefined });
    this.walletForm.get('currency')?.markAsTouched();
  }

  onCurrencyTouched(): void {
    this.walletForm.get('currency')?.markAsTouched();
  }

  // Wallet type selector event handlers
  onWalletTypeSelected(walletType: string | null): void {
    this.walletForm.patchValue({ type: walletType || undefined });
    this.walletForm.get('type')?.markAsTouched();
  }

  onWalletTypeCleared(): void {
    this.walletForm.patchValue({ type: undefined });
    this.walletForm.get('type')?.markAsTouched();
  }

  onWalletTypeTouched(): void {
    this.walletForm.get('type')?.markAsTouched();
  }

  // Helper methods for template
  getSelectedCurrency(currency?: string): DialogOption | undefined {
    if (!currency) return undefined;
    return this.currencyDialogOptions.find((option) => option.id === currency);
  }

  getSelectedWalletType(walletType?: string): DialogOption | undefined {
    if (!walletType) return undefined;
    return this.walletTypeDialogOptions.find(
      (option) => option.id === walletType
    );
  }

  private initializeDropdownOptions(): void {
    // Initialize currency options for PrimeNG dropdown (keeping for compatibility)
    this.currencyOptions = this.currencies.map((currency) => ({
      label: this.getCurrencyLabel(currency),
      value: currency,
    }));

    // Initialize wallet type options for PrimeNG dropdown (keeping for compatibility)
    this.walletTypeOptions = this.walletTypes.map((type) => ({
      label: this.getWalletTypeLabel(type),
      value: type,
      icon: `/assets/icons/${type}.png`,
    }));

    // Initialize dialog options for pockito selectors
    this.currencyDialogOptions = this.currencies.map((currency) => ({
      id: currency,
      name: this.getCurrencyLabel(currency),
      iconUrl: getCurrencyFlagIcon(currency) || 'pi pi-money-bill',
      type: 'CURRENCY',
      typeLabel: this.translate.instant('common.currency'),
    }));

    this.walletTypeDialogOptions = this.walletTypes.map((type) => ({
      id: type,
      name: this.getWalletTypeLabel(type),
      iconUrl: `/assets/icons/${type}.png`,
      fallbackIcon: 'pi pi-circle',
      type: 'WALLET_TYPE',
      typeLabel: this.translate.instant('common.walletType'),
    }));
  }
}
