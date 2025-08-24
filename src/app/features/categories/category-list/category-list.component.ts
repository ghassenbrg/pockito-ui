import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { 
  selectAllCategories, 
  selectActiveCategories,
  selectCategoriesLoading, 
  selectCategoriesError,
  selectCategoryArchiving,
  selectCategoryActivating,
  selectExpenseCategories,
  selectIncomeCategories,
  selectActiveExpenseCategories,
  selectActiveIncomeCategories
} from '@state/categories';
import { 
  loadCategories, 
  archiveCategory, 
  activateCategory,
  clearCategoryError
} from '@state/categories';
import { Category, CATEGORY_TYPES } from '@shared/models';
import { ModalService } from '@shared/modal/modal.service';
import { CategoryFormModalComponent } from '../category-form-modal/category-form-modal.component';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mx-auto px-4 py-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 class="text-3xl font-bold text-gray-900">Categories</h1>
        <div class="flex items-center gap-3 w-full sm:w-auto">
          <!-- Type Filter -->
          <div class="flex items-center bg-gray-100 rounded-lg p-1">
            <button 
              (click)="setTypeFilter('ALL')"
              [class]="typeFilter === 'ALL' ? 'type-filter-active' : 'type-filter-inactive'"
              class="px-3 py-2 rounded-md text-sm font-medium transition-all duration-200">
              All
            </button>
            <button 
              (click)="setTypeFilter('EXPENSE')"
              [class]="typeFilter === 'EXPENSE' ? 'type-filter-active' : 'type-filter-inactive'"
              class="px-3 py-2 rounded-md text-sm font-medium transition-all duration-200">
              Expense
            </button>
            <button 
              (click)="setTypeFilter('INCOME')"
              [class]="typeFilter === 'INCOME' ? 'type-filter-active' : 'type-filter-inactive'"
              class="px-3 py-2 rounded-md text-sm font-medium transition-all duration-200">
              Income
            </button>
          </div>
          
          <!-- Show Archived Toggle -->
          <div class="flex items-center gap-2">
            <input
              type="checkbox"
              id="showArchived"
              [(ngModel)]="showArchived"
              (change)="onShowArchivedChange()"
              class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500">
            <label for="showArchived" class="text-sm text-gray-700">Show Archived</label>
          </div>
          
          <button 
            (click)="openCreateModal()"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            <span class="hidden sm:inline">New Category</span>
            <span class="sm:hidden">New</span>
          </button>
          
          <button 
            (click)="refreshCategories()"
            class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg flex items-center gap-2 transition-colors"
            title="Refresh categories">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            <span class="hidden sm:inline">Refresh</span>
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

      <!-- Categories Grid -->
      <div *ngIf="!(loading$ | async) && (filteredCategories$ | async)?.length" 
           class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
        <div 
          *ngFor="let category of filteredCategories$ | async; trackBy: trackByCategoryId" 
          class="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow category-card-hover"
          [style.border-left-color]="category.color || '#6B73FF'"
          [style.border-left-width]="'4px'"
          [class.opacity-60]="!category.isActive">
          
          <!-- Category Header -->
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="text-2xl">
                <span *ngIf="category.iconType === 'EMOJI'">{{ category.iconValue }}</span>
                <img *ngIf="category.iconType === 'URL'" 
                     [src]="category.iconValue" 
                     [alt]="category.name + ' icon'"
                     class="w-8 h-8 object-contain rounded"
                     (error)="onImageError($event)">
              </div>
              <div>
                <h3 class="font-semibold text-gray-900">{{ category.name }}</h3>
                <p class="text-sm text-gray-500">{{ getCategoryTypeLabel(category.type) }}</p>
                <p *ngIf="category.parentName" class="text-xs text-gray-400">
                  Parent: {{ category.parentName }}
                </p>
              </div>
            </div>
            <div class="flex flex-col items-end gap-2">
              <div class="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                {{ category.type }}
              </div>
              <div *ngIf="!category.isActive" class="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                Archived
              </div>
            </div>
          </div>

          <!-- Category Details -->
          <div class="space-y-2 mb-4">
            <div class="flex justify-between">
              <span class="text-gray-600">Type:</span>
              <span class="font-medium text-gray-900">{{ getCategoryTypeLabel(category.type) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Color:</span>
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 rounded border border-gray-300" [style.background-color]="category.color || '#6B73FF'"></div>
                <span class="text-sm text-gray-600">{{ category.color || '#6B73FF' }}</span>
              </div>
            </div>
            <div *ngIf="category.parentName" class="flex justify-between">
              <span class="text-gray-600">Parent:</span>
              <span class="font-medium text-gray-900">{{ category.parentName }}</span>
            </div>
          </div>

          <!-- Category Actions -->
          <div class="flex gap-2">
            <button 
              (click)="editCategory(category)"
              [disabled]="!category.isActive"
              class="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              Edit
            </button>
            <button 
              *ngIf="category.isActive"
              (click)="confirmArchive(category)"
              [disabled]="archiving$ | async"
              class="flex-1 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded text-sm transition-colors disabled:opacity-50">
              {{ (archiving$ | async) ? 'Archiving...' : 'Archive' }}
            </button>
            <button 
              *ngIf="!category.isActive"
              (click)="confirmActivate(category)"
              [disabled]="activating$ | async"
              class="flex-1 bg-green-100 hover:bg-green-200 text-green-700 px-3 py-2 rounded text-sm transition-colors disabled:opacity-50">
              {{ (activating$ | async) ? 'Activating...' : 'Activate' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!(loading$ | async) && !(filteredCategories$ | async)?.length" class="text-center py-12">
        <div class="text-gray-400 mb-4">
          <svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
        <p class="text-gray-500 mb-4">
          {{ showArchived ? 'No categories match your current filters.' : 'Get started by creating your first category to organize your transactions.' }}
        </p>
        <button 
          *ngIf="!showArchived"
          (click)="openCreateModal()"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
          Create Category
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .type-filter-transition {
        transition: all 0.2s ease-in-out;
      }
      
      .type-filter-active {
        background-color: white;
        color: #111827;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
      }
      
      .type-filter-inactive {
        color: #6b7280;
      }
      
      .type-filter-inactive:hover {
        color: #374151;
      }
      
      .category-card-hover {
        transition: all 0.2s ease-in-out;
      }
      
      .category-card-hover:hover {
        transform: translateY(-1px);
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
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
    `
  ]
})
export class CategoryListComponent implements OnInit, OnDestroy {
  allCategories$ = this.store.select(selectAllCategories);
  activeCategories$ = this.store.select(selectActiveCategories);
  expenseCategories$ = this.store.select(selectExpenseCategories);
  incomeCategories$ = this.store.select(selectIncomeCategories);
  activeExpenseCategories$ = this.store.select(selectActiveExpenseCategories);
  activeIncomeCategories$ = this.store.select(selectActiveIncomeCategories);
  loading$ = this.store.select(selectCategoriesLoading);
  error$ = this.store.select(selectCategoriesError);
  archiving$ = this.store.select(selectCategoryArchiving);
  activating$ = this.store.select(selectCategoryActivating);

  typeFilter: 'ALL' | 'EXPENSE' | 'INCOME' = 'ALL';
  showArchived = false;
  filteredCategories$ = this.activeCategories$;

  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setTypeFilter(type: 'ALL' | 'EXPENSE' | 'INCOME'): void {
    this.typeFilter = type;
    this.updateFilteredCategories();
  }

  onShowArchivedChange(): void {
    this.updateFilteredCategories();
  }

  private updateFilteredCategories(): void {
    if (this.showArchived) {
      // Show all categories (including archived)
      switch (this.typeFilter) {
        case 'EXPENSE':
          this.filteredCategories$ = this.expenseCategories$;
          break;
        case 'INCOME':
          this.filteredCategories$ = this.incomeCategories$;
          break;
        default:
          this.filteredCategories$ = this.allCategories$;
      }
    } else {
      // Show only active categories
      switch (this.typeFilter) {
        case 'EXPENSE':
          this.filteredCategories$ = this.activeExpenseCategories$;
          break;
        case 'INCOME':
          this.filteredCategories$ = this.activeIncomeCategories$;
          break;
        default:
          this.filteredCategories$ = this.activeCategories$;
      }
    }
  }

  loadCategories(): void {
    this.store.dispatch(loadCategories());
  }

  editCategory(category: Category): void {
    if (category.isActive) {
      this.openEditModal(category);
    }
  }

  confirmArchive(category: Category): void {
    if (confirm(`Are you sure you want to archive "${category.name}"? This action can be undone.`)) {
      this.store.dispatch(archiveCategory({ id: category.id }));
    }
  }

  confirmActivate(category: Category): void {
    if (confirm(`Are you sure you want to activate "${category.name}"?`)) {
      this.store.dispatch(activateCategory({ id: category.id }));
    }
  }

  refreshCategories(): void {
    this.loadCategories();
  }

  openCreateModal(): void {
    this.modalService.openComponent(CategoryFormModalComponent, {
      id: 'create-category-modal',
      title: 'Create New Category',
      data: { mode: 'create' }
    }).subscribe(result => {
      if (result?.confirmed) {
        // Modal was closed successfully, refresh categories
        this.loadCategories();
      }
    });
  }

  openEditModal(category: Category): void {
    this.modalService.openComponent(CategoryFormModalComponent, {
      id: 'edit-category-modal',
      title: 'Edit Category',
      data: { mode: 'edit', category }
    }).subscribe(result => {
      if (result?.confirmed) {
        // Modal was closed successfully, refresh categories
        this.loadCategories();
      }
    });
  }

  clearError(): void {
    this.store.dispatch(clearCategoryError());
  }

  getCategoryTypeLabel(type: string): string {
    const categoryType = CATEGORY_TYPES.find(t => t.value === type);
    return categoryType?.label || type;
  }

  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    // Replace the broken image with a fallback emoji
    const parentDiv = imgElement.parentElement;
    if (parentDiv) {
      parentDiv.innerHTML = '<span class="text-2xl">🏷️</span>';
    }
  }

  trackByCategoryId(index: number, category: Category): string {
    return category.id;
  }
}
