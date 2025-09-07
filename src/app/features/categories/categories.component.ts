import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { Category } from '@api/model/category.model';
import { CategoryCardComponent } from './components/category-card/category-card.component';
import { CategoryListItemComponent } from './components/category-list-item/category-list-item.component';
import { CategoryViewSwitcherComponent } from './components/view-switcher/view-switcher.component';
import { ViewMode } from './models/category.types';
import { CategoryFacade } from './services/category.facade';
import { ResponsiveService } from '@core/services/responsive.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    CommonModule, 
    ButtonModule, 
    TooltipModule, 
    TranslateModule,
    CategoryCardComponent,
    CategoryListItemComponent,
    CategoryViewSwitcherComponent
  ],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoriesComponent implements OnInit, OnDestroy {
  // Use observables directly instead of component properties
  categories$ = this.categoryFacade.categories$;
  isMobileView$ = this.responsiveService.screenSize$.pipe(
    map(screenSize => screenSize.isMobile)
  );
  currentViewMode$ = this.categoryFacade.viewMode$;
  
  private subscriptions = new Subscription();

  constructor(
    public categoryFacade: CategoryFacade,
    private responsiveService: ResponsiveService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeComponent();
    this.setupSubscriptions();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private initializeComponent(): void {
    this.loadCategories();
  }

  private setupSubscriptions(): void {
    // No auto-switching logic - let users choose their preferred view mode
    // The responsive CSS will handle the layout appropriately for both mobile and desktop
  }

  private loadCategories(): void {
    // Categories are automatically loaded by the NgRx store
    this.categoryFacade.loadCategories();
  }

  setViewMode(viewMode: ViewMode): void {
    this.categoryFacade.setViewMode(viewMode);
  }

  createCategory(): void {
    this.categoryFacade.navigateToCreateCategory();
  }

  viewCategory(category: Category): void {
    if (category.id) {
      this.categoryFacade.navigateToCategoryView(category.id);
    }
  }

  editCategory(category: Category): void {
    if (category.id) {
      this.categoryFacade.navigateToEditCategory(category.id);
    }
  }

  deleteCategory(category: Category): void {
    this.categoryFacade.deleteCategory(category);
  }

  // Event handlers for child components
  onViewCategory(category: Category): void {
    this.viewCategory(category);
  }

  onEditCategory(category: Category): void {
    this.editCategory(category);
  }

  onDeleteCategory(category: Category): void {
    this.deleteCategory(category);
  }

  onViewModeChange(viewMode: ViewMode): void {
    // This will automatically save the view mode to localStorage via the reducer
    this.setViewMode(viewMode);
  }

  // TrackBy function for performance optimization
  trackByCategoryId(index: number, category: Category): string {
    return category.id ?? '';
  }
}