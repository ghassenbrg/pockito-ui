import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { 
  selectSelectedWallet, 
  selectWalletsLoading, 
  selectWalletsError 
} from '@state/wallets';
import { loadWallet, clearSelectedWallet } from '@state/wallets';

@Component({
  selector: 'app-wallet-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mx-auto px-4 py-6">
      <!-- Back Button -->
      <div class="mb-6">
        <button 
          (click)="goBack()"
          class="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Back to Wallets
        </button>
      </div>

      <!-- Error Banner -->
      <div *ngIf="error$ | async as error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <div class="flex justify-between items-center">
          <span>{{ error }}</span>
          <button (click)="goBack()" class="text-red-700 hover:text-red-900">
            Go Back
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading$ | async" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <!-- Wallet Detail Content -->
      <div *ngIf="!(loading$ | async) && (wallet$ | async) as wallet" class="bg-white rounded-lg shadow-md p-6">
        <!-- Wallet Header -->
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-4">
            <div class="text-4xl">
              <span *ngIf="wallet.iconType === 'EMOJI'">{{ wallet.iconValue }}</span>
              <img *ngIf="wallet.iconType === 'URL'" 
                   [src]="wallet.iconValue" 
                   [alt]="wallet.name + ' icon'"
                   class="w-12 h-12 object-contain rounded"
                   (error)="onImageError($event)">
            </div>
            <div>
              <h1 class="text-3xl font-bold text-gray-900">{{ wallet.name }}</h1>
              <p class="text-lg text-gray-500">{{ getWalletTypeLabel(wallet.type) }}</p>
            </div>
          </div>
          <div class="flex gap-2">
            <button 
              (click)="editWallet(wallet)"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
              Edit Wallet
            </button>
            <button 
              (click)="goBack()"
              class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition-colors">
              Close
            </button>
          </div>
        </div>

        <!-- Wallet Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div class="space-y-4">
            <div class="bg-gray-50 p-4 rounded-lg">
              <h3 class="font-semibold text-gray-900 mb-2">Basic Information</h3>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-gray-600">Type:</span>
                  <span class="font-medium text-gray-900">{{ getWalletTypeLabel(wallet.type) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Currency:</span>
                  <span class="font-medium text-gray-900">{{ wallet.currencyCode }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Status:</span>
                  <span class="font-medium text-gray-900">
                    <span *ngIf="wallet.isDefault" class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      Default
                    </span>
                    <span *ngIf="!wallet.isDefault" class="text-gray-500">Active</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <div class="bg-gray-50 p-4 rounded-lg">
              <h3 class="font-semibold text-gray-900 mb-2">Financial Details</h3>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-gray-600">Initial Balance:</span>
                  <span class="font-medium text-gray-900">
                    {{ wallet.initialBalance | currency:wallet.currencyCode }}
                  </span>
                </div>
                <div *ngIf="wallet.goalAmount" class="flex justify-between">
                  <span class="text-gray-600">Goal Amount:</span>
                  <span class="font-medium text-gray-900">
                    {{ wallet.goalAmount | currency:wallet.currencyCode }}
                  </span>
                </div>
                <div *ngIf="wallet.goalAmount" class="flex justify-between">
                  <span class="text-gray-600">Progress:</span>
                  <span class="font-medium text-gray-900">
                    {{ (wallet.initialBalance / wallet.goalAmount * 100) | number:'1.0-1' }}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Additional Actions -->
        <div class="border-t border-gray-200 pt-6">
          <h3 class="font-semibold text-gray-900 mb-4">Actions</h3>
          <div class="flex gap-3">
            <button 
              *ngIf="!wallet.isDefault"
              (click)="setAsDefault(wallet.id)"
              class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
              Set as Default
            </button>
            <button 
              (click)="confirmArchive(wallet)"
              class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
              Archive Wallet
            </button>
          </div>
        </div>

        <!-- Placeholder for future content -->
        <div class="mt-8 p-6 bg-gray-50 rounded-lg text-center">
          <div class="text-gray-400 mb-2">
            <svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
          </div>
          <h4 class="text-lg font-medium text-gray-900 mb-2">More Features Coming Soon</h4>
          <p class="text-gray-500">
            Transaction history, charts, and detailed analytics will be available in future updates.
          </p>
        </div>
      </div>

      <!-- Not Found State -->
      <div *ngIf="!(loading$ | async) && !(wallet$ | async)" class="text-center py-12">
        <div class="text-gray-400 mb-4">
          <svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33"></path>
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Wallet Not Found</h3>
        <p class="text-gray-500 mb-4">The wallet you're looking for doesn't exist or has been archived.</p>
        <button 
          (click)="goBack()"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
          Back to Wallets
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class WalletDetailComponent implements OnInit, OnDestroy {
  wallet$ = this.store.select(selectSelectedWallet);
  loading$ = this.store.select(selectWalletsLoading);
  error$ = this.store.select(selectWalletsError);

  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const id = params['id'];
      if (id) {
        this.store.dispatch(loadWallet({ id }));
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.store.dispatch(clearSelectedWallet());
  }

  goBack(): void {
    this.router.navigate(['/wallets']);
  }

  editWallet(_wallet: any): void {
    // TODO: Implement edit modal
    // console.log('Edit wallet:', _wallet);
  }

  setAsDefault(_id: string): void {
    // TODO: Implement set default action
    // console.log('Set as default:', _id);
  }

  confirmArchive(wallet: any): void {
    if (confirm(`Are you sure you want to archive "${wallet.name}"? This action can be undone.`)) {
      // TODO: Implement archive action
      // console.log('Archive wallet:', wallet.id);
    }
  }

  getWalletTypeLabel(type: string): string {
    const walletTypes = [
      { value: 'SAVINGS', label: 'Savings' },
      { value: 'BANK_ACCOUNT', label: 'Bank Account' },
      { value: 'CASH', label: 'Cash' },
      { value: 'CREDIT_CARD', label: 'Credit Card' },
      { value: 'CUSTOM', label: 'Custom' }
    ];
    const walletType = walletTypes.find(t => t.value === type);
    return walletType?.label || type;
  }

  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    // Replace the broken image with a fallback emoji
    const parentDiv = imgElement.parentElement;
    if (parentDiv) {
      parentDiv.innerHTML = '<span class="text-4xl">🏦</span>';
    }
  }
}
