import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { 
  selectWalletCreating, 
  selectWalletUpdating, 
  selectWalletsError 
} from '@state/wallets';
import { 
  createWallet, 
  updateWallet, 
  clearWalletError 
} from '@state/wallets';
import { 
  Wallet, 
  CreateWalletRequest, 
  UpdateWalletRequest, 
  WALLET_TYPES 
} from '@shared/models';
import { IconPickerComponent } from '@shared/icon-picker';

export interface WalletFormData {
  mode: 'create' | 'edit';
  wallet?: Wallet;
}

@Component({
  selector: 'app-wallet-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconPickerComponent],
  template: `
    <div class="p-6 max-w-4xl mx-auto">
      <!-- Error Banner -->
      <div *ngIf="error$ | async as error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <div class="flex justify-between items-center">
          <span>{{ error }}</span>
          <button (click)="clearError()" class="text-red-700 hover:text-red-900">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Form -->
      <form [formGroup]="walletForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <!-- Basic Information -->
        <div class="space-y-4">
          <h3 class="text-lg font-medium text-gray-900">Basic Information</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Name -->
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
                Wallet Name *
              </label>
              <input
                id="name"
                type="text"
                formControlName="name"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter wallet name">
              <div *ngIf="walletForm.get('name')?.invalid && walletForm.get('name')?.touched" 
                   class="text-red-600 text-sm mt-1">
                Wallet name is required
              </div>
            </div>

            <!-- Type -->
            <div>
              <label for="type" class="block text-sm font-medium text-gray-700 mb-1">
                Wallet Type *
              </label>
              <select
                id="type"
                formControlName="type"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Select wallet type</option>
                <option *ngFor="let walletType of walletTypes" [value]="walletType.value">
                  {{ walletType.label }}
                </option>
              </select>
              <div *ngIf="walletForm.get('type')?.invalid && walletForm.get('type')?.touched" 
                   class="text-red-600 text-sm mt-1">
                Wallet type is required
              </div>
            </div>
          </div>

          <!-- Icon -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Wallet Icon *
            </label>
            <app-icon-picker
              [config]="{ showEmoji: true, showUrl: true }"
              [value]="iconValue"
              (iconChange)="onIconChange($event)">
            </app-icon-picker>
            <div *ngIf="!iconValue" class="text-red-600 text-sm mt-1">
              Please select an icon
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Currency -->
            <div>
              <label for="currencyCode" class="block text-sm font-medium text-gray-700 mb-1">
                Currency *
              </label>
              <select
                id="currencyCode"
                formControlName="currencyCode"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Select currency</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="JPY">JPY - Japanese Yen</option>
                <option value="CAD">CAD - Canadian Dollar</option>
                <option value="AUD">AUD - Australian Dollar</option>
                <option value="CHF">CHF - Swiss Franc</option>
              </select>
              <div *ngIf="walletForm.get('currencyCode')?.invalid && walletForm.get('currencyCode')?.touched" 
                   class="text-red-600 text-sm mt-1">
                Currency is required
              </div>
            </div>

            <!-- Color -->
            <div>
              <label for="color" class="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <input
                id="color"
                type="color"
                formControlName="color"
                class="w-16 h-10 border border-gray-300 rounded-lg cursor-pointer">
            </div>
          </div>
        </div>

        <!-- Financial Information -->
        <div class="space-y-4">
          <h3 class="text-lg font-medium text-gray-900">Financial Information</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Initial Balance (Create mode only) -->
            <div *ngIf="!isEditMode">
              <label for="initialBalance" class="block text-sm font-medium text-gray-700 mb-1">
                Initial Balance
              </label>
              <input
                id="initialBalance"
                type="number"
                formControlName="initialBalance"
                step="0.01"
                min="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00">
            </div>

            <!-- Goal Amount (Savings only) -->
            <div *ngIf="walletForm.get('type')?.value === 'SAVINGS'">
              <label for="goalAmount" class="block text-sm font-medium text-gray-700 mb-1">
                Goal Amount
              </label>
              <input
                id="goalAmount"
                type="number"
                formControlName="goalAmount"
                step="0.01"
                min="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter goal amount">
            </div>
          </div>

          <!-- Set as Default (Create mode only) -->
          <div *ngIf="!isEditMode" class="flex items-center">
            <input
              id="setDefault"
              type="checkbox"
              formControlName="setDefault"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
            <label for="setDefault" class="ml-2 block text-sm text-gray-700">
              Set as default wallet
            </label>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            (click)="onCancel()"
            class="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors">
            Cancel
          </button>
          <button
            type="submit"
            [disabled]="walletForm.invalid || (creating$ | async) || (updating$ | async)"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors">
            <span *ngIf="creating$ | async">Creating...</span>
            <span *ngIf="updating$ | async">Updating...</span>
            <span *ngIf="!(creating$ | async) && !(updating$ | async)">
              {{ isEditMode ? 'Update Wallet' : 'Create Wallet' }}
            </span>
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class WalletFormModalComponent implements OnInit, OnDestroy, OnChanges {
  @Input() data: WalletFormData = { mode: 'create' };
  @Output() cancel = new EventEmitter<void>();
  @Output() success = new EventEmitter<Wallet>();

  walletForm: FormGroup;
  iconValue: any = null;
  walletTypes = WALLET_TYPES;

  creating$ = this.store.select(selectWalletCreating);
  updating$ = this.store.select(selectWalletUpdating);
  error$ = this.store.select(selectWalletsError);

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private store: Store
  ) {
    this.walletForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      type: ['', Validators.required],
      currencyCode: ['', [Validators.required, Validators.pattern(/^[A-Z]{3}$/)]],
      color: ['#3B82F6'],
      initialBalance: [0, [Validators.min(0)]],
      goalAmount: [null, [Validators.min(0)]],
      setDefault: [false]
    });
  }

  ngOnInit(): void {
    this.initializeForm();

    // Watch for type changes to show/hide goal amount
    this.walletForm.get('type')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(type => {
      const goalAmountControl = this.walletForm.get('goalAmount');
      if (type === 'SAVINGS') {
        goalAmountControl?.enable();
      } else {
        goalAmountControl?.disable();
        goalAmountControl?.setValue(null);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && changes['data'].currentValue) {
      // Use setTimeout to ensure the component is fully initialized
      setTimeout(() => {
        this.initializeForm();
      }, 0);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get isEditMode(): boolean {
    return this.data.mode === 'edit';
  }

  private initializeForm(): void {
    // Reset form to initial state
    this.walletForm.reset({
      name: '',
      type: '',
      currencyCode: '',
      color: '#3B82F6',
      initialBalance: 0,
      goalAmount: null,
      setDefault: false
    });

    // Reset icon value
    this.iconValue = null;

    // Populate form if in edit mode
    if (this.isEditMode && this.data.wallet) {
      this.populateForm(this.data.wallet);
    }
  }

  populateForm(wallet: Wallet): void {
    this.walletForm.patchValue({
      name: wallet.name,
      type: wallet.type,
      currencyCode: wallet.currencyCode,
      color: wallet.color || '#3B82F6'
    });

    if (wallet.goalAmount) {
      this.walletForm.patchValue({
        goalAmount: wallet.goalAmount
      });
    }

    this.iconValue = {
      type: wallet.iconType,
      value: wallet.iconValue
    };
  }

  onIconChange(icon: any): void {
    this.iconValue = icon;
  }

  onSubmit(): void {
    if (this.walletForm.valid && this.iconValue) {
      const formValue = this.walletForm.value;

      if (this.isEditMode && this.data.wallet) {
        const updateData: UpdateWalletRequest = {
          name: formValue.name,
          iconType: this.iconValue.type,
          iconValue: this.iconValue.value,
          currencyCode: formValue.currencyCode,
          color: formValue.color,
          type: formValue.type,
          goalAmount: formValue.goalAmount
        };
        this.store.dispatch(updateWallet({ id: this.data.wallet!.id, wallet: updateData }));
      } else {
        const createData: CreateWalletRequest = {
          name: formValue.name,
          iconType: this.iconValue.type,
          iconValue: this.iconValue.value,
          currencyCode: formValue.currencyCode,
          color: formValue.color,
          type: formValue.type,
          initialBalance: formValue.initialBalance,
          goalAmount: formValue.goalAmount,
          setDefault: formValue.setDefault
        };
        this.store.dispatch(createWallet({ wallet: createData }));
      }
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  clearError(): void {
    this.store.dispatch(clearWalletError());
  }
}
