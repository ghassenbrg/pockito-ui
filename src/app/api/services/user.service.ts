import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User, Currency, Country } from '../models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly baseUrl = '/api/users';

  // <keep this when geenrating from prompt.md>
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  // </end of keep this when geenrating from prompt.md>

  constructor(private http: HttpClient) {}

  /**
   * Get or create current user
   * Retrieves the current authenticated user or creates a new one if it doesn't exist
   */
  getOrCreateCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/me`).pipe(
      // <keep this when geenrating from prompt.md>
      tap((user) => this.currentUserSubject.next(user))
      // </end of keep this when geenrating from prompt.md>
    );
  }

  /**
   * Get user by username
   * Retrieves a user by their username
   */
  getUserByUsername(username: string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${username}`);
  }

  /**
   * Check if user exists
   * Checks whether a user with the specified username exists
   */
  checkUserExists(username: string): Observable<void> {
    return this.http.get<void>(`${this.baseUrl}/${username}/exists`);
  }

  /**
   * Update user default currency
   * Updates the default currency for a specific user. Accepts 3-letter ISO currency codes.
   */
  updateUserCurrency(username: string, currencyCode: Currency): Observable<User> {
    const params = new HttpParams().set('currencyCode', currencyCode);
    return this.http.put<User>(`${this.baseUrl}/${username}/currency`, {}, { params });
  }

  /**
   * Update user country
   * Updates the country for a specific user. Accepts both alpha-2 and alpha-3 country codes.
   */
  updateUserCountry(username: string, countryCode: Country): Observable<User> {
    const params = new HttpParams().set('countryCode', countryCode);
    return this.http.put<User>(`${this.baseUrl}/${username}/country`, {}, { params });
  }
}