import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { 
  selectAllWallets, 
  selectWalletsLoading, 
  selectWalletsError,
  selectWalletArchiving,
  selectWalletSettingDefault
} from '@state/wallets';
import { 
  loadWallets, 
  archiveWallet, 
  setDefaultWallet,
  clearWalletError 
} from '@state/wallets';
import { Wallet, WALLET_TYPES } from '@shared/models';
import { ModalService } from '@shared/modal/modal.service';
import { WalletFormModalComponent } from '../wallet-form-modal/wallet-form-modal.component';

@Component({
  selector: 'app-wallet-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mx-auto px-4 py-6">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-900">Wallets</h1>
        <button 
          (click)="openCreateModal()"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          New Wallet
        </button>
      </div>

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

      <!-- Loading State -->
      <div *ngIf="loading$ | async" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <!-- Wallets Grid -->
      <div *ngIf="!(loading$ | async) && (wallets$ | async)?.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          *ngFor="let wallet of wallets$ | async" 
          class="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
          [style.border-left-color]="wallet.color || '#3B82F6'"
          [style.border-left-width]="'4px'">
          
          <!-- Wallet Header -->
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="text-2xl">
                <span *ngIf="wallet.iconType === 'EMOJI'">{{ wallet.iconValue }}</span>
                <img *ngIf="wallet.iconType === 'URL'" 
                     [src]="wallet.iconValue" 
                     [alt]="wallet.name + ' icon'"
                     class="w-8 h-8 object-contain rounded"
                     (error)="onImageError($event)">
              </div>
              <div>
                <h3 class="font-semibold text-gray-900">{{ wallet.name }}</h3>
                <p class="text-sm text-gray-500">{{ getWalletTypeLabel(wallet.type) }}</p>
              </div>
            </div>
            <div *ngIf="wallet.isDefault" class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              Default
            </div>
          </div>

          <!-- Wallet Details -->
          <div class="space-y-2 mb-4">
            <div class="flex justify-between">
              <span class="text-gray-600">Balance:</span>
              <span class="font-medium text-gray-900">
                {{ wallet.initialBalance | currency:wallet.currencyCode }}
              </span>
            </div>
            <div *ngIf="wallet.goalAmount" class="flex justify-between">
              <span class="text-gray-600">Goal:</span>
              <span class="font-medium text-gray-900">
                {{ wallet.goalAmount | currency:wallet.currencyCode }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Currency:</span>
              <span class="font-medium text-gray-900">{{ wallet.currencyCode }}</span>
            </div>
          </div>

          <!-- Wallet Actions -->
          <div class="flex gap-2">
            <button 
              (click)="viewWallet(wallet.id)"
              class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded text-sm transition-colors">
              View
            </button>
            <button 
              (click)="editWallet(wallet)"
              class="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded text-sm transition-colors">
              Edit
            </button>
            <button 
              *ngIf="!wallet.isDefault"
              (click)="setAsDefault(wallet.id)"
              [disabled]="settingDefault$ | async"
              class="flex-1 bg-green-100 hover:bg-green-200 text-green-700 px-3 py-2 rounded text-sm transition-colors disabled:opacity-50">
              {{ (settingDefault$ | async) ? 'Setting...' : 'Set Default' }}
            </button>
            <button 
              (click)="confirmArchive(wallet)"
              [disabled]="archiving$ | async"
              class="flex-1 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded text-sm transition-colors disabled:opacity-50">
              {{ (archiving$ | async) ? 'Archiving...' : 'Archive' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!(loading$ | async) && !(wallets$ | async)?.length" class="text-center py-12">
        <div class="text-gray-400 mb-4">
          <svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No wallets yet</h3>
        <p class="text-gray-500 mb-4">Get started by creating your first wallet to track your finances.</p>
        <button 
          (click)="openCreateModal()"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
          Create Wallet
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
export class WalletListComponent implements OnInit, OnDestroy {
  wallets$ = this.store.select(selectAllWallets);
  loading$ = this.store.select(selectWalletsLoading);
  error$ = this.store.select(selectWalletsError);
  archiving$ = this.store.select(selectWalletArchiving);
  settingDefault$ = this.store.select(selectWalletSettingDefault);

  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private router: Router,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.loadWallets();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadWallets(): void {
    this.store.dispatch(loadWallets());
  }

  viewWallet(id: string): void {
    this.router.navigate(['/wallets', id]);
  }

  editWallet(wallet: Wallet): void {
    this.openEditModal(wallet);
  }

  setAsDefault(id: string): void {
    this.store.dispatch(setDefaultWallet({ id }));
  }

  confirmArchive(wallet: Wallet): void {
    if (confirm(`Are you sure you want to archive "${wallet.name}"? This action can be undone.`)) {
      this.store.dispatch(archiveWallet({ id: wallet.id }));
    }
  }

  openCreateModal(): void {
    this.modalService.openComponent(WalletFormModalComponent, {
      id: 'create-wallet-modal',
      title: 'Create New Wallet',
      data: { mode: 'create' }
    });
  }

  openEditModal(wallet: Wallet): void {
    this.modalService.openComponent(WalletFormModalComponent, {
      id: 'edit-wallet-modal',
      title: 'Edit Wallet',
      data: { mode: 'edit', wallet }
    });
  }

  clearError(): void {
    this.store.dispatch(clearWalletError());
  }

  getWalletTypeLabel(type: string): string {
    const walletType = WALLET_TYPES.find(t => t.value === type);
    return walletType?.label || type;
  }

  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    // Replace the broken image with a fallback emoji
    const parentDiv = imgElement.parentElement;
    if (parentDiv) {
      parentDiv.innerHTML = '<span class="text-2xl">🏦</span>';
    }
  }
}
