import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { Category, CategoryType } from '@api/model/category.model';

@Component({
  selector: 'app-category-card',
  standalone: true,
  imports: [CommonModule, ButtonModule, TooltipModule, TranslateModule],
  templateUrl: './category-card.component.html',
  styleUrl: './category-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoryCardComponent implements OnChanges {
  @Input() category!: Category;
  
  @Output() viewCategory = new EventEmitter<Category>();
  @Output() editCategory = new EventEmitter<Category>();
  @Output() deleteCategory = new EventEmitter<Category>();

  // Memoized getters for better performance
  private _categoryIconUrl: string | null = null;
  private _categoryTypeLabel: string | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['category']) {
      this.clearMemoizedValues();
    }
  }

  getCategoryIconUrl(): string {
    if (!this._categoryIconUrl) {
      this._categoryIconUrl = this.getCategoryIcon(this.category);
    }
    return this._categoryIconUrl;
  }

  getCategoryTypeLabel(): string {
    if (!this._categoryTypeLabel) {
      this._categoryTypeLabel = this.getCategoryTypeLabelInternal(this.category.categoryType);
    }
    return this._categoryTypeLabel;
  }

  isCategoryActive(): boolean {
    return this.category.active !== false;
  }

  getCategoryColor(): string {
    return this.category.color || '#3b82f6';
  }

  getCategoryColorVariants(): { primary: string; light: string; dark: string; gradient: string } {
    const color = this.getCategoryColor();
    return this.getColorVariants(color);
  }

  hasChildren(): boolean {
    return (this.category.childCount || 0) > 0;
  }

  hasParent(): boolean {
    return !!this.category.parentCategoryId;
  }

  onImageError(event: any): void {
    event.target.src = this.getDefaultIcon();
  }

  // Event handlers
  onViewCategory(): void {
    this.viewCategory.emit(this.category);
  }

  onEditCategory(): void {
    this.editCategory.emit(this.category);
  }

  onDeleteCategory(): void {
    this.deleteCategory.emit(this.category);
  }

  // TrackBy function for performance optimization
  trackByCategoryId(index: number, category: Category): string {
    return category.id ?? '';
  }

  // Clear memoized values when category changes
  private clearMemoizedValues(): void {
    this._categoryIconUrl = null;
    this._categoryTypeLabel = null;
  }

  private getCategoryIcon(category: Category): string {
    if (category.iconUrl) {
      return category.iconUrl;
    }
    return this.getDefaultIcon();
  }

  private getDefaultIcon(): string {
    return 'assets/icons/category.png';
  }

  private getCategoryTypeLabelInternal(type: CategoryType): string {
    return type === CategoryType.EXPENSE ? 'category.types.EXPENSE' : 'category.types.INCOME';
  }

  private getColorVariants(color: string): { primary: string; light: string; dark: string; gradient: string } {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Create lighter and darker variants
    const light = `rgb(${Math.min(255, r + 40)}, ${Math.min(255, g + 40)}, ${Math.min(255, b + 40)})`;
    const dark = `rgb(${Math.max(0, r - 40)}, ${Math.max(0, g - 40)}, ${Math.max(0, b - 40)})`;
    const gradient = `linear-gradient(135deg, ${color} 0%, ${light} 100%)`;

    return {
      primary: color,
      light,
      dark,
      gradient
    };
  }
}
