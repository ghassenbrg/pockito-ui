import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category, CreateCategoryDto, UpdateCategoryDto, CategoryType } from '@api/model/category.model';
import { environment } from '@environments/environment';
import { catchError, tap } from 'rxjs/operators';
import { ToastService } from '@shared/services/toast.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryApiService {
  private readonly baseUrl = `${environment.api.baseUrl}/categories`;

  constructor(
    private http: HttpClient,
    private toastService: ToastService
  ) {}

  /**
   * Create a new category for the authenticated user.
   * Category names must be unique per user.
   */
  createCategory(categoryDto: CreateCategoryDto): Observable<Category> {
    return this.http.post<Category>(this.baseUrl, categoryDto).pipe(
      tap(category => {
        this.toastService.showSuccess('categoryCreated', { name: category.name });
      }),
      catchError(error => {
        console.error('Error creating category:', error);
        throw error;
      })
    );
  }

  /**
   * Get all categories for the authenticated user, ordered by name.
   */
  getUserCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.baseUrl).pipe(
      catchError(error => {
        console.error('Error fetching user categories:', error);
        throw error;
      })
    );
  }

  /**
   * Get categories by type for the authenticated user.
   * @param categoryType - The category type to filter by (EXPENSE or INCOME)
   */
  getCategoriesByType(categoryType: CategoryType): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/type/${categoryType}`).pipe(
      catchError(error => {
        console.error(`Error fetching categories of type ${categoryType}:`, error);
        throw error;
      })
    );
  }

  /**
   * Get hierarchical categories for the authenticated user.
   * Returns categories in hierarchical order (parents first, then children).
   */
  getHierarchicalCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/hierarchical`).pipe(
      catchError(error => {
        console.error('Error fetching hierarchical categories:', error);
        throw error;
      })
    );
  }

  /**
   * Get hierarchical categories by type for the authenticated user.
   * @param categoryType - The category type to filter by (EXPENSE or INCOME)
   */
  getHierarchicalCategoriesByType(categoryType: CategoryType): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/hierarchical/type/${categoryType}`).pipe(
      catchError(error => {
        console.error(`Error fetching hierarchical categories of type ${categoryType}:`, error);
        throw error;
      })
    );
  }

  /**
   * Get a specific category by ID for the authenticated user.
   * @param categoryId - The category ID
   */
  getCategory(categoryId: string): Observable<Category> {
    return this.http.get<Category>(`${this.baseUrl}/${categoryId}`).pipe(
      catchError(error => {
        console.error(`Error fetching category ${categoryId}:`, error);
        throw error;
      })
    );
  }

  /**
   * Get child categories of a specific parent category.
   * @param parentCategoryId - The parent category ID
   */
  getChildCategories(parentCategoryId: string): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/${parentCategoryId}/children`).pipe(
      catchError(error => {
        console.error(`Error fetching child categories for parent ${parentCategoryId}:`, error);
        throw error;
      })
    );
  }

  /**
   * Get root categories (no parent) for the authenticated user.
   */
  getRootCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/root`).pipe(
      catchError(error => {
        console.error('Error fetching root categories:', error);
        throw error;
      })
    );
  }

  /**
   * Get categories by color for the authenticated user.
   * @param color - The color to filter by (hex format, e.g., #A1B2C3)
   */
  getCategoriesByColor(color: string): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/color/${encodeURIComponent(color)}`).pipe(
      catchError(error => {
        console.error(`Error fetching categories with color ${color}:`, error);
        throw error;
      })
    );
  }

  /**
   * Update an existing category for the authenticated user.
   * Category names must remain unique per user.
   * @param categoryId - The category ID to update
   * @param categoryDto - The updated category data
   */
  updateCategory(categoryId: string, categoryDto: UpdateCategoryDto): Observable<Category> {
    return this.http.put<Category>(`${this.baseUrl}/${categoryId}`, categoryDto).pipe(
      tap(category => {
        this.toastService.showSuccess('categoryUpdated', { name: category.name });
      }),
      catchError(error => {
        console.error(`Error updating category ${categoryId}:`, error);
        throw error;
      })
    );
  }

  /**
   * Delete a category for the authenticated user.
   * Category must not have child categories.
   * @param categoryId - The category ID to delete
   */
  deleteCategory(categoryId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${categoryId}`).pipe(
      tap(() => {
        this.toastService.showSuccess('categoryDeleted');
      }),
      catchError(error => {
        console.error(`Error deleting category ${categoryId}:`, error);
        throw error;
      })
    );
  }

  /**
   * Search categories by name (case-insensitive partial match).
   * @param searchTerm - The search term to match against category names
   */
  searchCategories(searchTerm: string): Observable<Category[]> {
    const params = new HttpParams().set('search', searchTerm);
    return this.http.get<Category[]>(`${this.baseUrl}/search`, { params }).pipe(
      catchError(error => {
        console.error(`Error searching categories with term "${searchTerm}":`, error);
        throw error;
      })
    );
  }

  /**
   * Get categories with pagination support.
   * @param page - Page number (0-based)
   * @param size - Page size
   * @param sort - Sort field and direction (e.g., 'name,asc')
   */
  getCategoriesPaginated(page: number = 0, size: number = 20, sort?: string): Observable<{
    content: Category[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
  }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    if (sort) {
      params = params.set('sort', sort);
    }

    return this.http.get<{
      content: Category[];
      totalElements: number;
      totalPages: number;
      size: number;
      number: number;
      first: boolean;
      last: boolean;
    }>(`${this.baseUrl}/paginated`, { params }).pipe(
      catchError(error => {
        console.error('Error fetching paginated categories:', error);
        throw error;
      })
    );
  }
}
