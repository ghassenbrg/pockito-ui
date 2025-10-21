import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { 
  CategoryDto, 
  CategoryType, 
  TransactionDto, 
  TransactionType, 
  WalletDto 
} from '@api/models';
import { CategoryService, TransactionService, WalletService } from '@api/services';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  PockitoButtonComponent,
  PockitoButtonSize,
  PockitoButtonType,
} from '@shared/components/pockito-button/pockito-button.component';
import { ToastService } from '@shared/services/toast.service';

// PrimeNG imports
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-transaction-form',
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
    CalendarModule,
  ],
  templateUrl: './transaction-form.component.html',
  styleUrl: './transaction-form.component.scss'
})
export class TransactionFormComponent implements OnInit {
  @Input() transactionId?: string;
  @Input() initialWalletFromId?: string;
  @Input() initialWalletToId?: string;
  @Output() transactionSaved = new EventEmitter<TransactionDto>();
  @Output() formCancelled = new EventEmitter<void>();

  transactionForm: FormGroup;
  isEditMode: boolean = false;
  isLoading: boolean = false;

  // Available options for dropdowns
  transactionTypes = Object.values(TransactionType);
  categoryTypes = Object.values(CategoryType);

  // PrimeNG dropdown options
  transactionTypeOptions: any[] = [];
  categoryOptions: any[] = [];
  walletOptions: any[] = [];

  // Data arrays
  categories: CategoryDto[] = [];
  wallets: WalletDto[] = [];

  // Button types and sizes for template
  PockitoButtonType = PockitoButtonType;
  PockitoButtonSize = PockitoButtonSize;

  constructor(
    private fb: FormBuilder,
    private transactionService: TransactionService,
    private categoryService: CategoryService,
    private walletService: WalletService,
    private translate: TranslateService,
    private toastService: ToastService
  ) {
    this.transactionForm = this.createForm();
  }

  ngOnInit(): void {
    this.isEditMode = !!this.transactionId;
    
    this.initializeDropdownOptions();
    this.loadData();
    this.setupFormSubscriptions();

    if (this.isEditMode && this.transactionId) {
      this.loadTransaction(this.transactionId);
    } else if (this.initialWalletFromId || this.initialWalletToId) {
      this.prefillInitialWallets();
    }
  }

  private createForm(): FormGroup {
    const form = this.fb.group({
      transactionType: [
        undefined,
        [Validators.required]
      ],
      walletFromId: [undefined],
      walletToId: [undefined],
      amount: [
        undefined,
        [
          Validators.required,
          Validators.min(0.01)
        ]
      ],
      amountTo: [
        undefined,
        [Validators.min(0.01)]
      ],
      exchangeRate: [
        1,
        [
          Validators.required,
          Validators.min(0.0001)
        ]
      ],
      note: [
        undefined,
        Validators.maxLength(500)
      ],
      effectiveDate: [
        new Date(),
        Validators.required
      ],
      categoryId: [undefined],
    });

    return form;
  }

  private initializeDropdownOptions(): void {
    // Initialize transaction type options
    this.transactionTypeOptions = this.transactionTypes.map((type) => ({
      label: this.translate.instant(`enums.transactionType.${type}`),
      value: type,
    }));
  }

  private loadData(): void {
    this.loadCategories();
    this.loadWallets();
  }

  private loadCategories(): void {
    this.categoryService.getUserCategories().subscribe({
      next: (categories: CategoryDto[]) => {
        this.categories = categories;
        this.updateCategoryOptions();
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.toastService.showError(
          'transactions.loadingCategoriesError',
          error.error?.message || 'Error loading categories'
        );
      },
    });
  }

  private loadWallets(): void {
    this.walletService.getUserWallets().subscribe({
      next: (wallets: WalletDto[]) => {
        this.wallets = wallets;
        this.updateWalletOptions();
      },
      error: (error) => {
        console.error('Error loading wallets:', error);
        this.toastService.showError(
          'transactions.loadingWalletsError',
          error.error?.message || 'Error loading wallets'
        );
      },
    });
  }

