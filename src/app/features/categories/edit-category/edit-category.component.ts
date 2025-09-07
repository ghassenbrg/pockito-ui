import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { LoadingService } from '@shared/services/loading.service';
import { ToastService } from '@shared/services/toast.service';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { Subscription, combineLatest } from 'rxjs';
import { filter, map, switchMap, take } from 'rxjs/operators';
import { CategoryFormService } from '../services/category-form.service';
import { CategoryFacade } from '../services/category.facade';

@Component({
  selector: 'app-edit-category',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    TooltipModule,
    TranslateModule,
  ],
  templateUrl: './edit-category.component.html',
  styleUrls: ['./edit-category.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditCategoryComponent implements OnInit, OnDestroy {
  editCategoryForm!: FormGroup;

  // Observables for reactive data binding
  category$ = this.route.params.pipe(
    switchMap((params) => {
      const categoryId = params['id'];
      if (categoryId && categoryId !== 'new') {
        return this.categoryFacade.getCategoryById(categoryId);
      }
      return [null];
    })
  );

  isEditMode$ = this.route.params.pipe(
    map((params) => params['id'] && params['id'] !== 'new')
  );

  isViewMode$ = this.route.url.pipe(
    map(url => url.some(segment => segment.path === 'view'))
  );

  // Form options from service
  categoryTypes$ = this.categoryFormService.categoryTypes$;
  parentCategories$ = this.categoryFormService.parentCategories$;

  // Loading state from NgRx store
  loading$ = this.categoryFacade.isLoading$;
  
  // Operation-specific loading states
  isCreatingCategory$ = this.categoryFacade.isCreatingCategory$;
  isUpdatingCategory$ = this.categoryFacade.isUpdatingCategory$;
  isLoadingCategoryById$ = this.categoryFacade.isLoadingCategoryById$;
  
  // Operation states with loading and errors
  createCategoryState$ = this.categoryFacade.createCategoryState$;
  updateCategoryState$ = this.categoryFacade.updateCategoryState$;
  loadCategoryByIdState$ = this.categoryFacade.loadCategoryByIdState$;

  // Icon preview properties
  iconPreviewLoaded: boolean = false;
  iconPreviewError: boolean = false;

  private routeSubscription: Subscription = new Subscription();
  private categoryOperationSubscription: Subscription = new Subscription();
  private parentCategoriesSubscription: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private categoryFormService: CategoryFormService,
    private route: ActivatedRoute,
    private router: Router,
    private loadingService: LoadingService,
    private toastService: ToastService,
    private categoryFacade: CategoryFacade
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadCategory();
    this.categoryFacade.clearError();
    
    // Load parent categories after form is initialized
    setTimeout(() => {
      this.loadParentCategories();
    }, 0);
    
    // Listen for route changes to ensure loading state is reset
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        // Reset loading state when route changes
        if (this.loadingService.isLoading) {
          this.loadingService.hide();
        }
      });
  }

  ngOnDestroy(): void {
    this.routeSubscription.unsubscribe();
    this.categoryOperationSubscription.unsubscribe();
    this.parentCategoriesSubscription.unsubscribe();
  }

  onSubmit(): void {
    if (this.editCategoryForm.valid) {
      const categoryData = this.categoryFormService.getFormData(
        this.editCategoryForm
      );

      combineLatest([this.isEditMode$, this.category$])
        .pipe(take(1))
        .subscribe(([isEditMode, category]) => {
          if (isEditMode && category) {
            this.updateCategory(categoryData, category.id!);
          } else {
            this.createCategory(categoryData);
          }
        });
    } else {
      this.categoryFormService.markFormGroupTouched(this.editCategoryForm);
      this.toastService.showError('formErrors');
    }
  }

  onCancel(): void {
    this.router.navigate(['/app/categories']);
  }

  private loadParentCategories(): void {
    // Get current category type from form
    const categoryType = this.editCategoryForm.get('categoryType')?.value;
    
    // Load parent categories immediately with current category type
    this.categoryFormService.loadParentCategories(categoryType);

    // Subscribe to category type changes to reload parent categories
    this.parentCategoriesSubscription = this.editCategoryForm.get('categoryType')?.valueChanges.subscribe(newCategoryType => {
      // Get current category ID for exclusion when type changes
      this.category$.pipe(take(1)).subscribe(category => {
        const excludeCategoryId = category?.id;
        this.categoryFormService.loadParentCategories(newCategoryType, excludeCategoryId);
      });
    }) || new Subscription();
  }

  editCategory(category: any): void {
    if (category?.id) {
      this.router.navigate(['/app/categories/edit', category.id]);
    }
  }

  onEditClick(): void {
    this.category$.pipe(take(1)).subscribe(category => {
      if (category?.id) {
        this.router.navigate(['/app/categories/edit', category.id]);
      }
    });
  }

  // Form validation methods
  getFieldError(fieldName: string): string {
    return this.categoryFormService.getFieldError(this.editCategoryForm, fieldName);
  }

  isFieldInvalid(fieldName: string): boolean {
    return this.categoryFormService.isFieldInvalid(
      this.editCategoryForm,
      fieldName
    );
  }

  // Icon preview methods
  onIconUrlChange(): void {
    this.iconPreviewLoaded = false;
    this.iconPreviewError = false;
  }

  onIconPreviewLoad(): void {
    this.iconPreviewLoaded = true;
    this.iconPreviewError = false;
  }

  onIconPreviewError(_event: any): void {
    this.iconPreviewError = true;
    this.iconPreviewLoaded = false;
  }

  // Color handling methods
  onColorChange(event: any): void {
    const color = event.target.value;
    this.editCategoryForm.patchValue({ color });
  }

  onHexInputChange(event: any): void {
    const hexValue = event.target.value;
    if (/^#[0-9A-Fa-f]{6}$/.test(hexValue)) {
      this.editCategoryForm.patchValue({ color: hexValue });
    }
  }

  // Private methods
  private initializeForm(): void {
    this.editCategoryForm = this.categoryFormService.createForm();
  }

  private loadCategory(): void {
    this.routeSubscription = this.route.params
      .pipe(
        switchMap((params) => {
          const categoryId = params['id'];
          
          if (categoryId && categoryId !== 'new') {
            // Always fetch the latest version from API
            this.loadingService.show('Loading category...');
            this.categoryFacade.loadCategoryById(categoryId);

            // Wait for the category to load
            return this.categoryFacade.selectedCategory$.pipe(
              filter((category) => !!category && category.id === categoryId),
              take(1)
            );
          } else {
            this.setDefaultValues();
            return [null];
          }
        })
      )
      .subscribe({
        next: (category) => {
          if (category) {
            this.categoryFormService.populateForm(this.editCategoryForm, category);
            // Reload parent categories after populating the form, excluding current category
            const categoryType = this.editCategoryForm.get('categoryType')?.value;
            console.log('Reloading parent categories after category load:', { categoryType, excludeCategoryId: category.id });
            this.categoryFormService.loadParentCategories(categoryType, category.id);
            this.loadingService.hide();
          }
        },
        error: (error) => {
          console.error('Error loading category:', error);
          this.loadingService.hide();
        },
      });
  }

  private setDefaultValues(): void {
    this.categoryFormService.setDefaultValues(this.editCategoryForm);
  }

  private updateCategory(categoryData: any, categoryId: string): void {
    // Simply dispatch the action - NgRx handles everything else
    this.categoryFacade.updateCategory(categoryId, categoryData);
  }

  private createCategory(categoryData: any): void {
    // Simply dispatch the action - NgRx handles everything else
    this.categoryFacade.createCategory(categoryData);
  }
}
