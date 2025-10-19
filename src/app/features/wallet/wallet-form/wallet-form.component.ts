import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Currency, UserDto, WalletDto, WalletType } from '@api/models';
import { UserService, WalletService } from '@api/services';
import { PockitoButtonComponent, PockitoButtonType, PockitoButtonSize } from '@shared/components/pockito-button/pockito-button.component';

@Component({
  selector: 'app-wallet-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, PockitoButtonComponent],
  templateUrl: './wallet-form.component.html',
  styleUrl: './wallet-form.component.scss',
})
export class WalletFormComponent implements OnInit {
  @Input() walletId: string | null = null;
  @Output() walletSaved = new EventEmitter<WalletDto>();
  @Output() formCancelled = new EventEmitter<void>();

  walletForm: FormGroup;
  currentUser: UserDto | null = null;
  isEditMode: boolean = false;
  isLoading: boolean = false;

  // Available options for dropdowns
  currencies = Object.values(Currency);
  walletTypes = Object.values(WalletType);

  // Button types and sizes for template
  PockitoButtonType = PockitoButtonType;
  PockitoButtonSize = PockitoButtonSize;

  constructor(
    private fb: FormBuilder,
    private walletService: WalletService,
    private userService: UserService
  ) {
    this.walletForm = this.createForm();
  }

  ngOnInit(): void {
    this.isEditMode = !!this.walletId;
    
    this.userService.currentUser$.subscribe((user: UserDto | null) => {
      if (user) {
        this.currentUser = user;
        if (!this.isEditMode) {
          this.walletForm.patchValue({
            currency: user.defaultCurrency ?? Currency.USD
          });
        }
      }
    });

    if (this.isEditMode && this.walletId) {
      this.loadWallet(this.walletId);
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(100)]],
      currency: ['', Validators.required],
      type: ['', Validators.required],
      initialBalance: [0, [Validators.min(0)]],
      description: ['', Validators.maxLength(500)],
      color: ['#1d4ed8'],
      iconUrl: ['', [Validators.pattern(/^https?:\/\/.+\.(jpg|jpeg|png|gif|svg|webp)(\?.*)?$/i)]],
      isDefault: [false]
    });
  }

  private loadWallet(walletId: string): void {
    this.isLoading = true;
    this.walletService.getWallet(walletId).subscribe({
      next: (wallet: WalletDto) => {
        this.walletForm.patchValue({
          name: wallet.name,
          currency: wallet.currency,
          type: wallet.type,
          initialBalance: wallet.initialBalance,
          description: wallet.description || '',
          color: wallet.color || '#1d4ed8',
          iconUrl: wallet.iconUrl || '',
          isDefault: wallet.isDefault
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading wallet:', error);
        this.isLoading = false;
      }
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
        goalAmount: 0
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
      },
      error: (error) => {
        console.error('Error creating wallet:', error);
        this.isLoading = false;
      }
    });
  }

  private updateWallet(walletData: WalletDto): void {
    this.isLoading = true;
    this.walletService.updateWallet(walletData.id!, walletData).subscribe({
      next: (updatedWallet: WalletDto) => {
        this.walletSaved.emit(updatedWallet);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error updating wallet:', error);
        this.isLoading = false;
      }
    });
  }

  onCancel(): void {
    this.formCancelled.emit();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.walletForm.controls).forEach(key => {
      const control = this.walletForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const control = this.walletForm.get(fieldName);
    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        return `${fieldName} is required`;
      }
      if (control.errors['minlength']) {
        return `${fieldName} must be at least ${control.errors['minlength'].requiredLength} characters`;
      }
      if (control.errors['maxlength']) {
        return `${fieldName} must not exceed ${control.errors['maxlength'].requiredLength} characters`;
      }
      if (control.errors['min']) {
        return `${fieldName} must be at least ${control.errors['min'].min}`;
      }
      if (control.errors['pattern']) {
        if (fieldName === 'iconUrl') {
          return 'Please enter a valid image URL (jpg, jpeg, png, gif, svg, webp)';
        }
        return `${fieldName} format is invalid`;
      }
    }
    return '';
  }

  getWalletTypeLabel(type: WalletType): string {
    switch (type) {
      case WalletType.BANK_ACCOUNT:
        return 'Bank Account';
      case WalletType.CASH:
        return 'Cash';
      case WalletType.CREDIT_CARD:
        return 'Credit Card';
      case WalletType.SAVINGS:
        return 'Savings';
      case WalletType.CUSTOM:
        return 'Custom';
      default:
        return type;
    }
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
}
