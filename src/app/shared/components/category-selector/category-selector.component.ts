import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CategoryDto, CategoryType, TransactionType } from '@api/models';
import { CategoryService } from '@api/services';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastService } from '@shared/services/toast.service';
import { DialogSelectorComponent, DialogOption } from '../dialog-selector/dialog-selector.component';

@Component({
  selector: 'app-category-selector',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    DialogSelectorComponent,
  ],
  templateUrl: './category-selector.component.html',
  styleUrl: './category-selector.component.scss'
})
export class CategorySelectorComponent implements OnInit, OnChanges {
  @Input() selectedCategoryId?: string;
  @Input() transactionType?: TransactionType;
  @Input() isInvalid: boolean = false;
  @Input() placeholder: string = 'transactions.form.categoryPlaceholder';
  @Output() categorySelected = new EventEmitter<string>();
  @Output() categoryCleared = new EventEmitter<void>();
  @Output() categoryTouched = new EventEmitter<void>();

  categories: CategoryDto[] = [];
  showCategoryDialog: boolean = false;
  dialogOptions: DialogOption[] = [];

  constructor(
    private categoryService: CategoryService,
    private translate: TranslateService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['transactionType'] && this.transactionType) {
      this.loadCategories();
    }
  }

  private loadCategories(): void {
    if (!this.transactionType) {
      console.warn('No transaction type provided for category loading');
      return;
    }

    const categoryType = this.transactionType === TransactionType.INCOME 
      ? CategoryType.INCOME 
      : CategoryType.EXPENSE;

    this.categoryService.getCategoriesByType(categoryType).subscribe({
      next: (categories: CategoryDto[]) => {
        this.categories = categories;
        this.updateDialogOptions();
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

  getSelectedCategory(): CategoryDto | undefined {
    return this.categories.find(cat => cat.id === this.selectedCategoryId);
  }

  getFilteredCategories(): CategoryDto[] {
    // Categories are already filtered by type when loaded from the service
    return this.categories;
  }

  openCategoryDialog(): void {
    this.showCategoryDialog = true;
  }

  closeCategoryDialog(): void {
    this.showCategoryDialog = false;
  }

  selectCategory(categoryId: string): void {
    this.categorySelected.emit(categoryId);
  }

  onDialogOptionSelected(optionId: string | null): void {
    if (optionId) {
      this.selectCategory(optionId);
    }
  }

  onDialogClosed(): void {
    this.closeCategoryDialog();
    // Emit touched event when dialog closes to trigger validation display
    this.categoryTouched.emit();
  }

  private updateDialogOptions(): void {
    this.dialogOptions = this.categories.map(category => ({
      id: category.id!,
      name: category.name!,
      iconUrl: category.iconUrl,
      fallbackIcon: this.getCategoryIcon(category.categoryType!),
      type: category.categoryType,
      typeLabel: this.getCategoryTypeLabel(category.categoryType!)
    }));
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

  getCategoryTypeLabel(type: CategoryType): string {
    return this.translate.instant(`enums.categoryType.${type}`);
  }
}
