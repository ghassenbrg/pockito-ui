import { Component, OnInit, OnDestroy, OnChanges, SimpleChanges, ChangeDetectionStrategy, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DialogModule } from 'primeng/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { TransactionFormData } from '../../models/transaction.types';
import { WalletDto } from '@api/model/wallet.model';
import { Category } from '@api/model/category.model';
import { TransactionDto } from '@api/model/transaction.model';
import { TransactionFacade } from '../../services/transaction.facade';

@Component({
  selector: 'app-transaction-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    CalendarModule,
    InputTextareaModule,
    DialogModule,
    TranslateModule
  ],
  templateUrl: './transaction-modal.component.html',
  styleUrl: './transaction-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionModalComponent implements OnInit, OnDestroy, OnChanges {
  @Input() visible = false;
  @Input() mode: 'create' | 'edit' | 'view' = 'create';
  @Input() transaction: TransactionDto | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() transactionSaved = new EventEmitter<TransactionDto>();

  transactionForm!: FormGroup;
  wallets: WalletDto[] = [];
  categories: Category[] = [];
  loading = false;

  // External wallet option for transfers
  externalWalletOption = { id: null, name: 'External Wallet', currency: 'N/A' as const };
  
  // Flag to prevent infinite loops during validation
  private isUpdatingForm = false;

  transactionTypes = [
    { label: 'Expense', value: 'EXPENSE' },
    { label: 'Income', value: 'INCOME' },
    { label: 'Transfer', value: 'TRANSFER' }
  ];

  private subscriptions = new Subscription();

  constructor(
    private fb: FormBuilder,
    private transactionFacade: TransactionFacade
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadFormData();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']) {
      if (this.visible) {
        // Ensure wallets and categories are loaded when modal opens
        this.transactionFacade.ensureDataLoaded();
        
        if (this.transaction && (this.mode === 'edit' || this.mode === 'view')) {
          this.populateForm();
        } else if (this.mode === 'create') {
          this.resetForm();
        }
      }
    }
  }

  private initializeForm(): void {
    this.transactionForm = this.fb.group({
      transactionType: ['EXPENSE', Validators.required],
      walletFromId: [null],
      walletToId: [null],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      exchangeRate: [1, [Validators.required, Validators.min(0.000001)]],
      note: [''],
      effectiveDate: [new Date(), Validators.required],
      categoryId: [null]
    });

    // Watch for transaction type changes to update validation
    this.subscriptions.add(
      this.transactionForm.get('transactionType')?.valueChanges.subscribe(type => {
        this.updateFormValidation(type);
      })
    );

    // Watch for wallet selection changes to update exchange rate and validate external wallet
    this.subscriptions.add(
      this.transactionForm.get('walletFromId')?.valueChanges.subscribe(() => {
        if (this.isUpdatingForm) return;
        this.updateExchangeRate();
        // Only validate if it's a transfer transaction
        if (this.transactionForm.get('transactionType')?.value === 'TRANSFER') {
          this.validateExternalWalletSelection();
        }
      })
    );

    this.subscriptions.add(
      this.transactionForm.get('walletToId')?.valueChanges.subscribe(() => {
        if (this.isUpdatingForm) return;
        this.updateExchangeRate();
        // Only validate if it's a transfer transaction
        if (this.transactionForm.get('transactionType')?.value === 'TRANSFER') {
          this.validateExternalWalletSelection();
        }
      })
    );
  }

  private updateFormValidation(transactionType: string): void {
    if (this.isUpdatingForm) return;
    
    this.isUpdatingForm = true;
    
    const walletFromControl = this.transactionForm.get('walletFromId');
    const walletToControl = this.transactionForm.get('walletToId');
    const exchangeRateControl = this.transactionForm.get('exchangeRate');

    // Clear previous validators
    walletFromControl?.clearValidators();
    walletToControl?.clearValidators();

    switch (transactionType) {
      case 'EXPENSE':
        walletFromControl?.setValidators([Validators.required]);
        walletToControl?.setValue(null);
        // Reset exchange rate for non-transfer transactions
        exchangeRateControl?.setValue(1);
        break;
      case 'INCOME':
        walletToControl?.setValidators([Validators.required]);
        walletFromControl?.setValue(null);
        // Reset exchange rate for non-transfer transactions
        exchangeRateControl?.setValue(1);
        break;
      case 'TRANSFER':
        // At least one wallet must be selected
        walletFromControl?.setValidators([Validators.required]);
        break;
    }

    walletFromControl?.updateValueAndValidity();
    walletToControl?.updateValueAndValidity();
    
    // Update exchange rate based on wallet selection (only for transfer)
    if (transactionType === 'TRANSFER') {
      this.updateExchangeRate();
    }
    
    this.isUpdatingForm = false;
  }

  private loadFormData(): void {
    this.subscriptions.add(
      this.transactionFacade.getFormData$().subscribe(data => {
        this.wallets = data.wallets;
        this.categories = data.categories;
      })
    );
  }

  private populateForm(): void {
    if (this.transaction) {
      this.transactionForm.patchValue({
        transactionType: this.transaction.transactionType,
        walletFromId: this.transaction.walletFromId,
        walletToId: this.transaction.walletToId,
        amount: this.transaction.amount,
        exchangeRate: this.transaction.exchangeRate,
        note: this.transaction.note,
        effectiveDate: new Date(this.transaction.effectiveDate),
        categoryId: this.transaction.categoryId
      });

      if (this.mode === 'view') {
        this.transactionForm.disable();
      }
    }
  }

  private resetForm(): void {
    this.transactionForm.reset({
      transactionType: 'EXPENSE',
      amount: 0,
      exchangeRate: 1,
      effectiveDate: new Date()
    });
    this.transactionForm.enable();
  }

  onSubmit(): void {
    if (this.transactionForm.valid && this.mode !== 'view') {
      const formData = this.transactionForm.value;
      
      const transactionData: TransactionFormData = {
        transactionType: formData.transactionType,
        walletFromId: formData.walletFromId,
        walletToId: formData.walletToId,
        amount: formData.amount,
        exchangeRate: formData.exchangeRate,
        note: formData.note,
        effectiveDate: this.formatDateForAPI(formData.effectiveDate),
        categoryId: formData.categoryId
      };

      if (this.mode === 'edit' && this.transaction?.id) {
        this.transactionFacade.updateTransaction(this.transaction.id, transactionData);
      } else {
        this.transactionFacade.createTransaction(transactionData);
      }

      // Close modal immediately - effects will handle success/failure
      this.closeModal();
    } else if (this.mode === 'view') {
      this.closeModal();
    } else {
      this.markFormGroupTouched();
    }
  }

  onShow(): void {
    // Modal is being shown
  }

  onCancel(): void {
    this.closeModal();
  }

  // Handle ESC key press
  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(_event: KeyboardEvent): void {
    if (this.visible) {
      this.closeModal();
    }
  }

  private closeModal(): void {
    this.visibleChange.emit(false);
  }

  private formatDateForAPI(date: Date): string {
    // Format date as YYYY-MM-DD without timezone conversion
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private updateExchangeRate(): void {
    const exchangeRateControl = this.transactionForm.get('exchangeRate');
    
    if (!this.shouldShowExchangeRate) {
      // Set exchange rate to 1 when hidden (same currency or external wallet)
      exchangeRateControl?.setValue(1);
    }
  }

  private validateExternalWalletSelection(): void {
    const transactionType = this.transactionForm.get('transactionType')?.value;
    const walletFromId = this.transactionForm.get('walletFromId')?.value;
    const walletToId = this.transactionForm.get('walletToId')?.value;
    
    // Only validate for transfer transactions
    if (transactionType !== 'TRANSFER') {
      return;
    }
    
    // Check if both are external wallets (null values)
    if (walletFromId === null && walletToId === null) {
      // Only set errors, don't clear values to avoid infinite loop
      this.transactionForm.get('walletFromId')?.setErrors({ 'bothExternal': true });
      this.transactionForm.get('walletToId')?.setErrors({ 'bothExternal': true });
    } else {
      // Clear any previous external wallet errors
      this.transactionForm.get('walletFromId')?.setErrors(null);
      this.transactionForm.get('walletToId')?.setErrors(null);
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.transactionForm.controls).forEach(key => {
      const control = this.transactionForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const control = this.transactionForm.get(fieldName);
    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        return `${fieldName} is required`;
      }
      if (control.errors['min']) {
        return `${fieldName} must be greater than ${control.errors['min'].min}`;
      }
      if (control.errors['bothExternal']) {
        return 'Cannot select external wallet for both from and to wallets';
      }
    }
    return '';
  }

  get modalTitle(): string {
    switch (this.mode) {
      case 'create':
        return 'transaction.create.title';
      case 'edit':
        return 'transaction.edit.title';
      case 'view':
        return 'transaction.view.title';
      default:
        return 'transaction.create.title';
    }
  }

  get submitButtonLabel(): string {
    switch (this.mode) {
      case 'create':
        return 'transaction.create.create';
      case 'edit':
        return 'transaction.edit.update';
      case 'view':
        return 'common.close';
      default:
        return 'transaction.create.create';
    }
  }

  get isFormDisabled(): boolean {
    return this.mode === 'view' || this.loading;
  }

  get walletFromOptions(): any[] {
    const transactionType = this.transactionForm.get('transactionType')?.value;
    if (transactionType === 'TRANSFER') {
      return [...this.wallets, this.externalWalletOption];
    }
    return this.wallets;
  }

  get walletToOptions(): any[] {
    const transactionType = this.transactionForm.get('transactionType')?.value;
    if (transactionType === 'TRANSFER') {
      return [...this.wallets, this.externalWalletOption];
    }
    return this.wallets;
  }

  get shouldShowExchangeRate(): boolean {
    const transactionType = this.transactionForm.get('transactionType')?.value;
    const walletFromId = this.transactionForm.get('walletFromId')?.value;
    const walletToId = this.transactionForm.get('walletToId')?.value;
    
    // Only show for transfer transactions
    if (transactionType !== 'TRANSFER') {
      return false;
    }
    
    // Don't show if both are external wallets (validation error)
    if (walletFromId === null && walletToId === null) {
      return false;
    }
    
    // Don't show if only one external wallet is selected (no conversion needed)
    if (walletFromId === null || walletToId === null) {
      return false;
    }
    
    // Find the selected wallets
    const fromWallet = this.wallets.find(w => w.id === walletFromId);
    const toWallet = this.wallets.find(w => w.id === walletToId);
    
    // Don't show if wallets not found
    if (!fromWallet || !toWallet) {
      return false;
    }
    
    // Don't show if both wallets have the same currency
    return fromWallet.currency !== toWallet.currency;
  }
}