  private updateCategoryOptions(): void {
    const transactionType = this.transactionForm.get('transactionType')?.value;
    if (!transactionType) {
      this.categoryOptions = [];
      return;
    }

    let filteredCategories: CategoryDto[] = [];
    
    if (transactionType === TransactionType.INCOME) {
      filteredCategories = this.categories.filter(cat => cat.categoryType === CategoryType.INCOME);
    } else if (transactionType === TransactionType.EXPENSE) {
      filteredCategories = this.categories.filter(cat => cat.categoryType === CategoryType.EXPENSE);
    }

    this.categoryOptions = filteredCategories.map((category) => ({
      label: category.name,
      value: category.id,
    }));

    // Clear category selection if current category is not valid for selected type
    const currentCategoryId = this.transactionForm.get('categoryId')?.value;
    if (currentCategoryId && !filteredCategories.find(cat => cat.id === currentCategoryId)) {
      this.transactionForm.patchValue({ categoryId: undefined });
    }
  }

  private updateWalletOptions(): void {
    this.walletOptions = this.wallets.map((wallet) => ({
      label: wallet.name,
      value: wallet.id,
    }));
  }

  private setupFormSubscriptions(): void {
    // Watch for transaction type changes
    this.transactionForm.get('transactionType')?.valueChanges.subscribe(() => {
      this.updateCategoryOptions();
      this.updateFormFieldsVisibility();
    });

    // Watch for wallet changes to handle currency logic
    this.transactionForm.get('walletFromId')?.valueChanges.subscribe(() => {
      this.updateExchangeRateLogic();
    });

    this.transactionForm.get('walletToId')?.valueChanges.subscribe(() => {
      this.updateExchangeRateLogic();
    });

    // Watch for amount changes
    this.transactionForm.get('amount')?.valueChanges.subscribe(() => {
      this.updateExchangeRateLogic();
    });

    this.transactionForm.get('exchangeRate')?.valueChanges.subscribe(() => {
      this.updateExchangeRateLogic();
    });
  }

  private updateFormFieldsVisibility(): void {
    const transactionType = this.transactionForm.get('transactionType')?.value;
    
    if (transactionType === TransactionType.TRANSFER) {
      // Show both wallet fields for transfers
      this.transactionForm.get('walletFromId')?.setValidators([]);
      this.transactionForm.get('walletToId')?.setValidators([]);
      this.transactionForm.get('categoryId')?.setValidators([]);
      this.transactionForm.get('categoryId')?.setValue(undefined);
    } else if (transactionType === TransactionType.INCOME) {
      // Income: show "to wallet" field only
      this.transactionForm.get('walletFromId')?.setValidators([]);
      this.transactionForm.get('walletToId')?.setValidators([]);
      this.transactionForm.get('categoryId')?.setValidators([Validators.required]);
      
      // Clear from wallet, keep to wallet
      this.transactionForm.patchValue({
        walletFromId: undefined,
      });
    } else if (transactionType === TransactionType.EXPENSE) {
      // Expense: show "from wallet" field only
      this.transactionForm.get('walletFromId')?.setValidators([]);
      this.transactionForm.get('walletToId')?.setValidators([]);
      this.transactionForm.get('categoryId')?.setValidators([Validators.required]);
      
      // Clear to wallet, keep from wallet
      this.transactionForm.patchValue({
        walletToId: undefined,
      });
    }

    // Update validation
    this.transactionForm.get('walletFromId')?.updateValueAndValidity();
    this.transactionForm.get('walletToId')?.updateValueAndValidity();
    this.transactionForm.get('categoryId')?.updateValueAndValidity();
  }

