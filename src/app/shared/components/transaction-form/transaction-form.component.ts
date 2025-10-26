import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  Category,
  CategoryType,
  TransactionDto,
  TransactionType,
  Wallet,
  WalletType,
  WalletList,
  CategoryList,
  TransactionRequest,
} from '@api/models';
import {
  CategoryService,
  TransactionService,
  WalletService,
} from '@api/services';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  PockitoButtonComponent,
  PockitoButtonSize,
  PockitoButtonType,
} from '@shared/components/pockito-button/pockito-button.component';
import { PockitoSelectorComponent } from '@shared/components/pockito-selector/pockito-selector.component';
import { DialogOption } from '@shared/components/dialog-selector/dialog-selector.component';
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
    PockitoSelectorComponent,
    TranslateModule,
    // PrimeNG modules
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    CalendarModule,
  ],
  templateUrl: './transaction-form.component.html',
  styleUrl: './transaction-form.component.scss',
})
export class TransactionFormComponent implements OnInit {
  @Input() transactionId?: string;
  @Input() initialWalletFromId?: string;
  @Input() initialWalletToId?: string;
  @Output() transactionSaved = new EventEmitter<TransactionDto>();
  @Output() formCancelled = new EventEmitter<void>();
  @Output() transactionTypeChanged = new EventEmitter<TransactionType>();
  @Output() walletChanged = new EventEmitter<{walletFromId: string | null, walletToId: string | null}>();

  transactionForm: FormGroup;
  isEditMode: boolean = false;
  isLoading: boolean = false;

  // Available options for dropdowns
  transactionTypes = Object.values(TransactionType);
  categoryTypes = Object.values(CategoryType);

  // PrimeNG dropdown options
  transactionTypeOptions: any[] = [];

  // Data arrays
  wallets: Wallet[] = [];
  categories: Category[] = [];

  // Dialog options for selectors
  walletOptions: DialogOption[] = [];
  walletFromOptions: DialogOption[] = [];
  walletToOptions: DialogOption[] = [];
  categoryOptions: DialogOption[] = [];

