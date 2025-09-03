import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WalletType, Currency, WalletTypeOption, CurrencyOption, WalletFormData } from '../models/wallet.types';
import { Wallet } from '@api/model/wallet.model';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WalletFormService {
  private walletTypesSubject = new BehaviorSubject<WalletTypeOption[]>([]);
  private currenciesSubject = new BehaviorSubject<CurrencyOption[]>([]);
  
  walletTypes$ = this.walletTypesSubject.asObservable();
  currencies$ = this.currenciesSubject.asObservable();

  constructor(
    private fb: FormBuilder,
    private translateService: TranslateService
  ) {
    this.initializeOptions();
    this.subscribeToLanguageChanges();
  }

  private initializeOptions(): void {
    this.loadTranslations();
  }

  private subscribeToLanguageChanges(): void {
    // Subscribe to language changes to reload translations
    this.translateService.onLangChange.subscribe(() => {
      this.loadTranslations();
    });
  }

  private loadTranslations(): void {
    // Load wallet type translations
    const walletTypeKeys = [
      { key: 'editWallet.walletTypes.BANK_ACCOUNT', value: WalletType.BANK_ACCOUNT },
      { key: 'editWallet.walletTypes.CASH', value: WalletType.CASH },
      { key: 'editWallet.walletTypes.CREDIT_CARD', value: WalletType.CREDIT_CARD },
      { key: 'editWallet.walletTypes.SAVINGS', value: WalletType.SAVINGS },
      { key: 'editWallet.walletTypes.CUSTOM', value: WalletType.CUSTOM }
    ];

    const walletTypes: WalletTypeOption[] = [];
    walletTypeKeys.forEach(({ key, value }) => {
      this.translateService.get(key).subscribe(label => {
        const existingIndex = walletTypes.findIndex(t => t.value === value);
        if (existingIndex >= 0) {
          walletTypes[existingIndex].label = label;
        } else {
          walletTypes.push({ label, value });
        }
        
        // Update the subject when all translations are loaded
        if (walletTypes.length === walletTypeKeys.length) {
          this.walletTypesSubject.next([...walletTypes]);
        }
      });
    });

    // Load currency translations
    const currencyKeys = [
      { key: 'editWallet.currencies.TND', value: Currency.TND },
      { key: 'editWallet.currencies.EUR', value: Currency.EUR },
      { key: 'editWallet.currencies.USD', value: Currency.USD },
      { key: 'editWallet.currencies.JPY', value: Currency.JPY }
    ];

    const currencies: CurrencyOption[] = [];
    currencyKeys.forEach(({ key, value }) => {
      this.translateService.get(key).subscribe(label => {
        const existingIndex = currencies.findIndex(c => c.value === value);
        if (existingIndex >= 0) {
          currencies[existingIndex].label = label;
        } else {
          currencies.push({ label, value });
        }
        
        // Update the subject when all translations are loaded
        if (currencies.length === currencyKeys.length) {
          this.currenciesSubject.next([...currencies]);
        }
      });
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      initialBalance: [0, [Validators.required]],
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
      goalAmount: formValue.goalAmount !== null && formValue.goalAmount !== undefined ? formValue.goalAmount : undefined,
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
        return this.translateService.instant('form.errors.fieldRequired');
      }
      if (field.errors['minlength']) {
        return this.translateService.instant('form.errors.minLength', { min: field.errors['minlength'].requiredLength });
      }
      if (field.errors['maxlength']) {
        return this.translateService.instant('form.errors.maxLength', { max: field.errors['maxlength'].requiredLength });
      }
      if (field.errors['min']) {
        return this.translateService.instant('form.errors.minValue', { min: field.errors['min'].min });
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