  private updateExchangeRateLogic(): void {
    const walletFromId = this.transactionForm.get('walletFromId')?.value;
    const walletToId = this.transactionForm.get('walletToId')?.value;
    
    if (!walletFromId || !walletToId) {
      // One wallet is null (out of Pockito)
      this.transactionForm.patchValue({
        exchangeRate: 1,
        amountTo: this.transactionForm.get('amount')?.value || undefined,
      });
      return;
    }

    const walletFrom = this.wallets.find(w => w.id === walletFromId);
    const walletTo = this.wallets.find(w => w.id === walletToId);

    if (walletFrom && walletTo) {
      if (walletFrom.currency === walletTo.currency) {
        // Same currency - hide exchange rate, set to 1
        this.transactionForm.patchValue({
          exchangeRate: 1,
          amountTo: this.transactionForm.get('amount')?.value || undefined,
        });
      } else {
        // Different currencies - show exchange rate field
        const amount = this.transactionForm.get('amount')?.value;
        const exchangeRate = this.transactionForm.get('exchangeRate')?.value;
        
        if (amount && exchangeRate) {
          this.transactionForm.patchValue({
            amountTo: amount * exchangeRate,
          });
        }
      }
    }
  }

  private prefillInitialWallets(): void {
    this.transactionForm.patchValue({
      walletFromId: this.initialWalletFromId,
      walletToId: this.initialWalletToId,
    });
  }

  private loadTransaction(transactionId: string): void {
    this.isLoading = true;
    this.transactionService.getTransaction(transactionId).subscribe({
      next: (transaction: TransactionDto) => {
        this.patchTransactionForm(transaction);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading transaction:', error);
        this.toastService.showError(
          'transactions.loadingTransactionError',
          error.error?.message || 'Error loading transaction'
        );
        this.isLoading = false;
      },
    });
  }

  private patchTransactionForm(transaction: TransactionDto): void {
    // Convert API date to local date without timezone conversion
    const effectiveDate = this.parseLocalDate(transaction.effectiveDate);
    
    this.transactionForm.patchValue({
      transactionType: transaction.transactionType,
      walletFromId: transaction.walletFromId,
      walletToId: transaction.walletToId,
      amount: transaction.amount,
      amountTo: transaction.walletToAmount,
      exchangeRate: transaction.exchangeRate,
      note: transaction.note || '',
      effectiveDate: effectiveDate,
      categoryId: transaction.categoryId,
    });
  }

