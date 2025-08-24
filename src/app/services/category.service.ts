import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from '@shared/models';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly apiUrl = `${environment.api.baseUrl}/categories`;

  constructor(private http: HttpClient) {}

  /**
   * Get all categories for the current user
   * @param includeArchived Whether to include archived categories
   * @returns Observable of categories array
   */
  getCategories(includeArchived: boolean = false): Observable<Category[]> {
    const params = new HttpParams().set('includeArchived', includeArchived.toString());
    return this.http.get<Category[]>(this.apiUrl, { params });
  }

  /**
   * Get categories filtered by type
   * @param type Category type (EXPENSE or INCOME)
   * @param includeArchived Whether to include archived categories
   * @returns Observable of categories array
   */
  getCategoriesByType(type: 'EXPENSE' | 'INCOME', includeArchived: boolean = false): Observable<Category[]> {
    const params = new HttpParams().set('includeArchived', includeArchived.toString());
    return this.http.get<Category[]>(`${this.apiUrl}/type/${type}`, { params });
  }

  /**
   * Search categories by name
   * @param searchTerm Search term
   * @param includeArchived Whether to include archived categories
   * @returns Observable of categories array
   */
  searchCategories(searchTerm: string, includeArchived: boolean = false): Observable<Category[]> {
    const params = new HttpParams()
      .set('searchTerm', searchTerm)
      .set('includeArchived', includeArchived.toString());
    return this.http.get<Category[]>(`${this.apiUrl}/search`, { params });
  }

  /**
   * Get only active categories
   * @returns Observable of active categories array
   */
  getActiveCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/status/active`);
  }

  /**
   * Get a single category by ID
   * @param id Category ID
   * @returns Observable of category
   */
  getCategory(id: string): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a new category
   * @param category Category creation request
   * @returns Observable of created category
   */
  createCategory(category: CreateCategoryRequest): Observable<Category> {
    return this.http.post<Category>(this.apiUrl, category);
  }

  /**
   * Update an existing category
   * @param id Category ID
   * @param category Category update request
   * @returns Observable of updated category
   */
  updateCategory(id: string, category: UpdateCategoryRequest): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/${id}`, category);
  }

  /**
   * Archive a category (soft delete)
   * @param id Category ID
   * @returns Observable of void
   */
  archiveCategory(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/archive`, {});
  }

  /**
   * Activate a previously archived category
   * @param id Category ID
   * @returns Observable of void
   */
  activateCategory(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/activate`, {});
  }
}
