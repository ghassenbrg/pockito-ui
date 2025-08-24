import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { 
  selectCategoryCreating, 
  selectCategoryUpdating, 
  selectCategoriesError,
  selectAllCategories
} from '@state/categories';
import { 
  createCategory, 
  updateCategory, 
  clearCategoryError 
} from '@state/categories';
import { 
  Category, 
  CreateCategoryRequest, 
  UpdateCategoryRequest, 
  CATEGORY_TYPES 
} from '@shared/models';
import { IconPickerComponent, IconOption } from '@shared/icon-picker';
import { ModalService } from '@shared/modal/modal.service';
import { raise } from '@state/notification/notification.actions';

export interface CategoryFormData {
  mode: 'create' | 'edit';
  category?: Category;
}

@Component({
  selector: 'app-category-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconPickerComponent],
  template: `
    <div class="p-6 max-w-2xl mx-auto">
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
      <form [formGroup]="categoryForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <!-- Basic Information -->
        <div class="space-y-4">
          <h3 class="text-lg font-medium text-gray-900">Basic Information</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Name -->
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
                Category Name *
              </label>
              <input
                id="name"
                type="text"
                formControlName="name"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter category name">
              <div *ngIf="categoryForm.get('name')?.invalid && categoryForm.get('name')?.touched" 
                   class="text-red-600 text-sm mt-1">
                Category name is required
              </div>
            </div>

            <!-- Type (only for create mode) -->
            <div *ngIf="!isEditMode">
              <label for="type" class="block text-sm font-medium text-gray-700 mb-1">
                Category Type *
              </label>
              <select
                id="type"
                formControlName="type"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Select category type</option>
                <option *ngFor="let categoryType of categoryTypes" [value]="categoryType.value">
                  {{ categoryType.label }}
                </option>
              </select>
              <div *ngIf="categoryForm.get('type')?.invalid && categoryForm.get('type')?.touched" 
                   class="text-red-600 text-sm mt-1">
                Category type is required
              </div>
            </div>

            <!-- Type Display (for edit mode) -->
            <div *ngIf="isEditMode">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Category Type
              </label>
              <div class="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
                {{ getCategoryTypeLabel(data.category?.type) }}
              </div>
            </div>
          </div>

          <!-- Parent Category -->
          <div>
            <label for="parentId" class="block text-sm font-medium text-gray-700 mb-1">
              Parent Category
            </label>
            <select
              id="parentId"
              formControlName="parentId"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">No parent (top-level category)</option>
              <option *ngFor="let parent of availableParentCategories" [value]="parent.id">
                {{ parent.name }} ({{ getCategoryTypeLabel(parent.type) }})
              </option>
            </select>
            <p class="text-sm text-gray-500 mt-1">
              Parent categories help organize your categories into groups
            </p>
          </div>

          <!-- Icon -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Category Icon
            </label>
            <app-icon-picker
              [config]="{ showEmoji: true, showUrl: true }"
              [value]="iconValue"
              (iconChange)="onIconChange($event)">
            </app-icon-picker>
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
            [disabled]="categoryForm.invalid || (creating$ | async) || (updating$ | async)"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors">
            <span *ngIf="creating$ | async">Creating...</span>
            <span *ngIf="updating$ | async">Updating...</span>
            <span *ngIf="!(creating$ | async) && !(updating$ | async)">
              {{ isEditMode ? 'Update Category' : 'Create Category' }}
            </span>
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `
  ]
})
export class CategoryFormModalComponent implements OnInit, OnDestroy, OnChanges {
  @Input() data: CategoryFormData = { mode: 'create' };
  @Output() cancel = new EventEmitter<void>();
  @Output() success = new EventEmitter<Category>();

  categoryForm: FormGroup;
  iconValue: IconOption | null = null;
  categoryTypes = CATEGORY_TYPES;
  availableParentCategories: Category[] = [];