  onSubmit(): void {
    if (this.transactionForm.valid) {
      const formValue = this.transactionForm.value;
      
      // Convert date to local date string without timezone (YYYY-MM-DD format)
      const effectiveDate = this.formatLocalDateString(formValue.effectiveDate);
      
      const transactionData: TransactionDto = {
        transactionType: formValue.transactionType,
        walletFromId: formValue.walletFromId,
        walletToId: formValue.walletToId,
        amount: formValue.amount,
        exchangeRate: formValue.exchangeRate,
        walletToAmount: formValue.amountTo,
        note: formValue.note || '',
        effectiveDate: effectiveDate as any, // Send as string in YYYY-MM-DD format
        categoryId: formValue.categoryId,
      };

      if (this.isEditMode && this.transactionId) {
        transactionData.id = this.transactionId;
        this.updateTransaction(transactionData);
      } else {
        this.createTransaction(transactionData);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private createTransaction(transactionData: TransactionDto): void {
    this.isLoading = true;
    this.transactionService.createTransaction(transactionData).subscribe({
      next: (createdTransaction: TransactionDto) => {
        this.transactionSaved.emit(createdTransaction);
        this.isLoading = false;
        this.toastService.showSuccess(
          'transactions.createTransactionSuccess',
          'transactions.createTransactionSuccessMessage'
        );
      },
      error: (error) => {
        console.error('Error creating transaction:', error);
        this.isLoading = false;
        this.toastService.showError(
          'transactions.createTransactionError',
          error.error?.message || 'Failed to create transaction'
        );
      },
    });
  }

  private updateTransaction(transactionData: TransactionDto): void {
    this.isLoading = true;
    this.transactionService.updateTransaction(transactionData.id!, transactionData).subscribe({
      next: (updatedTransaction: TransactionDto) => {
        this.transactionSaved.emit(updatedTransaction);
        this.isLoading = false;
        this.toastService.showSuccess(
          'transactions.updateTransactionSuccess',
          'transactions.updateTransactionSuccessMessage'
        );
      },
      error: (error) => {
        console.error('Error updating transaction:', error);
        this.isLoading = false;
        this.toastService.showError(
          'transactions.updateTransactionError',
          error.error?.message || 'Failed to update transaction'
        );
      },
    });
  }

  onCancel(): void {
    this.formCancelled.emit();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.transactionForm.controls).forEach((key) => {
      const control = this.transactionForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const control = this.transactionForm.get(fieldName);
    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        return this.translate.instant(
          `transactions.form.errors.${fieldName}Required`
        );
      }
      if (control.errors['min']) {
        return this.translate.instant(`transactions.form.errors.${fieldName}Min`);
      }
      if (control.errors['maxlength']) {
        return this.translate.instant(
          `transactions.form.errors.${fieldName}MaxLength`
        );
      }
    }
    return '';
  }

  // Helper methods for template
  shouldShowCategoryField(): boolean {
    const transactionType = this.transactionForm.get('transactionType')?.value;
    return transactionType === TransactionType.INCOME || transactionType === TransactionType.EXPENSE;
  }

  shouldShowWalletFields(): boolean {
    const transactionType = this.transactionForm.get('transactionType')?.value;
    return transactionType === TransactionType.TRANSFER || 
           transactionType === TransactionType.INCOME || 
           transactionType === TransactionType.EXPENSE;
  }

  shouldShowFromWalletField(): boolean {
    const transactionType = this.transactionForm.get('transactionType')?.value;
    return transactionType === TransactionType.TRANSFER || transactionType === TransactionType.EXPENSE;
  }

  shouldShowToWalletField(): boolean {
    const transactionType = this.transactionForm.get('transactionType')?.value;
    return transactionType === TransactionType.TRANSFER || transactionType === TransactionType.INCOME;
  }

  shouldShowExchangeRateField(): boolean {
    const walletFromId = this.transactionForm.get('walletFromId')?.value;
    const walletToId = this.transactionForm.get('walletToId')?.value;
    
    if (!walletFromId || !walletToId) {
      return false; // One wallet is null (out of Pockito)
    }

    const walletFrom = this.wallets.find(w => w.id === walletFromId);
    const walletTo = this.wallets.find(w => w.id === walletToId);

    return !!(walletFrom && walletTo && walletFrom.currency !== walletTo.currency);
  }

  shouldShowAmountToField(): boolean {
    return this.shouldShowExchangeRateField();
  }

  getWalletCurrency(walletId: string): string {
    const wallet = this.wallets.find(w => w.id === walletId);
    return wallet ? wallet.currency : '';
  }

  getWalletName(walletId: string): string {
    const wallet = this.wallets.find(w => w.id === walletId);
    return wallet ? wallet.name : '';
  }

  getWalletOptionsWithNull(): any[] {
    return [{ label: 'Out of Pockito', value: null }, ...this.walletOptions];
  }

  getTransactionTypeLabel(type: TransactionType): string {
    return this.translate.instant(`enums.transactionType.${type}`);
  }

  getCategoryTypeLabel(type: CategoryType): string {
    return this.translate.instant(`enums.categoryType.${type}`);
  }

  /**
   * Formats a date as a local date string without timezone (YYYY-MM-DD format)
   * @param date - Date object
   * @returns Date string in YYYY-MM-DD format
   */
  private formatLocalDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Parses a date from API response without timezone conversion
   * @param dateString - Date string from API
   * @returns Date object representing the local date
   */
  private parseLocalDate(dateString: string | Date): Date {
    if (typeof dateString === 'string') {
      // Parse date string and create local date
      const date = new Date(dateString);
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }
    return new Date(dateString.getFullYear(), dateString.getMonth(), dateString.getDate());
  }
}
