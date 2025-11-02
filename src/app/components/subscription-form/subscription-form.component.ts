import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  Currency,
  Subscription,
  SubscriptionRequest,
  SubscriptionFrequency,
  Category,
  CategoryList,
  CategoryType,
  Wallet,
  User,
  DayOfWeek,
  MonthOfYear,
} from '@api/models';
import { CategoryService, UserService } from '@api/services';
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
import { SubscriptionStateService } from '../../state/subscription/subscription-state.service';
import { WalletStateService } from '../../state/wallet/wallet-state.service';
import { LoadingService } from '@shared/services/loading.service';
import { filter, take } from 'rxjs/operators';
import { PockitoToggleComponent } from '@shared/components/pockito-toggle/pockito-toggle.component';

// PrimeNG imports
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';

@Component({
  selector: 'app-subscription-form',
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
    CalendarModule,
  ],
  templateUrl: './subscription-form.component.html',
  styleUrl: './subscription-form.component.scss',
})
export class SubscriptionFormComponent implements OnInit {
  @Input() subscriptionId?: string;
  @Output() subscriptionSaved = new EventEmitter<Subscription>();
  @Output() formCancelled = new EventEmitter<void>();

  subscriptionForm: FormGroup;
  currentUser: User | null = null;
  isEditMode: boolean = false;
  isLoading: boolean = false;

  // Available options
  currencies = Object.values(Currency);
  frequencies = Object.values(SubscriptionFrequency);
  daysOfWeek = Object.values(DayOfWeek);
  monthsOfYear = Object.values(MonthOfYear);

  // Data arrays
  categories: Category[] = [];
  wallets: Wallet[] = [];
  defaultWallet: Wallet | null = null;

  // PrimeNG dropdown options
  currencyOptions: any[] = [];
  frequencyOptions: any[] = [];
  dayOfWeekOptions: any[] = [];
  monthOfYearOptions: any[] = [];

  // Dialog options for selectors
  currencyDialogOptions: DialogOption[] = [];
  frequencyDialogOptions: DialogOption[] = [];
  categoryDialogOptions: DialogOption[] = [];
  walletDialogOptions: DialogOption[] = [];
  dayOfWeekDialogOptions: DialogOption[] = [];
  monthOfYearDialogOptions: DialogOption[] = [];

  // Button types and sizes for template
  PockitoButtonType = PockitoButtonType;
  PockitoButtonSize = PockitoButtonSize;

  constructor(
    private fb: FormBuilder,
    private subscriptionState: SubscriptionStateService,
    private walletState: WalletStateService,
    private categoryService: CategoryService,
    private userService: UserService,
    private translate: TranslateService,
    private toastService: ToastService,
    private loadingService: LoadingService
  ) {
    this.subscriptionForm = this.createForm();
  }

  ngOnInit(): void {
    this.isEditMode = !!this.subscriptionId;

    this.initializeDropdownOptions();
    this.loadWallets();
    this.loadCategories();

    this.userService.currentUser$.subscribe((user: User | null) => {
      if (user) {
        this.currentUser = user;
        if (!this.isEditMode) {
          this.subscriptionForm.patchValue({
            currency: user.defaultCurrency ?? undefined,
          });
        }
      }
    });

    if (this.isEditMode && this.subscriptionId) {
      this.loadSubscription(this.subscriptionId);
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
      iconUrl: [
        undefined,
        [
          Validators.pattern(
            /^https?:\/\/.+\.(jpg|jpeg|png|gif|svg|webp)(\?.*)?$/i
          ),
        ],
      ],
      frequency: [undefined, Validators.required],
      interval: [1, [Validators.required, Validators.min(1)]],
      amount: [null, [Validators.required, Validators.min(0)]],
      currency: [undefined, Validators.required],
      startDate: [null, Validators.required],
      endDate: [null],
      isActive: [true],
      categoryId: [undefined, Validators.required],
      dayOfMonth: [null],
      dayOfWeek: [null],
      monthOfYear: [null],
      defaultWalletId: [undefined],
      note: [undefined, Validators.maxLength(500)],
    });

    // Add conditional validators based on frequency
    form.get('frequency')?.valueChanges.subscribe((frequency) => {
      this.updateFrequencyValidators(form, frequency ?? null);
    });

