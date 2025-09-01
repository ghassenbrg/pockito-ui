import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { Wallet } from '../../../api/model/wallet.model';
import { WalletService } from '../../../api/services/wallet.service';

@Component({
  selector: 'app-edit-wallet',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    CheckboxModule,
    TooltipModule,
    TranslateModule
  ],
  templateUrl: './edit-wallet.component.html',
  styleUrl: './edit-wallet.component.scss',
})
export class EditWalletComponent implements OnInit, OnDestroy {
  editWalletForm!: FormGroup;
  wallet: Wallet | null = null;
  isEditMode: boolean = false;
  isLoading: boolean = false;
  private routeSubscription: Subscription = new Subscription();

  // Icon preview properties
  iconPreviewLoaded: boolean = false;
  iconPreviewError: boolean = false;

  // Available wallet types
  walletTypes = [
    { label: 'Bank Account', value: 'BANK_ACCOUNT' },
    { label: 'Cash', value: 'CASH' },
    { label: 'Credit Card', value: 'CREDIT_CARD' },
    { label: 'Savings', value: 'SAVINGS' },
    { label: 'Custom', value: 'CUSTOM' }
  ];

  // Available currencies
  currencies = [
    { label: 'TND (Tunisian Dinar)', value: 'TND' },
    { label: 'EUR (Euro)', value: 'EUR' },
    { label: 'USD (US Dollar)', value: 'USD' },
    { label: 'JPY (Japanese Yen)', value: 'JPY' }
  ];

  constructor(
    private fb: FormBuilder,
    private walletService: WalletService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadWallet();
  }

  ngOnDestroy(): void {
    this.routeSubscription.unsubscribe();
  }

  private initializeForm(): void {
    this.editWalletForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      initialBalance: [0, [Validators.required, Validators.min(0)]],
      balance: [0, [Validators.required]],
      currency: ['TND', [Validators.required]],
      type: ['BANK_ACCOUNT', [Validators.required]],
      goalAmount: [0, [Validators.min(0)]],
      isDefault: [false],
      active: [true],
      iconUrl: [''],
      description: ['', [Validators.maxLength(200)]],
      color: ['#3b82f6']
    });
  }

  private loadWallet(): void {
    this.routeSubscription = this.route.params.subscribe(params => {
      const walletId = params['id'];
      if (walletId && walletId !== 'new') {
        this.isEditMode = true;
        this.loadExistingWallet(walletId);
      } else {
        this.isEditMode = false;
        this.setDefaultValues();
      }
    });
  }

  private loadExistingWallet(walletId: string): void {
    this.isLoading = true;
    this.walletService.getWalletById(walletId).subscribe(wallet => {
      this.wallet = wallet || null;
      if (this.wallet) {
        this.populateForm(this.wallet);
      }
      this.isLoading = false;
    });
  }

  private setDefaultValues(): void {
    this.editWalletForm.patchValue({
      name: '',
      initialBalance: 0,
      balance: 0,
      currency: 'TND',
      type: 'BANK_ACCOUNT',
      goalAmount: 0,
      isDefault: false,
      active: true,
      iconUrl: '',
      description: '',
      color: '#3b82f6'
    });
  }

  private populateForm(wallet: Wallet): void {
    this.editWalletForm.patchValue({
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

  onSubmit(): void {
    if (this.editWalletForm.valid) {
      this.isLoading = true;
      const formValue = this.editWalletForm.value;
      
      const walletData: Partial<Wallet> = {
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

      if (this.isEditMode && this.wallet) {
        // Update existing wallet
        this.updateWallet(walletData);
      } else {
        // Create new wallet
        this.createWallet(walletData);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private updateWallet(walletData: Partial<Wallet>): void {
    if (this.wallet) {
      const updatedWallet: Wallet = {
        ...this.wallet,
        ...walletData
      };
      
      const success = this.walletService.updateWallet(updatedWallet);
      if (success) {
        this.isLoading = false;
        this.router.navigate(['/app/wallets']);
      } else {
        this.isLoading = false;
        // In a real app, you'd show an error message
        console.error('Failed to update wallet');
      }
    }
  }

  private createWallet(walletData: Partial<Wallet>): void {
    const walletToCreate = {
      name: walletData.name!,
      initialBalance: 0, // Default value, will be calculated from transactions
      balance: 0, // Default value, will be calculated from transactions
      currency: walletData.currency!,
      type: walletData.type!,
      goalAmount: walletData.goalAmount,
      isDefault: walletData.isDefault!,
      active: walletData.active!,
      iconUrl: walletData.iconUrl,
      description: walletData.description,
      color: walletData.color,
      order: 0
    };

    const success = this.walletService.createWallet(walletToCreate);
    if (success) {
      this.isLoading = false;
      this.router.navigate(['/app/wallets']);
    } else {
      this.isLoading = false;
      // In a real app, you'd show an error message
      console.error('Failed to create wallet');
    }
  }

  onCancel(): void {
    this.router.navigate(['/app/wallets']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.editWalletForm.controls).forEach(key => {
      const control = this.editWalletForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.editWalletForm.get(fieldName);
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

  isFieldInvalid(fieldName: string): boolean {
    const field = this.editWalletForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  // Icon preview methods
  onIconUrlChange(): void {
    this.iconPreviewLoaded = false;
    this.iconPreviewError = false;
  }

  onIconPreviewLoad(): void {
    this.iconPreviewLoaded = true;
    this.iconPreviewError = false;
  }

  onIconPreviewError(event: any): void {
    this.iconPreviewLoaded = false;
    this.iconPreviewError = true;
    console.warn('Failed to load icon preview');
  }

  // Goal progress calculation
  getGoalProgress(): number {
    const goalAmount = this.editWalletForm.get('goalAmount')?.value;
    const balance = this.editWalletForm.get('balance')?.value;
    
    if (!goalAmount || !balance || goalAmount <= 0) {
      return 0;
    }
    
    const progress = (balance / goalAmount) * 100;
    return Math.min(Math.round(progress), 100);
  }
}
