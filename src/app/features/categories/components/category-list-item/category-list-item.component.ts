import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnChanges, SimpleChanges, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { MenuModule } from 'primeng/menu';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Category, CategoryType } from '@api/model/category.model';
import { MenuItem } from 'primeng/api';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-category-list-item',
  standalone: true,
  imports: [CommonModule, ButtonModule, TooltipModule, MenuModule, OverlayPanelModule, TranslateModule],
  templateUrl: './category-list-item.component.html',
  styleUrl: './category-list-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoryListItemComponent implements OnInit, OnChanges, OnDestroy {
  @Input() category!: Category;
  
  @Output() viewCategory = new EventEmitter<Category>();
  @Output() editCategory = new EventEmitter<Category>();
  @Output() deleteCategory = new EventEmitter<Category>();

  // Menu items for the three-dot menu
  menuItems: MenuItem[] = [];

  // Language change subscription
  private languageSubscription?: Subscription;

  // Memoized getters for better performance
  private _categoryIconUrl: string | null = null;
  private _categoryTypeLabel: string | null = null;

  constructor(
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.initializeMenuItems();
    
    // Subscribe to language changes to update menu items
    this.languageSubscription = this.translate.onLangChange.subscribe(() => {
      this.initializeMenuItems();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['category']) {
      this.clearMemoizedValues();
      this.initializeMenuItems();
    }
  }

  ngOnDestroy(): void {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  private initializeMenuItems(): void {
    this.menuItems = [
      {
        label: this.translate.instant('category.actions.edit'),
        icon: 'pi pi-pencil',
        command: () => this.onEditCategory()
      },
      {
        separator: true
      },
      {
        label: this.translate.instant('category.actions.delete'),
        icon: 'pi pi-trash',
        styleClass: 'p-menuitem-danger',
        disabled: this.hasChildren(),
        command: () => this.onDeleteCategory()
      }
    ];
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
