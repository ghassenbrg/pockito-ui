import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  CategoryRequest, 
  Category, 
  CategoryList, 
  CategoryType 
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly baseUrl = '/api/categories';

  constructor(private http: HttpClient) {}

  /**
   * Get all categories for the authenticated user, ordered by name
   */
  getUserCategories(): Observable<CategoryList> {
    return this.http.get<CategoryList>(this.baseUrl);
  }

  /**
   * Create a new category
   */
  createCategory(category: CategoryRequest): Observable<Category> {
    return this.http.post<Category>(this.baseUrl, category);
  }

  /**
   * Get a specific category by ID
   */
  getCategory(categoryId: string): Observable<Category> {
    return this.http.get<Category>(`${this.baseUrl}/${categoryId}`);
  }

  /**
   * Update an existing category
   */
  updateCategory(categoryId: string, category: CategoryRequest): Observable<Category> {
    return this.http.put<Category>(`${this.baseUrl}/${categoryId}`, category);
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
  getChildCategories(parentCategoryId: string): Observable<CategoryList> {
    return this.http.get<CategoryList>(`${this.baseUrl}/${parentCategoryId}/children`);
  }

  /**
   * Get categories by type (EXPENSE or INCOME)
   */
  getCategoriesByType(categoryType: CategoryType): Observable<CategoryList> {
    return this.http.get<CategoryList>(`${this.baseUrl}/type/${categoryType}`);
  }

  /**
   * Get root categories (categories without a parent)
   */
  getRootCategories(): Observable<CategoryList> {
    return this.http.get<CategoryList>(`${this.baseUrl}/root`);
  }

  /**
   * Get all categories in hierarchical order (parents first, then children)
   */
  getHierarchicalCategories(): Observable<CategoryList> {
    return this.http.get<CategoryList>(`${this.baseUrl}/hierarchical`);
  }

  /**
   * Get hierarchical categories by type
   */
  getHierarchicalCategoriesByType(categoryType: CategoryType): Observable<CategoryList> {
    return this.http.get<CategoryList>(`${this.baseUrl}/hierarchical/type/${categoryType}`);
  }

  /**
   * Get categories by color
   */
  getCategoriesByColor(color: string): Observable<CategoryList> {
    return this.http.get<CategoryList>(`${this.baseUrl}/color/${color}`);
  }
}