  creating$ = this.store.select(selectCategoryCreating);
  updating$ = this.store.select(selectCategoryUpdating);
  error$ = this.store.select(selectCategoriesError);
  allCategories$ = this.store.select(selectAllCategories);

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private modalService: ModalService
  ) {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      type: ['', Validators.required],
      color: ['#6B73FF'],
      parentId: ['']
    });
  }

  ngOnInit(): void {
    // Initialize form after a short delay to ensure component is ready
    setTimeout(() => {
      this.initializeForm();
    }, 50);

    // Watch for success states to close modal and show success message
    this.creating$.pipe(takeUntil(this.destroy$)).subscribe(creating => {
      if (!creating && this.categoryForm.dirty) {
        // Category was created successfully
        this.showSuccessMessage('Category created successfully!');
        this.closeModalWithSuccess();
      }
    });

    this.updating$.pipe(takeUntil(this.destroy$)).subscribe(updating => {
      if (!updating && this.categoryForm.dirty) {
        // Category was updated successfully
        this.showSuccessMessage('Category updated successfully!');
        this.closeModalWithSuccess();
      }
    });

    // Load available parent categories
    this.allCategories$.pipe(takeUntil(this.destroy$)).subscribe(categories => {
      this.updateAvailableParentCategories(categories);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && changes['data'].currentValue) {
      // Use setTimeout to ensure the component is fully initialized
      setTimeout(() => {
        this.initializeForm();
      }, 150);
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
    this.categoryForm.reset({
      name: '',
      type: '',
      color: '#6B73FF',
      parentId: ''
    });

    // Reset icon value
    this.iconValue = null;

    // Populate form if in edit mode
    if (this.isEditMode && this.data.category) {
      this.populateForm(this.data.category);
    }
  }

  populateForm(category: Category): void {
    // First set the icon value
    if (category.iconType && category.iconValue) {
      this.iconValue = {
        type: category.iconType,
        value: category.iconValue
      };
    }
    
    // Then populate the form
    this.categoryForm.patchValue({
      name: category.name,
      type: category.type,
      color: category.color || '#6B73FF',
      parentId: category.parentId || ''
    });

    // Mark form as pristine since we're loading existing data
    this.categoryForm.markAsPristine();
  }

  private updateAvailableParentCategories(categories: Category[]): void {
    if (this.isEditMode && this.data.category) {
      // For edit mode, exclude the current category and its descendants
      this.availableParentCategories = categories.filter(cat => 
        cat.id !== this.data.category!.id && 
        cat.type === this.data.category!.type &&
        cat.isActive
      );
    } else {
      // For create mode, show all active categories of the selected type
      const selectedType = this.categoryForm.get('type')?.value;
      if (selectedType) {
        this.availableParentCategories = categories.filter(cat => 
          cat.type === selectedType && cat.isActive
        );
      }
    }
  }

  onIconChange(icon: IconOption | null): void {
    this.iconValue = icon;
  }

  onSubmit(): void {
    if (this.categoryForm.valid) {
      const formValue = this.categoryForm.value;

      if (this.isEditMode && this.data.category) {
        const updateData: UpdateCategoryRequest = {
          name: formValue.name,
          color: formValue.color,
          iconType: this.iconValue?.type,
          iconValue: this.iconValue?.value,
          parentId: formValue.parentId || null
        };
        this.store.dispatch(updateCategory({ id: this.data.category!.id, category: updateData }));
      } else {
        const createData: CreateCategoryRequest = {
          name: formValue.name,
          type: formValue.type,
          color: formValue.color,
          iconType: this.iconValue?.type,
          iconValue: this.iconValue?.value,
          parentId: formValue.parentId || null
        };
        this.store.dispatch(createCategory({ category: createData }));
      }
    }
  }

  onCancel(): void {
    this.closeModal();
  }

  private closeModal(): void {
    // Close the modal using the modal service
    if (this.data.mode === 'create') {
      this.modalService.close('create-category-modal');
    } else {
      this.modalService.close('edit-category-modal');
    }
  }

  private closeModalWithSuccess(): void {
    // Close the modal with success result
    if (this.data.mode === 'create') {
      this.modalService.close('create-category-modal', {
        modalId: 'create-category-modal',
        confirmed: true,
        data: { success: true }
      });
    } else {
      this.modalService.close('edit-category-modal', {
        modalId: 'edit-category-modal',
        confirmed: true,
        data: { success: true }
      });
    }
  }

  private showSuccessMessage(message: string): void {
    this.store.dispatch(raise({
      message,
      status: 200,
      displayType: 'toast',
      notificationType: 'success'
    }));
  }

  clearError(): void {
    this.store.dispatch(clearCategoryError());
  }

  getCategoryTypeLabel(type: string | undefined): string {
    if (!type) return '';
    const categoryType = CATEGORY_TYPES.find(t => t.value === type);
    return categoryType?.label || type;
  }
}
