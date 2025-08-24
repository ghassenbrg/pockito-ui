import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
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
  clearWalletError,
  reorderWallet,
  normalizeDisplayOrders
} from '@state/wallets';
import { Wallet, WALLET_TYPES } from '@shared/models';
import { ModalService } from '@shared/modal/modal.service';
import { WalletFormModalComponent } from '../wallet-form-modal/wallet-form-modal.component';

@Component({
  selector: 'app-wallet-list',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  template: `
    <div class="container mx-auto px-4 py-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 class="text-3xl font-bold text-gray-900">Wallets</h1>
        <div class="flex items-center gap-3 w-full sm:w-auto">
          <!-- View Toggle -->
          <div class="flex items-center bg-gray-100 rounded-lg p-1 flex-1 sm:flex-none view-toggle-container">
            <button 
              (click)="toggleViewMode()"
              [class]="viewMode === 'grid' ? 'view-toggle-active' : 'view-toggle-inactive'"
              class="flex-1 sm:flex-none px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 view-toggle-button">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
              </svg>
              <span class="hidden sm:inline">Grid</span>
            </button>
            <button 
              (click)="toggleViewMode()"
              [class]="viewMode === 'list' ? 'view-toggle-active' : 'view-toggle-inactive'"
              class="flex-1 sm:flex-none px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 view-toggle-button">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
              </svg>
              <span class="hidden sm:inline">List</span>
            </button>
          </div>
          
          <button 
            (click)="openCreateModal()"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            <span class="hidden sm:inline">New Wallet</span>
            <span class="sm:hidden">New</span>
          </button>
          
          <!-- Debug/Utility Buttons -->
          <button 
            (click)="refreshWallets()"
            class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg flex items-center gap-2 transition-colors"
            title="Refresh wallets">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            <span class="hidden sm:inline">Refresh</span>
          </button>
          
          <button 
            (click)="normalizeDisplayOrders()"
            class="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-3 py-2 rounded-lg flex items-center gap-2 transition-colors"
            title="Normalize display orders">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
            </svg>
            <span class="hidden sm:inline">Fix Order</span>
          </button>
        </div>
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

      <!-- Grid View -->
      <div *ngIf="!(loading$ | async) && (wallets$ | async)?.length && viewMode === 'grid'" 
           class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in"
           cdkDropList
           (cdkDropListDropped)="onDrop($event)">
        <div 
          *ngFor="let wallet of wallets$ | async; trackBy: trackByWalletId" 
          class="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow wallet-card-hover"
          [style.border-left-color]="wallet.color || '#3B82F6'"
          [style.border-left-width]="'4px'"
          cdkDrag>
          
          <!-- Drag Handle -->
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
            <div class="flex items-center gap-2">
              <div *ngIf="wallet.isDefault" class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                Default
              </div>
              <div class="cursor-move text-gray-400 hover:text-gray-600 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path>
                </svg>
              </div>
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

      <!-- List View -->
      <div *ngIf="!(loading$ | async) && (wallets$ | async)?.length && viewMode === 'list'" 
           class="space-y-3 animate-fade-in"
           cdkDropList
           (cdkDropListDropped)="onDrop($event)">
        <div 
          *ngFor="let wallet of wallets$ | async; trackBy: trackByWalletId" 
          class="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow p-4 wallet-list-item"
          [style.border-left-color]="wallet.color || '#3B82F6'"
          [style.border-left-width]="'4px'"
          cdkDrag>
          
          <div class="flex items-center justify-between">
            <!-- Left side: Icon, Name, Type -->
            <div class="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
              <div class="text-xl sm:text-2xl flex-shrink-0">
                <span *ngIf="wallet.iconType === 'EMOJI'">{{ wallet.iconValue }}</span>
                <img *ngIf="wallet.iconType === 'URL'" 
                     [src]="wallet.iconValue" 
                     [alt]="wallet.name + ' icon'"
                     class="w-6 h-6 sm:w-8 sm:h-8 object-contain rounded"
                     (error)="onImageError($event)">
              </div>
              
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="font-semibold text-gray-900 truncate text-sm sm:text-base">{{ wallet.name }}</h3>
                  <div *ngIf="wallet.isDefault" class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex-shrink-0">
                    Default
                  </div>
                </div>
                <p class="text-xs sm:text-sm text-gray-500">{{ getWalletTypeLabel(wallet.type) }}</p>
              </div>
            </div>

            <!-- Center: Financial Info (hidden on mobile) -->
            <div class="hidden md:flex flex-col items-end text-right flex-1">
              <div class="text-lg font-semibold text-gray-900">
                {{ wallet.initialBalance | currency:wallet.currencyCode }}
              </div>
              <div class="text-sm text-gray-500">{{ wallet.currencyCode }}</div>
              <div *ngIf="wallet.goalAmount" class="text-xs text-gray-400">
                Goal: {{ wallet.goalAmount | currency:wallet.currencyCode }}
              </div>
            </div>

            <!-- Right side: Actions -->
            <div class="flex items-center gap-1 sm:gap-2 ml-2 sm:ml-4">
              <div class="cursor-move text-gray-400 hover:text-gray-600 transition-colors mr-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path>
                </svg>
              </div>
              
              <button 
                (click)="viewWallet(wallet.id)"
                class="p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                title="View">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
              </button>
              
              <button 
                (click)="editWallet(wallet)"
                class="p-1.5 sm:p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="Edit">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              </button>
              
              <button 
                *ngIf="!wallet.isDefault"
                (click)="setAsDefault(wallet.id)"
                [disabled]="settingDefault$ | async"
                class="p-1.5 sm:p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
                title="Set as Default">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </button>
              
              <button 
                (click)="confirmArchive(wallet)"
                [disabled]="archiving$ | async"
                class="p-1.5 sm:p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                title="Archive">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- Mobile Financial Info (shown below on mobile) -->
          <div class="md:hidden mt-3 pt-3 border-t border-gray-100">
            <div class="flex justify-between items-center">
              <div class="text-sm text-gray-500">Balance</div>
              <div class="text-lg font-semibold text-gray-900">
                {{ wallet.initialBalance | currency:wallet.currencyCode }}
              </div>
            </div>
            <div *ngIf="wallet.goalAmount" class="flex justify-between items-center mt-1">
              <div class="text-sm text-gray-500">Goal</div>
              <div class="text-sm text-gray-700">
                {{ wallet.goalAmount | currency:wallet.currencyCode }}
              </div>
            </div>
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
  styles: [
    `
      .view-toggle-transition {
        transition: all 0.2s ease-in-out;
      }
      
      .view-toggle-active {
        background-color: white;
        color: #111827;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
      }
      
      .view-toggle-inactive {
        color: #6b7280;
      }
      
      .view-toggle-inactive:hover {
        color: #374151;
      }
      
      @media (max-width: 640px) {
        .view-toggle-container {
          width: 100%;
        }
        
        .view-toggle-button {
          flex: 1;
          justify-content: center;
        }
      }
      
      .wallet-card-hover {
        transition: all 0.2s ease-in-out;
      }
      
      .wallet-card-hover:hover {
        transform: translateY(-1px);
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      }
      
      .wallet-list-item {
        transition: all 0.15s ease-in-out;
      }
      
      .wallet-list-item:hover {
        transform: translateX(2px);
      }
      
      .animate-fade-in {
        animation: fadeIn 0.3s ease-in-out;
      }
      
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .view-mode-transition {
        transition: all 0.3s ease-in-out;
      }

      /* Drag and Drop Styles */
      .cdk-drag-preview {
        box-sizing: border-box;
        border-radius: 4px;
        box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2),
                    0 8px 10px 1px rgba(0, 0, 0, 0.14),
                    0 3px 14px 2px rgba(0, 0, 0, 0.12);
      }

      .cdk-drag-placeholder {
        opacity: 0;
      }

      .cdk-drag-animating {
        transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
      }

      .cdk-drop-list-dragging .wallet-card-hover:not(.cdk-drag-placeholder) {
        transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
      }

      .cdk-drop-list-dragging .wallet-list-item:not(.cdk-drag-placeholder) {
        transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
      }
    `
  ]
})
export class WalletListComponent implements OnInit, OnDestroy {
  wallets$ = this.store.select(selectAllWallets);
  loading$ = this.store.select(selectWalletsLoading);
  error$ = this.store.select(selectWalletsError);
  archiving$ = this.store.select(selectWalletArchiving);
  settingDefault$ = this.store.select(selectWalletSettingDefault);

  // View toggle functionality
  viewMode: 'grid' | 'list' = 'grid';
  isMobile = false;

  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private router: Router,
    private modalService: ModalService
  ) {
    // Set default view based on screen size
    this.setDefaultView();
    // Listen for window resize
    window.addEventListener('resize', () => this.setDefaultView());
  }

  ngOnInit(): void {
    this.loadWallets();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    window.removeEventListener('resize', () => this.setDefaultView());
  }

  private setDefaultView(): void {
    this.isMobile = window.innerWidth < 768; // md breakpoint
    this.viewMode = this.isMobile ? 'list' : 'grid';
  }

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
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

  normalizeDisplayOrders(): void {
    if (confirm('This will normalize display orders to ensure they are sequential starting from 1. Continue?')) {
      this.store.dispatch(normalizeDisplayOrders());
    }
  }

  refreshWallets(): void {
    this.loadWallets();
  }

  openCreateModal(): void {
    this.modalService.openComponent(WalletFormModalComponent, {
      id: 'create-wallet-modal',
      title: 'Create New Wallet',
      data: { mode: 'create' }
    }).subscribe(result => {
      if (result?.confirmed) {
        // Modal was closed successfully, refresh wallets
        this.loadWallets();
      }
    });
  }

  openEditModal(wallet: Wallet): void {
    this.modalService.openComponent(WalletFormModalComponent, {
      id: 'edit-wallet-modal',
      title: 'Edit Wallet',
      data: { mode: 'edit', wallet }
    }).subscribe(result => {
      if (result?.confirmed) {
        // Modal was closed successfully, refresh wallets
        this.loadWallets();
      }
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

  onDrop(event: CdkDragDrop<Wallet[]>): void {
    if (event.previousIndex === event.currentIndex) {
      return;
    }
    
    // Get current wallets from the store
    this.wallets$.subscribe(wallets => {
      if (wallets && wallets.length > 0) {
        const wallet = wallets[event.previousIndex];
        const newOrder = event.currentIndex + 1; // +1 because display order starts at 1
        
        // Validate the new order is within bounds
        if (newOrder < 1 || newOrder > wallets.length) {
          return;
        }
        
        // Dispatch reorder action
        this.store.dispatch(reorderWallet({ id: wallet.id, newOrder }));
      }
    }).unsubscribe();
  }

  trackByWalletId(index: number, wallet: Wallet): string {
    return wallet.id;
  }
}
