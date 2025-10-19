import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Currency, UserDto, WalletDto, WalletType } from '@api/models';
import { UserService, WalletService } from '@api/services';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  PockitoButtonComponent,
  PockitoButtonSize,
  PockitoButtonType,
} from '@shared/components/pockito-button/pockito-button.component';
import { ToastService } from '@shared/services/toast.service';

// PrimeNG imports
import { CheckboxModule } from 'primeng/checkbox';
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
    TranslateModule,
    // PrimeNG modules
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    ColorPickerModule,
    CheckboxModule,
  ],
  templateUrl: './wallet-form.component.html',
  styleUrl: './wallet-form.component.scss',
})
export class WalletFormComponent implements OnInit {
  @Input() walletId?: string;
  @Output() walletSaved = new EventEmitter<WalletDto>();
  @Output() formCancelled = new EventEmitter<void>();

  walletForm: FormGroup;
  currentUser: UserDto | null = null;
  isEditMode: boolean = false;
  isLoading: boolean = false;

  // Available options for dropdowns
  currencies = Object.values(Currency);
  walletTypes = Object.values(WalletType);

  // PrimeNG dropdown options
  currencyOptions: any[] = [];
  walletTypeOptions: any[] = [];

  // Button types and sizes for template
  PockitoButtonType = PockitoButtonType;
  PockitoButtonSize = PockitoButtonSize;

  constructor(
    private fb: FormBuilder,
    private walletService: WalletService,
    private userService: UserService,
    private translate: TranslateService,
    private toastService: ToastService
  ) {
    this.walletForm = this.createForm();
  }

  ngOnInit(): void {
    this.isEditMode = !!this.walletId;
    if (this.isEditMode) {
      this.walletForm.get('currency')?.disable();
    }

    this.initializeDropdownOptions();

    this.userService.currentUser$.subscribe((user: UserDto | null) => {
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
    this.isLoading = true;
    this.walletService.getWallet(walletId).subscribe({
      next: (wallet: WalletDto) => {
        this.patchWalletForm(wallet);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading wallet:', error);
        this.toastService.showError(
          'wallets.loadingWalletError',
          error.error.message
        );
        this.isLoading = false;
      },
    });
  }

  private patchWalletForm(wallet: WalletDto): void {
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
      const walletData: WalletDto = {
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
        walletData.id = this.walletId;
        this.updateWallet(walletData);
      } else {
        this.createWallet(walletData);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private createWallet(walletData: WalletDto): void {
    this.isLoading = true;
    this.walletService.createWallet(walletData).subscribe({
      next: (createdWallet: WalletDto) => {
        this.walletSaved.emit(createdWallet);
        this.isLoading = false;
        this.toastService.showSuccess(
          'wallets.createWalletSuccess',
          'wallets.createWalletSuccessMessage',
          { name: walletData.name }
        );
      },
      error: (error) => {
        console.error('Error creating wallet:', error);
        this.isLoading = false;
        this.toastService.showError(
          'wallets.createWalletError',
          error.error.message
        );
      },
    });
  }

  private updateWallet(walletData: WalletDto): void {
    this.isLoading = true;
    this.walletService.updateWallet(walletData.id!, walletData).subscribe({
      next: (updatedWallet: WalletDto) => {
        this.walletSaved.emit(updatedWallet);
        this.isLoading = false;
        this.toastService.showSuccess(
          'wallets.updateWalletSuccess',
          'wallets.updateWalletSuccessMessage',
          { name: updatedWallet.name }
        );
      },
      error: (error) => {
        console.error('Error updating wallet:', error);
        this.isLoading = false;
        this.toastService.showError(
          'wallets.updateWalletError',
          error.error.message
        );
      },
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
    return this.translate.instant(`enums.currency.${currency}`);
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

  private initializeDropdownOptions(): void {
    // Initialize currency options
    this.currencyOptions = this.currencies.map((currency) => ({
      label: this.getCurrencyLabel(currency),
      value: currency,
    }));

    // Initialize wallet type options
    this.walletTypeOptions = this.walletTypes.map((type) => ({
      label: this.getWalletTypeLabel(type),
      value: type,
    }));
  }
}
