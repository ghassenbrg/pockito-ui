import { Injectable, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoryType, CategoryTypeOption, ParentCategoryOption, CategoryFormData } from '../models/category.types';
import { Category } from '@api/model/category.model';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Subscription, forkJoin, of } from 'rxjs';
import { CategoryApiService } from '@api/services/category.service';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CategoryFormService implements OnDestroy {
  private categoryTypesSubject = new BehaviorSubject<CategoryTypeOption[]>([]);
  private parentCategoriesSubject = new BehaviorSubject<ParentCategoryOption[]>([]);
  private languageSubscription: Subscription = new Subscription();
  
  categoryTypes$ = this.categoryTypesSubject.asObservable();
  parentCategories$ = this.parentCategoriesSubject.asObservable();

  constructor(
    private fb: FormBuilder,
    private translateService: TranslateService,
    private categoryApiService: CategoryApiService
  ) {
    this.initializeOptions();
    this.subscribeToLanguageChanges();
  }

  ngOnDestroy(): void {
    this.languageSubscription.unsubscribe();
  }

  private initializeOptions(): void {
    this.loadTranslations();
  }

  private subscribeToLanguageChanges(): void {
    // Subscribe to language changes to reload translations
    this.languageSubscription = this.translateService.onLangChange.subscribe(() => {
      this.loadTranslations();
    });
  }

  private loadTranslations(): void {
    // Load category type translations
    const categoryTypeKeys = [
      { key: 'category.types.EXPENSE', value: CategoryType.EXPENSE },
      { key: 'category.types.INCOME', value: CategoryType.INCOME }
    ];

    // Use forkJoin to load all translations at once
    const categoryTypeTranslations$ = forkJoin(
      categoryTypeKeys.map(({ key }) => this.translateService.get(key))
    );

    // Load category types
    categoryTypeTranslations$.subscribe(labels => {
      const categoryTypes: CategoryTypeOption[] = categoryTypeKeys.map(({ value }, index) => ({
        label: labels[index],
        value
      }));
      this.categoryTypesSubject.next(categoryTypes);
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(100)]],
      color: ['#3b82f6', [Validators.required, Validators.pattern(/^#[0-9A-Fa-f]{6}$/)]],
      categoryType: [CategoryType.EXPENSE, [Validators.required]],
      iconUrl: ['', [Validators.maxLength(500)]],
      parentCategoryId: ['']
    });
  }

  populateForm(form: FormGroup, category: Category): void {
    form.patchValue({
      name: category.name,
      color: category.color,
      categoryType: category.categoryType,
      iconUrl: category.iconUrl || '',
      parentCategoryId: category.parentCategoryId || ''
    });
  }

  setDefaultValues(form: FormGroup): void {
    form.patchValue({
      name: '',
      color: '#3b82f6',
      categoryType: CategoryType.EXPENSE,
      iconUrl: '',
      parentCategoryId: ''
    });
  }

  getFormData(form: FormGroup): CategoryFormData {
    const formValue = form.value;
    return {
      name: formValue.name,
      color: formValue.color,
      categoryType: formValue.categoryType,
      iconUrl: formValue.iconUrl || undefined,
      parentCategoryId: formValue.parentCategoryId || undefined
    };
  }

  getFieldError(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (field && field.touched && field.errors) {
      if (field.errors['required']) {
        return this.translateService.instant('form.errors.fieldRequired');
      }
      if (field.errors['minlength']) {
        return this.translateService.instant('form.errors.minLength', { min: field.errors['minlength'].requiredLength });
      }
      if (field.errors['maxlength']) {
        return this.translateService.instant('form.errors.maxLength', { max: field.errors['maxlength'].requiredLength });
      }
      if (field.errors['pattern']) {
        return this.translateService.instant('form.errors.invalidFormat');
      }
    }
    return '';
  }

  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  markFormGroupTouched(form: FormGroup): void {
    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);
      control?.markAsTouched();
    });
  }

  // Method to load parent categories from API
  loadParentCategories(categoryType?: CategoryType, excludeCategoryId?: string): void {
    if (!categoryType) {
      // If no category type specified, load all root categories
      this.categoryApiService.getRootCategories().pipe(
        map(categories => this.transformCategoriesToOptions(categories, excludeCategoryId)),
        catchError(_error => {
          return of([]);
        })
      ).subscribe(options => {
        this.parentCategoriesSubject.next(options);
      });
    } else {
      // Load root categories filtered by type
      this.categoryApiService.getHierarchicalCategoriesByType(categoryType).pipe(
        map(categories => {
          // Filter to only root categories (no parent) and exclude the current category if editing
          const rootCategories = categories.filter(cat => !cat.parentCategoryId);
          return this.transformCategoriesToOptions(rootCategories, excludeCategoryId);
        }),
        catchError(_error => {
          return of([]);
        })
      ).subscribe(options => {
        this.parentCategoriesSubject.next(options);
      });
    }
  }

  private transformCategoriesToOptions(categories: Category[], excludeCategoryId?: string): ParentCategoryOption[] {
    return categories
      .filter(category => category.id !== excludeCategoryId) // Exclude current category if editing
      .map(category => ({
        label: category.name,
        value: category.id
      }));
  }
}