  // Default wallet
  defaultWallet: Wallet | null = null;

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
      transactionType: [undefined, [Validators.required]],
      walletFromId: [undefined],
      walletToId: [undefined],
      amount: [undefined, [Validators.required, Validators.min(0.01)]],
      amountTo: [undefined, [Validators.min(0.01)]],
      exchangeRate: [1, [Validators.required, Validators.min(0.0001)]],
      note: [undefined, Validators.maxLength(500)],
      effectiveDate: [new Date(), Validators.required],
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
    this.loadWallets();
    this.loadCategories();
  }

  private loadWallets(): void {
    this.walletService.getUserWallets().subscribe({
      next: (response: WalletList) => {
        this.wallets = response.wallets;
        // Find the wallet with isDefault flag set to true
        this.defaultWallet = response.wallets.find(wallet => wallet.isDefault) || null;
        this.updateWalletOptions();
        
        // Only set default values if not in edit mode
        if (!this.isEditMode) {
          this.setDefaultWalletValues();
        }
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

  private loadCategories(): void {
    // Load both income and expense categories
    this.categoryService.getCategoriesByType(CategoryType.INCOME).subscribe({
      next: (response: CategoryList) => {
        this.categoryService.getCategoriesByType(CategoryType.EXPENSE).subscribe({
          next: (expenseResponse: CategoryList) => {
            this.categories = [...response.categories, ...expenseResponse.categories];
            this.updateCategoryOptions();
          },
          error: (error) => {
            console.error('Error loading expense categories:', error);
            this.toastService.showError(
              'transactions.loadingCategoriesError',
              error.error?.message || 'Error loading categories'
            );
          },
        });
      },
      error: (error) => {
        console.error('Error loading income categories:', error);
        this.toastService.showError(
          'transactions.loadingCategoriesError',
          error.error?.message || 'Error loading categories'
        );
      },
    });
  }

  private updateWalletOptions(): void {
    // Add "Out of Pockito" option at the beginning
    const outOfPockitoOption: DialogOption = {
      id: null,
      name: this.translate.instant('common.outOfPockito'),
      iconUrl: '/assets/icons/out-of-pockito.png',
      fallbackIcon: 'pi pi-external-link',
      type: 'OUT_OF_POCKITO',
      typeLabel: this.translate.instant('common.outOfPockito')
    };

    const walletOptions = this.wallets.map(wallet => ({
      id: wallet.id!,
      name: wallet.name,
      iconUrl: wallet.iconUrl || this.getWalletIcon(wallet.type),
      type: wallet.type,
      typeLabel: this.getWalletTypeLabel(wallet.type),
      currency: wallet.currency,
      balance: wallet.balance
    }));

    this.walletOptions = [outOfPockitoOption, ...walletOptions];
    this.updateWalletFromOptions();
    this.updateWalletToOptions();
  }

  private updateWalletFromOptions(): void {
    const walletToId = this.transactionForm.get('walletToId')?.value;
    this.walletFromOptions = this.walletOptions.filter(option => 
      option.id !== walletToId || option.id === null
    );
  }

  private updateWalletToOptions(): void {
    const walletFromId = this.transactionForm.get('walletFromId')?.value;
    this.walletToOptions = this.walletOptions.filter(option => 
      option.id !== walletFromId || option.id === null
    );
  }

  private setDefaultWalletValues(): void {
    const transactionType = this.transactionForm.get('transactionType')?.value;
    
    // Skip setting default values in edit mode to preserve loaded transaction data
    if (this.isEditMode || !transactionType || !this.defaultWallet) {
      return;
    }

    if (transactionType === TransactionType.TRANSFER) {
      // Transfer: default walletTo is default wallet, walletFrom is null
      this.transactionForm.patchValue({
        walletToId: this.defaultWallet.id,
        walletFromId: null
      }, { emitEvent: false });
    } else if (transactionType === TransactionType.EXPENSE) {
      // Expense: default walletFrom is default wallet, walletTo is undefined
      this.transactionForm.patchValue({
        walletFromId: this.defaultWallet.id,
        walletToId: null
      }, { emitEvent: false });
    } else if (transactionType === TransactionType.INCOME) {
      // Income: default walletTo is default wallet, walletFrom is undefined
      this.transactionForm.patchValue({
        walletToId: this.defaultWallet.id,
        walletFromId: null
      }, { emitEvent: false });
    }
    this.emitWalletChange();
  }

  private updateCategoryOptions(): void {
    const transactionType = this.transactionForm.get('transactionType')?.value;
    
    // Filter categories based on transaction type
    let filteredCategories = this.categories;
    if (transactionType === TransactionType.INCOME) {
      filteredCategories = this.categories.filter(category => category.categoryType === CategoryType.INCOME);
    } else if (transactionType === TransactionType.EXPENSE) {
      filteredCategories = this.categories.filter(category => category.categoryType === CategoryType.EXPENSE);
    }
    // For TRANSFER transactions, no categories are shown (categories array remains empty)
    
    this.categoryOptions = filteredCategories.map(category => ({
      id: category.id!,
      name: category.name!,
      iconUrl: category.iconUrl,
      fallbackIcon: this.getCategoryIcon(category.categoryType!),
      type: category.categoryType,
      typeLabel: this.getCategoryTypeLabel(category.categoryType!)
    }));
  }

  private clearInvalidCategorySelection(): void {
    const selectedCategoryId = this.transactionForm.get('categoryId')?.value;
    const transactionType = this.transactionForm.get('transactionType')?.value;
    
    if (!selectedCategoryId || transactionType === TransactionType.TRANSFER) {
      return;
    }
    
    // Check if the selected category is valid for the current transaction type
    const selectedCategory = this.categories.find(category => category.id === selectedCategoryId);
    if (selectedCategory) {
      const isValidCategory = 
        (transactionType === TransactionType.INCOME && selectedCategory.categoryType === CategoryType.INCOME) ||
        (transactionType === TransactionType.EXPENSE && selectedCategory.categoryType === CategoryType.EXPENSE);
      
      if (!isValidCategory) {
        // Clear the invalid category selection
        this.transactionForm.patchValue({ categoryId: undefined }, { emitEvent: false });
      }
    }
  }

  private emitWalletChange(): void {
    const walletFromId = this.transactionForm.get('walletFromId')?.value;
    const walletToId = this.transactionForm.get('walletToId')?.value;
    this.walletChanged.emit({ walletFromId, walletToId });
  }

  private setupFormSubscriptions(): void {
    // Watch for transaction type changes
    this.transactionForm.get('transactionType')?.valueChanges.subscribe((transactionType) => {
      this.updateFormFieldsVisibility();
      // Update category options when transaction type changes
      this.updateCategoryOptions();
      // Clear category selection if it's no longer valid for the new transaction type
      this.clearInvalidCategorySelection();
      if (transactionType) {
        this.transactionTypeChanged.emit(transactionType);
      }
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
      // At least one wallet must be selected and not null
      this.transactionForm
        .get('walletFromId')
        ?.setValidators([this.walletValidator('from')]);
      this.transactionForm
        .get('walletToId')
        ?.setValidators([this.walletValidator('to')]);
      this.transactionForm.get('categoryId')?.setValidators([]);
      this.transactionForm.get('categoryId')?.setValue(undefined);
    } else if (transactionType === TransactionType.INCOME) {
      // Income: show "to wallet" field only
      this.transactionForm
        .get('walletFromId')
        ?.setValidators([this.walletValidator('from')]);
      this.transactionForm
        .get('walletToId')
        ?.setValidators([this.walletValidator('to')]);
      this.transactionForm
        .get('categoryId')
        ?.setValidators([Validators.required]);

      // Clear from wallet, keep to wallet
      this.transactionForm.patchValue(
        {
          walletFromId: undefined,
        },
        { emitEvent: false }
      );
    } else if (transactionType === TransactionType.EXPENSE) {
      // Expense: show "from wallet" field only
      this.transactionForm
        .get('walletFromId')
        ?.setValidators([this.walletValidator('from')]);
      this.transactionForm
        .get('walletToId')
        ?.setValidators([this.walletValidator('to')]);
      this.transactionForm
        .get('categoryId')
        ?.setValidators([Validators.required]);

      // Clear to wallet, keep from wallet
      this.transactionForm.patchValue(
        {
          walletToId: undefined,
        },
        { emitEvent: false }
      );
    }

    // Set default wallet values based on transaction type
    this.setDefaultWalletValues();
    
    // Update wallet options to exclude selected wallets
    this.updateWalletFromOptions();
    this.updateWalletToOptions();

    // Update category options based on transaction type
    this.updateCategoryOptions();
    
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
      this.transactionForm.patchValue(
        {
          exchangeRate: 1,
          amountTo: this.transactionForm.get('amount')?.value || undefined,
        },
        { emitEvent: false }
      );
      return;
    }

    const walletFrom = this.wallets.find((w) => w.id === walletFromId);
    const walletTo = this.wallets.find((w) => w.id === walletToId);

    if (walletFrom && walletTo) {
      if (walletFrom.currency === walletTo.currency) {
        // Same currency - hide exchange rate, set to 1
        this.transactionForm.patchValue(
          {
            exchangeRate: 1,
            amountTo: this.transactionForm.get('amount')?.value || undefined,
          },
          { emitEvent: false }
        );
      } else {
        // Different currencies - show exchange rate field
        const amount = this.transactionForm.get('amount')?.value;
        const exchangeRate = this.transactionForm.get('exchangeRate')?.value;

        if (amount && exchangeRate) {
          this.transactionForm.patchValue(
            {
              amountTo: amount * exchangeRate,
            },
            { emitEvent: false }
          );
        }
      }
    }
  }

  private prefillInitialWallets(): void {
    this.transactionForm.patchValue(
      {
        walletFromId: this.initialWalletFromId,
        walletToId: this.initialWalletToId,
      },
      { emitEvent: false }
    );
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
    const effectiveDate = transaction.effectiveDate ? this.parseLocalDate(transaction.effectiveDate) : undefined;

    this.transactionForm.patchValue(
      {
        transactionType: transaction.transactionType,
        walletFromId: transaction.walletFromId,
        walletToId: transaction.walletToId,
        amount: transaction.amount,
        amountTo: transaction.walletToAmount,
        exchangeRate: transaction.exchangeRate,
        note: transaction.note || '',
        effectiveDate: effectiveDate,
        categoryId: transaction.categoryId,
      },
      { emitEvent: false }
    );

    // Update wallet options after patching the form to ensure proper filtering
    this.updateWalletFromOptions();
    this.updateWalletToOptions();
  }

  onSubmit(): void {
    if (this.transactionForm.valid) {
      const formValue = this.transactionForm.value;

      // Convert date to local date string without timezone (YYYY-MM-DD format)
      const effectiveDate = this.formatLocalDateString(formValue.effectiveDate);

      const transactionData: TransactionRequest = {
        transactionType: formValue.transactionType,
        walletFromId: formValue.walletFromId,
        walletToId: formValue.walletToId,
        amount: formValue.amount,
        exchangeRate: formValue.exchangeRate,
        note: formValue.note || '',
        effectiveDate: effectiveDate as any, // Send as string in YYYY-MM-DD format
        categoryId: formValue.categoryId,
      };

      if (this.isEditMode && this.transactionId) {
        this.updateTransaction(this.transactionId, transactionData);
      } else {
        this.createTransaction(transactionData);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private createTransaction(transactionData: TransactionRequest): void {
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

  private updateTransaction(transactionId: string, transactionData: TransactionRequest): void {
    this.isLoading = true;
    this.transactionService
      .updateTransaction(transactionId, transactionData)
      .subscribe({
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
        return this.translate.instant(
          `transactions.form.errors.${fieldName}Min`
        );
      }
      if (control.errors['maxlength']) {
        return this.translate.instant(
          `transactions.form.errors.${fieldName}MaxLength`
        );
      }
      if (control.errors['walletFromRequired']) {
        return this.translate.instant(
          'transactions.form.errors.walletFromRequired'
        );
      }
      if (control.errors['walletToRequired']) {
        return this.translate.instant(
          'transactions.form.errors.walletToRequired'
        );
      }
    }
    return '';
  }

  // Helper methods for template
  shouldShowCategoryField(): boolean {
    const transactionType = this.transactionForm.get('transactionType')?.value;
    return (
      transactionType === TransactionType.INCOME ||
      transactionType === TransactionType.EXPENSE
    );
  }

  shouldShowWalletFields(): boolean {
    const transactionType = this.transactionForm.get('transactionType')?.value;
    return (
      transactionType === TransactionType.TRANSFER ||
      transactionType === TransactionType.INCOME ||
      transactionType === TransactionType.EXPENSE
    );
  }

  shouldShowFromWalletField(): boolean {
    const transactionType = this.transactionForm.get('transactionType')?.value;
    return (
      transactionType === TransactionType.TRANSFER ||
      transactionType === TransactionType.EXPENSE
    );
  }

  shouldShowToWalletField(): boolean {
    const transactionType = this.transactionForm.get('transactionType')?.value;
    return (
      transactionType === TransactionType.TRANSFER ||
      transactionType === TransactionType.INCOME
    );
  }

  shouldShowFromWalletRequired(): boolean {
    const transactionType = this.transactionForm.get('transactionType')?.value;
    if (transactionType === TransactionType.EXPENSE) {
      return true;
    }
    if (transactionType === TransactionType.TRANSFER) {
      return !this.transactionForm.get('walletToId')?.value;
    }
    return false;
  }

  shouldShowToWalletRequired(): boolean {
    const transactionType = this.transactionForm.get('transactionType')?.value;
    if (transactionType === TransactionType.INCOME) {
      return true;
    }
    if (transactionType === TransactionType.TRANSFER) {
      return !this.transactionForm.get('walletFromId')?.value;
    }
    return false;
  }

  shouldShowExchangeRateField(): boolean {
    const walletFromId = this.transactionForm.get('walletFromId')?.value;
    const walletToId = this.transactionForm.get('walletToId')?.value;

    if (!walletFromId || !walletToId) {
      return false; // One wallet is null (out of Pockito)
    }

    const walletFrom = this.wallets.find((w) => w.id === walletFromId);
    const walletTo = this.wallets.find((w) => w.id === walletToId);

    return !!(
      walletFrom &&
      walletTo &&
      walletFrom.currency !== walletTo.currency
    );
  }

  shouldShowAmountToField(): boolean {
    return this.shouldShowExchangeRateField();
  }

  getWalletCurrency(walletId: string): string {
    const wallet = this.wallets.find((w) => w.id === walletId);
    return wallet ? wallet.currency : '';
  }

  getWalletName(walletId: string): string {
    const wallet = this.wallets.find((w) => w.id === walletId);
    return wallet ? wallet.name : '';
  }

  getTransactionTypeLabel(type: TransactionType): string {
    return this.translate.instant(`enums.transactionType.${type}`);
  }

  getCategoryTypeLabel(type: CategoryType): string {
    return this.translate.instant(`enums.categoryType.${type}`);
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

  getCategoryIcon(categoryType: CategoryType): string {
    switch (categoryType) {
      case CategoryType.INCOME:
        return 'pi pi-arrow-up';
      case CategoryType.EXPENSE:
        return 'pi pi-arrow-down';
      default:
        return 'pi pi-circle';
    }
  }

  getSelectedWallet(walletId?: string): any {
    if (walletId === null) {
      // Return the "Out of Pockito" option object
      return this.walletOptions.find(option => option.id === null);
    }
    if (!walletId) {
      return undefined;
    }
    const wallet = this.wallets.find(wallet => wallet.id === walletId);
    if(wallet) {
      wallet.iconUrl = wallet.iconUrl || this.getWalletIcon(wallet.type);
    }
    
    return wallet;
  }

  getSelectedCategory(categoryId?: string): Category | undefined {
    return this.categories.find(cat => cat.id === categoryId);
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
    return new Date(
      dateString.getFullYear(),
      dateString.getMonth(),
      dateString.getDate()
    );
  }

  // New methods for enhanced mobile-friendly form
  selectTransactionType(type: TransactionType): void {
    this.transactionForm.patchValue({ transactionType: type });
  }

  getTransactionTypeIcon(type: TransactionType): string {
    switch (type) {
      case TransactionType.INCOME:
        return 'pi pi-arrow-up';
      case TransactionType.EXPENSE:
        return 'pi pi-arrow-down';
      case TransactionType.TRANSFER:
        return 'pi pi-arrows-h';
      default:
        return 'pi pi-circle';
    }
  }

  getTransactionTypeDescription(type: TransactionType): string {
    switch (type) {
      case TransactionType.INCOME:
        return 'transactions.form.typeDescription.income';
      case TransactionType.EXPENSE:
        return 'transactions.form.typeDescription.expense';
      case TransactionType.TRANSFER:
        return 'transactions.form.typeDescription.transfer';
      default:
        return '';
    }
  }

  getCurrencySymbol(currency: string): string {
    const currencySymbols: { [key: string]: string } = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      CAD: 'C$',
      AUD: 'A$',
      CHF: 'CHF',
      CNY: '¥',
      SEK: 'kr',
      NOK: 'kr',
      DKK: 'kr',
      PLN: 'zł',
      CZK: 'Kč',
      HUF: 'Ft',
      RUB: '₽',
      BRL: 'R$',
      MXN: '$',
      INR: '₹',
      KRW: '₩',
      SGD: 'S$',
      HKD: 'HK$',
      NZD: 'NZ$',
      ZAR: 'R',
      TRY: '₺',
      ILS: '₪',
      AED: 'د.إ',
      SAR: '﷼',
      QAR: '﷼',
      KWD: 'د.ك',
      BHD: 'د.ب',
      OMR: '﷼',
      JOD: 'د.ا',
      LBP: 'ل.ل',
      EGP: '£',
      MAD: 'د.م.',
      TND: 'د.ت',
      DZD: 'د.ج',
      LYD: 'ل.د',
      SDG: 'ج.س.',
      ETB: 'Br',
      KES: 'KSh',
      UGX: 'USh',
      TZS: 'TSh',
      ZMW: 'ZK',
      BWP: 'P',
      SZL: 'L',
      LSL: 'L',
      NAD: 'N$',
      MUR: '₨',
      SCR: '₨',
      MVR: 'ރ',
      LKR: '₨',
      NPR: '₨',
      BDT: '৳',
      PKR: '₨',
      AFN: '؋',
      UZS: 'лв',
      KZT: '₸',
      KGS: 'лв',
      TJS: 'SM',
      TMT: 'T',
      UAH: '₴',
      BYN: 'Br',
      MDL: 'L',
      RON: 'lei',
      BGN: 'лв',
      HRK: 'kn',
      RSD: 'дин',
      MKD: 'ден',
      ALL: 'L',
      BAM: 'КМ',
      MNT: '₮',
      KHR: '៛',
      LAK: '₭',
      VND: '₫',
      THB: '฿',
      MYR: 'RM',
      IDR: 'Rp',
      PHP: '₱',
      MMK: 'K',
      BND: 'B$',
      FJD: 'FJ$',
      PGK: 'K',
      SBD: 'SI$',
      VUV: 'Vt',
      WST: 'WS$',
      TOP: 'T$',
      XPF: '₣',
    };
    return currencySymbols[currency] || currency;
  }

  setQuickAmount(amount: number): void {
    this.transactionForm.patchValue({ amount: amount });
  }

  setQuickNote(type: string): void {
    const noteTexts: { [key: string]: string } = {
      groceries: 'Groceries',
      transport: 'Transport',
      food: 'Food & Dining',
    };
    const currentNote = this.transactionForm.get('note')?.value || '';
    const newNote = currentNote
      ? `${currentNote}, ${noteTexts[type]}`
      : noteTexts[type];
    this.transactionForm.patchValue({ note: newNote });
  }

  setQuickDate(type: string): void {
    const today = new Date();
    let targetDate: Date;

    switch (type) {
      case 'today':
        targetDate = new Date(today);
        break;
      case 'yesterday':
        targetDate = new Date(today);
        targetDate.setDate(today.getDate() - 1);
        break;
      default:
        targetDate = today;
    }

    this.transactionForm.patchValue({ effectiveDate: targetDate });
  }

  isTodaySelected(): boolean {
    const selectedDate = this.transactionForm.get('effectiveDate')?.value;
    if (!selectedDate) return false;
    
    const today = new Date();
    const selected = new Date(selectedDate);
    
    return selected.getFullYear() === today.getFullYear() &&
           selected.getMonth() === today.getMonth() &&
           selected.getDate() === today.getDate();
  }

  isYesterdaySelected(): boolean {
    const selectedDate = this.transactionForm.get('effectiveDate')?.value;
    if (!selectedDate) return false;
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    const selected = new Date(selectedDate);
    
    return selected.getFullYear() === yesterday.getFullYear() &&
           selected.getMonth() === yesterday.getMonth() &&
           selected.getDate() === yesterday.getDate();
  }

  // Category selector event handlers
  onCategorySelected(categoryId: string | null): void {
    this.transactionForm.patchValue({ categoryId: categoryId || undefined });
    // Mark field as touched to show validation errors
    this.transactionForm.get('categoryId')?.markAsTouched();
  }

  onCategoryCleared(): void {
    this.transactionForm.patchValue({ categoryId: undefined });
    // Mark field as touched to show validation errors
    this.transactionForm.get('categoryId')?.markAsTouched();
  }

  onCategoryTouched(): void {
    // Mark field as touched when dialog closes to show validation errors
    this.transactionForm.get('categoryId')?.markAsTouched();
  }

  onFromWalletSelected(walletId: string | null): void {
    const currentWalletToId = this.transactionForm.get('walletToId')?.value;
    
    // Handle wallet switching logic for transfers
    if (this.transactionForm.get('transactionType')?.value === TransactionType.TRANSFER) {
      if (walletId === null && currentWalletToId === null) {
        // Both are null, switch the previous selected wallet
        const previousWalletFromId = this.transactionForm.get('walletFromId')?.value;
        if (previousWalletFromId && previousWalletFromId !== null) {
          this.transactionForm.patchValue({ walletToId: previousWalletFromId });
        }
      }
    }
    
    this.transactionForm.patchValue({ walletFromId: walletId });
    
    // Emit wallet change event
    this.emitWalletChange();
    
    // Update wallet options to exclude selected wallets
    this.updateWalletFromOptions();
    this.updateWalletToOptions();
    
    // Trigger validation on both wallet fields for transfer transactions
    this.transactionForm.get('walletFromId')?.updateValueAndValidity();
    this.transactionForm.get('walletToId')?.updateValueAndValidity();
  }

  onFromWalletCleared(): void {
    this.transactionForm.patchValue({ walletFromId: undefined });
    
    // Emit wallet change event
    this.emitWalletChange();
    
    // Update wallet options to exclude selected wallets
    this.updateWalletFromOptions();
    this.updateWalletToOptions();
    
    // Trigger validation on both wallet fields for transfer transactions
    this.transactionForm.get('walletFromId')?.updateValueAndValidity();
    this.transactionForm.get('walletToId')?.updateValueAndValidity();
  }

  onToWalletSelected(walletId: string | null): void {
    const currentWalletFromId = this.transactionForm.get('walletFromId')?.value;
    
    // Handle wallet switching logic for transfers
    if (this.transactionForm.get('transactionType')?.value === TransactionType.TRANSFER) {
      if (walletId === null && currentWalletFromId === null) {
        // Both are null, switch the previous selected wallet
        const previousWalletToId = this.transactionForm.get('walletToId')?.value;
        if (previousWalletToId && previousWalletToId !== null) {
          this.transactionForm.patchValue({ walletFromId: previousWalletToId });
        }
      }
    }
    
    this.transactionForm.patchValue({ walletToId: walletId });
    
    // Emit wallet change event
    this.emitWalletChange();
    
    // Update wallet options to exclude selected wallets
    this.updateWalletFromOptions();
    this.updateWalletToOptions();
    
    // Trigger validation on both wallet fields for transfer transactions
    this.transactionForm.get('walletFromId')?.updateValueAndValidity();
    this.transactionForm.get('walletToId')?.updateValueAndValidity();
  }

  onToWalletCleared(): void {
    this.transactionForm.patchValue({ walletToId: undefined });
    
    // Emit wallet change event
    this.emitWalletChange();
    
    // Update wallet options to exclude selected wallets
    this.updateWalletFromOptions();
    this.updateWalletToOptions();
    
    // Mark field as touched to show validation errors
    this.transactionForm.get('walletToId')?.markAsTouched();
    // Trigger validation on both wallet fields for transfer transactions
    this.transactionForm.get('walletFromId')?.updateValueAndValidity();
    this.transactionForm.get('walletToId')?.updateValueAndValidity();
  }

  onFromWalletTouched(): void {
    // Mark field as touched when dialog closes to show validation errors
    this.transactionForm.get('walletFromId')?.markAsTouched();
    // Trigger validation on both wallet fields for transfer transactions
    this.transactionForm.get('walletFromId')?.updateValueAndValidity();
    this.transactionForm.get('walletToId')?.updateValueAndValidity();
  }

  onToWalletTouched(): void {
    // Mark field as touched when dialog closes to show validation errors
    this.transactionForm.get('walletToId')?.markAsTouched();
    // Trigger validation on both wallet fields for transfer transactions
    this.transactionForm.get('walletFromId')?.updateValueAndValidity();
    this.transactionForm.get('walletToId')?.updateValueAndValidity();
  }

  // Custom validator for transfer transactions
  private walletValidator = (walletType: 'from' | 'to') => {
    return (_control: any) => {
      const transactionType = this.transactionForm.get('transactionType')?.value;

      const walletFromId = this.transactionForm.get('walletFromId')?.value;
      const walletToId = this.transactionForm.get('walletToId')?.value;

      // At least one wallet must be selected and not null
      const hasValidFromWallet = walletFromId && walletFromId !== null;
      const hasValidToWallet = walletToId && walletToId !== null;

      if (walletType === 'from' && transactionType === TransactionType.EXPENSE) {
        if (!hasValidFromWallet) {
          return { walletFromRequired: true };
        }
      }

      if (walletType === 'to' && transactionType === TransactionType.INCOME) {
        if (!hasValidToWallet) {
          return { walletToRequired: true };
        }
      }

      if (transactionType === TransactionType.TRANSFER) {
        if (walletType === 'from' && !hasValidFromWallet && !hasValidToWallet) {
          return { walletFromRequired: true };
        }
        if (walletType === 'to' && !hasValidFromWallet && !hasValidToWallet) {
          return { walletToRequired: true };
        }
      }

      return null;
    };
  };
}