    return form;
  }

  private updateFrequencyValidators(form: FormGroup, frequency: SubscriptionFrequency | null): void {
    const dayOfMonthControl = form.get('dayOfMonth');
    const dayOfWeekControl = form.get('dayOfWeek');
    const monthOfYearControl = form.get('monthOfYear');

    // Reset validators
    dayOfMonthControl?.clearValidators();
    dayOfWeekControl?.clearValidators();
    monthOfYearControl?.clearValidators();

    // Set validators based on frequency
    if (frequency === SubscriptionFrequency.MONTHLY) {
      dayOfMonthControl?.setValidators([Validators.required, Validators.min(1), Validators.max(31)]);
    } else if (frequency === SubscriptionFrequency.WEEKLY) {
      dayOfWeekControl?.setValidators([Validators.required]);
    } else if (frequency === SubscriptionFrequency.YEARLY) {
      monthOfYearControl?.setValidators([Validators.required]);
      dayOfMonthControl?.setValidators([Validators.required, Validators.min(1), Validators.max(31)]);
    }

    dayOfMonthControl?.updateValueAndValidity();
    dayOfWeekControl?.updateValueAndValidity();
    monthOfYearControl?.updateValueAndValidity();
  }

  private loadSubscription(subscriptionId: string): void {
    // Loading is handled by the parent page component subscription to isLoading$
    this.subscriptionState.loadSubscription(subscriptionId);
    this.subscriptionState.currentSubscription$
      .pipe(
        filter((subscription): subscription is Subscription => !!subscription && subscription.id === subscriptionId),
        take(1)
      )
      .subscribe({
        next: (subscription) => {
          this.patchSubscriptionForm(subscription);
        },
        error: (error) => {
          console.error('Error loading subscription:', error);
          this.toastService.showError('subscriptions.loadingSubscriptionError', 'common.loadingErrorMessage');
        },
      });
  }

  private patchSubscriptionForm(subscription: Subscription): void {
    this.subscriptionForm.patchValue({
      name: subscription.name,
      iconUrl: subscription.iconUrl || '',
      frequency: subscription.frequency,
      interval: subscription.interval,
      amount: subscription.amount,
      currency: subscription.currency,
      startDate: this.parseLocalDate(subscription.startDate),
      endDate: this.parseLocalDate(subscription.endDate),
      isActive: subscription.isActive,
      categoryId: subscription.categoryId,
      dayOfMonth: subscription.dayOfMonth,
      dayOfWeek: subscription.dayOfWeek || undefined,
      monthOfYear: subscription.monthOfYear || undefined,
      defaultWalletId: subscription.defaultWalletId,
      note: subscription.note || '',
    });

    // Update validators after patching
    this.updateFrequencyValidators(this.subscriptionForm, subscription.frequency);
  }

  private loadWallets(): void {
    this.walletState.wallets$.subscribe((wallets) => {
      const list = wallets ?? [];
      this.wallets = list;
      this.defaultWallet = list.find((w) => w.isDefault) || null;
      this.updateWalletOptions();
      if (!this.isEditMode) {
        this.setDefaultWalletValue();
      }
    });
    this.walletState.loadWallets();
  }

  private setDefaultWalletValue(): void {
    if (this.defaultWallet) {
      this.subscriptionForm.patchValue({
        defaultWalletId: this.defaultWallet.id,
      });
    }
  }

  private loadCategories(): void {
    // Load expense categories for subscriptions (subscriptions are expenses)
    this.categoryService.getCategoriesByType(CategoryType.EXPENSE).subscribe({
      next: (response: CategoryList) => {
        this.categories = response.categories;
        this.updateCategoryOptions();
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.toastService.showError(
          'subscriptions.loadingCategoriesError',
          error.error?.message || 'Error loading categories'
        );
      },
    });
  }

  private updateWalletOptions(): void {
    this.walletDialogOptions = this.wallets.map((wallet) => ({
      id: wallet.id,
      name: wallet.name,
      iconUrl: wallet.iconUrl || 'pi pi-wallet',
      type: 'WALLET',
      typeLabel: this.translate.instant('common.wallet'),
    }));
  }

  private updateCategoryOptions(): void {
    this.categoryDialogOptions = this.categories.map((category) => ({
      id: category.id,
      name: category.name,
      iconUrl: category.iconUrl || 'pi pi-tag',
      type: 'CATEGORY',
      typeLabel: this.translate.instant('common.category'),
    }));
  }

  onSubmit(): void {
    if (this.subscriptionForm.valid) {
      const formValue = this.subscriptionForm.value;
      const subscriptionData: SubscriptionRequest = {
        name: formValue.name,
        iconUrl: formValue.iconUrl || undefined,
        frequency: formValue.frequency,
        interval: formValue.interval,
        amount: formValue.amount,
      currency: formValue.currency,
      startDate: this.formatLocalDateString(formValue.startDate),
      endDate: formValue.endDate ? this.formatLocalDateString(formValue.endDate) : undefined,
      isActive: formValue.isActive ?? true,
      categoryId: formValue.categoryId,
      dayOfMonth: formValue.dayOfMonth || undefined,
      dayOfWeek: formValue.dayOfWeek || undefined,
      monthOfYear: formValue.monthOfYear || undefined,
        defaultWalletId: formValue.defaultWalletId,
        note: formValue.note || undefined,
      };

      if (this.isEditMode && this.subscriptionId) {
        this.updateSubscription(this.subscriptionId, subscriptionData);
      } else {
        this.createSubscription(subscriptionData);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private formatLocalDateString(date: Date | null): string {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Parses a date from API response without timezone conversion
   * @param dateValue - Date string or Date object from API
   * @returns Date object representing the local date
   */
  private parseLocalDate(dateValue: string | Date | null | undefined): Date | null {
    if (!dateValue) return null;
    if (dateValue instanceof Date) {
      return new Date(dateValue.getFullYear(), dateValue.getMonth(), dateValue.getDate());
    }
    if (typeof dateValue === 'string') {
      // Parse date string and create local date
      const date = new Date(dateValue);
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }
    return null;
  }

  private createSubscription(subscriptionData: SubscriptionRequest): void {
    const loadingId = this.loadingService.show(this.translate.instant('common.loading'));

    this.subscriptionState.createSubscription(subscriptionData).subscribe({
      next: (created) => {
        this.loadingService.hide(loadingId);
        this.subscriptionSaved.emit(created);
        this.toastService.showSuccess(
          'subscriptions.createSubscriptionSuccess',
          'subscriptions.createSubscriptionSuccessMessage',
          { name: created.name }
        );
      },
      error: () => {
        this.loadingService.hide(loadingId);
        this.toastService.showError('subscriptions.createSubscriptionError', 'subscriptions.createSubscriptionErrorMessage');
      },
    });
  }

  private updateSubscription(subscriptionId: string, subscriptionData: SubscriptionRequest): void {
    const loadingId = this.loadingService.show(this.translate.instant('common.loading'));

    this.subscriptionState.updateSubscription(subscriptionId, subscriptionData).subscribe({
      next: (updated) => {
        this.loadingService.hide(loadingId);
        this.subscriptionSaved.emit(updated);
        this.toastService.showSuccess(
          'subscriptions.updateSubscriptionSuccess',
          'subscriptions.updateSubscriptionSuccessMessage',
          { name: updated.name }
        );
      },
      error: () => {
        this.loadingService.hide(loadingId);
        this.toastService.showError('subscriptions.updateSubscriptionError', 'subscriptions.updateSubscriptionErrorMessage');
      },
    });
  }

  onCancel(): void {
    this.formCancelled.emit();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.subscriptionForm.controls).forEach((key) => {
      const control = this.subscriptionForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const control = this.subscriptionForm.get(fieldName);
    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        return this.translate.instant(
          `subscriptions.form.errors.${fieldName}Required`
        );
      }
      if (control.errors['minlength']) {
        return this.translate.instant(
          `subscriptions.form.errors.${fieldName}MinLength`
        );
      }
      if (control.errors['maxlength']) {
        return this.translate.instant(
          `subscriptions.form.errors.${fieldName}MaxLength`
        );
      }
      if (control.errors['min']) {
        return this.translate.instant(`subscriptions.form.errors.${fieldName}Min`);
      }
      if (control.errors['max']) {
        return this.translate.instant(`subscriptions.form.errors.${fieldName}Max`);
      }
      if (control.errors['pattern']) {
        if (fieldName === 'iconUrl') {
          return this.translate.instant('subscriptions.form.errors.iconUrlPattern');
        }
        return this.translate.instant(
          `subscriptions.form.errors.${fieldName}Pattern`
        );
      }
    }
    return '';
  }

  getFrequencyLabel(frequency: SubscriptionFrequency): string {
    return this.translate.instant(`enums.subscriptionFrequency.${frequency}`);
  }

  getCurrencyLabel(currency: Currency): string {
    const label = this.translate.instant(`enums.currency.${currency}`);
    const symbol = getCurrencySymbol(currency);
    return `${label} (${symbol})`;
  }

  getIconUrl(): string {
    return this.subscriptionForm.get('iconUrl')?.value || '';
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

  // Currency selector event handlers
  onCurrencySelected(currency: string | null): void {
    this.subscriptionForm.patchValue({ currency: currency || undefined });
    this.subscriptionForm.get('currency')?.markAsTouched();
  }

  onCurrencyCleared(): void {
    this.subscriptionForm.patchValue({ currency: undefined });
    this.subscriptionForm.get('currency')?.markAsTouched();
  }

  onCurrencyTouched(): void {
    this.subscriptionForm.get('currency')?.markAsTouched();
  }

  // Frequency selector event handlers
  onFrequencySelected(frequency: string | null): void {
    this.subscriptionForm.patchValue({ frequency: frequency || undefined });
    this.subscriptionForm.get('frequency')?.markAsTouched();
    this.updateFrequencyValidators(this.subscriptionForm, frequency as SubscriptionFrequency | null);
  }

  onFrequencyCleared(): void {
    this.subscriptionForm.patchValue({ frequency: undefined });
    this.subscriptionForm.get('frequency')?.markAsTouched();
    this.updateFrequencyValidators(this.subscriptionForm, null);
  }

  onFrequencyTouched(): void {
    this.subscriptionForm.get('frequency')?.markAsTouched();
  }

  // Category selector event handlers
  onCategorySelected(categoryId: string | null): void {
    this.subscriptionForm.patchValue({ categoryId: categoryId || undefined });
    this.subscriptionForm.get('categoryId')?.markAsTouched();
  }

  onCategoryCleared(): void {
    this.subscriptionForm.patchValue({ categoryId: undefined });
    this.subscriptionForm.get('categoryId')?.markAsTouched();
  }

  onCategoryTouched(): void {
    this.subscriptionForm.get('categoryId')?.markAsTouched();
  }

  // Wallet selector event handlers
  onWalletSelected(walletId: string | null): void {
    this.subscriptionForm.patchValue({ defaultWalletId: walletId || undefined });
    this.subscriptionForm.get('defaultWalletId')?.markAsTouched();
  }

  onWalletCleared(): void {
    this.subscriptionForm.patchValue({ defaultWalletId: undefined });
    this.subscriptionForm.get('defaultWalletId')?.markAsTouched();
  }

  onWalletTouched(): void {
    this.subscriptionForm.get('defaultWalletId')?.markAsTouched();
  }

  // Helper methods for template
  getSelectedCurrency(currency?: string): DialogOption | undefined {
    if (!currency) return undefined;
    return this.currencyDialogOptions.find((option) => option.id === currency);
  }

  getSelectedFrequency(frequency?: string): DialogOption | undefined {
    if (!frequency) return undefined;
    return this.frequencyDialogOptions.find((option) => option.id === frequency);
  }

  getSelectedCategory(categoryId?: string): DialogOption | undefined {
    if (!categoryId) return undefined;
    return this.categoryDialogOptions.find((option) => option.id === categoryId);
  }

  getSelectedWallet(walletId?: string): DialogOption | undefined {
    if (!walletId) return undefined;
    return this.walletDialogOptions.find((option) => option.id === walletId);
  }

  getSelectedDayOfWeek(dayOfWeek?: DayOfWeek): DialogOption | undefined {
    if (!dayOfWeek) return undefined;
    return this.dayOfWeekDialogOptions.find((option) => option.id === dayOfWeek);
  }

  getSelectedMonthOfYear(monthOfYear?: MonthOfYear): DialogOption | undefined {
    if (!monthOfYear) return undefined;
    return this.monthOfYearDialogOptions.find((option) => option.id === monthOfYear);
  }

  // Day of week selector event handlers
  onDayOfWeekSelected(dayOfWeek: string | null): void {
    this.subscriptionForm.patchValue({ dayOfWeek: dayOfWeek || undefined });
    this.subscriptionForm.get('dayOfWeek')?.markAsTouched();
  }

  onDayOfWeekCleared(): void {
    this.subscriptionForm.patchValue({ dayOfWeek: undefined });
    this.subscriptionForm.get('dayOfWeek')?.markAsTouched();
  }

  onDayOfWeekTouched(): void {
    this.subscriptionForm.get('dayOfWeek')?.markAsTouched();
  }

  // Month of year selector event handlers
  onMonthOfYearSelected(monthOfYear: string | null): void {
    this.subscriptionForm.patchValue({ monthOfYear: monthOfYear || undefined });
    this.subscriptionForm.get('monthOfYear')?.markAsTouched();
  }

  onMonthOfYearCleared(): void {
    this.subscriptionForm.patchValue({ monthOfYear: undefined });
    this.subscriptionForm.get('monthOfYear')?.markAsTouched();
  }

  onMonthOfYearTouched(): void {
    this.subscriptionForm.get('monthOfYear')?.markAsTouched();
  }

  private initializeDropdownOptions(): void {
    // Initialize currency options for PrimeNG dropdown (keeping for compatibility)
    this.currencyOptions = this.currencies.map((currency) => ({
      label: this.getCurrencyLabel(currency),
      value: currency,
    }));

    // Initialize frequency options for PrimeNG dropdown (keeping for compatibility)
    this.frequencyOptions = this.frequencies.map((frequency) => ({
      label: this.getFrequencyLabel(frequency),
      value: frequency,
    }));

    // Initialize dialog options for pockito selectors
    this.currencyDialogOptions = this.currencies.map((currency) => ({
      id: currency,
      name: this.getCurrencyLabel(currency),
      iconUrl: getCurrencyFlagIcon(currency) || 'pi pi-money-bill',
      type: 'CURRENCY',
      typeLabel: this.translate.instant('common.currency'),
    }));

    this.frequencyDialogOptions = this.frequencies.map((frequency) => ({
      id: frequency,
      name: this.getFrequencyLabel(frequency),
      iconUrl: 'pi pi-calendar',
      fallbackIcon: 'pi pi-calendar',
      type: 'FREQUENCY',
      typeLabel: this.translate.instant('common.frequency'),
    }));

    // Initialize day of week options
    this.dayOfWeekOptions = this.daysOfWeek.map((day) => ({
      label: this.translate.instant(`enums.dayOfWeek.${day}`),
      value: day,
    }));

    this.dayOfWeekDialogOptions = this.daysOfWeek.map((day) => ({
      id: day,
      name: this.translate.instant(`enums.dayOfWeek.${day}`),
      iconUrl: 'pi pi-calendar',
      type: 'DAY_OF_WEEK',
      typeLabel: this.translate.instant('common.dayOfWeek'),
    }));

    // Initialize month of year options
    this.monthOfYearOptions = this.monthsOfYear.map((month) => ({
      label: this.translate.instant(`enums.monthOfYear.${month}`),
      value: month,
    }));

    this.monthOfYearDialogOptions = this.monthsOfYear.map((month) => ({
      id: month,
      name: this.translate.instant(`enums.monthOfYear.${month}`),
      iconUrl: 'pi pi-calendar',
      type: 'MONTH_OF_YEAR',
      typeLabel: this.translate.instant('common.monthOfYear'),
    }));
  }

  // Helper methods for date fields
  isTodaySelected(): boolean {
    const startDate = this.subscriptionForm.get('startDate')?.value;
    if (!startDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(startDate);
    selectedDate.setHours(0, 0, 0, 0);
    return selectedDate.getTime() === today.getTime();
  }

  setQuickDate(type: 'today'| 'yesterday'): void {
    if (type === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      this.subscriptionForm.patchValue({ startDate: today });
    }
    if (type === 'yesterday') {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      this.subscriptionForm.patchValue({ startDate: yesterday });
    }
  }

  // Helper to show conditional fields based on frequency
  shouldShowDayOfMonth(): boolean {
    const frequency = this.subscriptionForm.get('frequency')?.value;
    return frequency === SubscriptionFrequency.MONTHLY || frequency === SubscriptionFrequency.YEARLY;
  }

  shouldShowDayOfWeek(): boolean {
    return this.subscriptionForm.get('frequency')?.value === SubscriptionFrequency.WEEKLY;
  }

  shouldShowMonthOfYear(): boolean {
    return this.subscriptionForm.get('frequency')?.value === SubscriptionFrequency.YEARLY;
  }
}

