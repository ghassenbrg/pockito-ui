import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WalletType, Currency, WalletTypeOption, CurrencyOption, WalletFormData } from '../models/wallet.types';
import { Wallet } from '../../../api/model/wallet.model';

@Injectable({
  providedIn: 'root'
})
export class WalletFormService {
  readonly walletTypes: WalletTypeOption[] = [
    { label: 'Bank Account', value: WalletType.BANK_ACCOUNT },
    { label: 'Cash', value: WalletType.CASH },
    { label: 'Credit Card', value: WalletType.CREDIT_CARD },
    { label: 'Savings', value: WalletType.SAVINGS },
    { label: 'Custom', value: WalletType.CUSTOM }
  ];

  readonly currencies: CurrencyOption[] = [
    { label: 'TND (Tunisian Dinar)', value: Currency.TND },
    { label: 'EUR (Euro)', value: Currency.EUR },
    { label: 'USD (US Dollar)', value: Currency.USD },
    { label: 'JPY (Japanese Yen)', value: Currency.JPY }
  ];

  constructor(private fb: FormBuilder) {}

  createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      initialBalance: [0, [Validators.required, Validators.min(0)]],
      balance: [0, [Validators.required]],
      currency: [Currency.TND, [Validators.required]],
      type: [WalletType.BANK_ACCOUNT, [Validators.required]],
      goalAmount: [0, [Validators.min(0)]],
      isDefault: [false],
      active: [true],
      iconUrl: [''],
      description: ['', [Validators.maxLength(200)]],
      color: ['#3b82f6']
    });
  }

  populateForm(form: FormGroup, wallet: Wallet): void {
    form.patchValue({
      name: wallet.name,
      initialBalance: wallet.initialBalance,
      balance: wallet.balance,
      currency: wallet.currency,
      type: wallet.type,
      goalAmount: wallet.goalAmount || 0,
      isDefault: wallet.isDefault,
      active: wallet.active,
      iconUrl: wallet.iconUrl || '',
      description: wallet.description || '',
      color: wallet.color || '#3b82f6'
    });
  }

  setDefaultValues(form: FormGroup): void {
    form.patchValue({
      name: '',
      initialBalance: 0,
      balance: 0,
      currency: Currency.TND,
      type: WalletType.BANK_ACCOUNT,
      goalAmount: 0,
      isDefault: false,
      active: true,
      iconUrl: '',
      description: '',
      color: '#3b82f6'
    });
  }

  getFormData(form: FormGroup): WalletFormData {
    const formValue = form.value;
    return {
      name: formValue.name,
      initialBalance: formValue.initialBalance,
      balance: formValue.balance,
      currency: formValue.currency,
      type: formValue.type,
      goalAmount: formValue.goalAmount > 0 ? formValue.goalAmount : undefined,
      isDefault: formValue.isDefault,
      active: formValue.active,
      iconUrl: formValue.iconUrl || undefined,
      description: formValue.description || undefined,
      color: formValue.color || '#3b82f6'
    };
  }

  getFieldError(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (field && field.touched && field.errors) {
      if (field.errors['required']) {
        return 'This field is required';
      }
      if (field.errors['minlength']) {
        return `Minimum length is ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['maxlength']) {
        return `Maximum length is ${field.errors['maxlength'].requiredLength} characters`;
      }
      if (field.errors['min']) {
        return `Minimum value is ${field.errors['min'].min}`;
      }
    }
    return '';
  }

  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  markFormGroupTouched(form: FormGroup): void {
    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);
      control?.markAsTouched();
    });
  }

  calculateGoalProgress(goalAmount: number, balance: number): number {
    if (!goalAmount || !balance || goalAmount <= 0) {
      return 0;
    }
    
    const progress = (balance / goalAmount) * 100;
    return Math.min(Math.round(progress), 100);
  }
}
