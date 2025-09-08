import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { TransactionFormData } from '../models/transaction.types';
import { WalletDto } from '@api/model/wallet.model';
import { Category } from '@api/model/category.model';
import { TransactionFacade } from '../services/transaction.facade';

@Component({
  selector: 'app-create-transaction',
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
    TranslateModule
  ],
  templateUrl: './create-transaction.component.html',
  styleUrl: './create-transaction.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateTransactionComponent implements OnInit, OnDestroy {
  transactionForm!: FormGroup;
  wallets: WalletDto[] = [];
  categories: Category[] = [];
  loading = false;
  isEditMode = false;
  isViewMode = false;
  transactionId: string | null = null;

  transactionTypes = [
    { label: 'Expense', value: 'EXPENSE' },
    { label: 'Income', value: 'INCOME' },
    { label: 'Transfer', value: 'TRANSFER' }
  ];

  private subscriptions = new Subscription();

  constructor(
    private fb: FormBuilder,
    private transactionFacade: TransactionFacade,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadFormData();
    this.checkRouteMode();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
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
  }

  private updateFormValidation(transactionType: string): void {
    const walletFromControl = this.transactionForm.get('walletFromId');
    const walletToControl = this.transactionForm.get('walletToId');
    const categoryControl = this.transactionForm.get('categoryId');

    // Clear previous validators
    walletFromControl?.clearValidators();
    walletToControl?.clearValidators();

    switch (transactionType) {
      case 'EXPENSE':
        walletFromControl?.setValidators([Validators.required]);
        walletToControl?.setValue(null);
        break;
      case 'INCOME':
        walletToControl?.setValidators([Validators.required]);
        walletFromControl?.setValue(null);
        break;
      case 'TRANSFER':
        // At least one wallet must be selected
        walletFromControl?.setValidators([Validators.required]);
        break;
    }

    walletFromControl?.updateValueAndValidity();
    walletToControl?.updateValueAndValidity();
  }

  private loadFormData(): void {
    this.subscriptions.add(
      this.transactionFacade.getFormData$().subscribe(data => {
        this.wallets = data.wallets;
        this.categories = data.categories;
      })
    );
  }

  private checkRouteMode(): void {
    const url = this.router.url;
    if (url.includes('/edit/')) {
      this.isEditMode = true;
      this.transactionId = this.route.snapshot.paramMap.get('id');
      this.loadTransactionForEdit();
    } else if (url.includes('/view/')) {
      this.isViewMode = true;
      this.transactionId = this.route.snapshot.paramMap.get('id');
      this.loadTransactionForView();
    }
  }

  private loadTransactionForEdit(): void {
    if (this.transactionId) {
      // Load transaction data for editing
      // This would typically call a service method to get transaction by ID
      console.log('Loading transaction for edit:', this.transactionId);
    }
  }

  private loadTransactionForView(): void {
    if (this.transactionId) {
      // Load transaction data for viewing
      // This would typically call a service method to get transaction by ID
      console.log('Loading transaction for view:', this.transactionId);
    }
  }

  onSubmit(): void {
    if (this.transactionForm.valid) {
      this.loading = true;
      const formData = this.transactionForm.value;
      
      const transactionData: TransactionFormData = {
        transactionType: formData.transactionType,
        walletFromId: formData.walletFromId,
        walletToId: formData.walletToId,
        amount: formData.amount,
        exchangeRate: formData.exchangeRate,
        note: formData.note,
        effectiveDate: formData.effectiveDate.toISOString().split('T')[0],
        categoryId: formData.categoryId
      };

      if (this.isEditMode && this.transactionId) {
        this.transactionFacade.updateTransaction(this.transactionId, transactionData);
      } else {
        this.transactionFacade.createTransaction(transactionData);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.router.navigate(['/transactions']);
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
    }
    return '';
  }
}
