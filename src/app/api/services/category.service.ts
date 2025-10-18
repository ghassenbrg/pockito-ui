import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CategoryDto, CategoryType } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly baseUrl = '/api/categories';

  constructor(private http: HttpClient) {}

  /**
   * Get all categories for the authenticated user, ordered by name
   */
  getUserCategories(): Observable<CategoryDto[]> {
    return this.http.get<CategoryDto[]>(this.baseUrl);
  }

  /**
   * Create a new category
   */
  createCategory(category: CategoryDto): Observable<CategoryDto> {
    return this.http.post<CategoryDto>(this.baseUrl, category);
  }

  /**
   * Get a specific category by ID
   */
  getCategory(categoryId: string): Observable<CategoryDto> {
    return this.http.get<CategoryDto>(`${this.baseUrl}/${categoryId}`);
  }

  /**
   * Update an existing category
   */
  updateCategory(categoryId: string, category: CategoryDto): Observable<CategoryDto> {
    return this.http.put<CategoryDto>(`${this.baseUrl}/${categoryId}`, category);
  }

  /**
   * Delete a category
   */
  deleteCategory(categoryId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${categoryId}`);
  }

  /**
   * Get child categories of a specific parent category
   */
  getChildCategories(parentCategoryId: string): Observable<CategoryDto[]> {
    return this.http.get<CategoryDto[]>(`${this.baseUrl}/${parentCategoryId}/children`);
  }

  /**
   * Get categories by type (EXPENSE or INCOME)
   */
  getCategoriesByType(categoryType: CategoryType): Observable<CategoryDto[]> {
    return this.http.get<CategoryDto[]>(`${this.baseUrl}/type/${categoryType}`);
  }

  /**
   * Get root categories (categories without a parent)
   */
  getRootCategories(): Observable<CategoryDto[]> {
    return this.http.get<CategoryDto[]>(`${this.baseUrl}/root`);
  }

  /**
   * Get all categories in hierarchical order (parents first, then children)
   */
  getHierarchicalCategories(): Observable<CategoryDto[]> {
    return this.http.get<CategoryDto[]>(`${this.baseUrl}/hierarchical`);
  }

  /**
   * Get hierarchical categories by type
   */
  getHierarchicalCategoriesByType(categoryType: CategoryType): Observable<CategoryDto[]> {
    return this.http.get<CategoryDto[]>(`${this.baseUrl}/hierarchical/type/${categoryType}`);
  }

  /**
   * Get categories by color
   */
  getCategoriesByColor(color: string): Observable<CategoryDto[]> {
    return this.http.get<CategoryDto[]>(`${this.baseUrl}/color/${color}`);
  }
}
