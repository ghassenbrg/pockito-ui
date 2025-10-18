import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserDto, Currency, Country } from '../models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly baseUrl = '/api/users';

  constructor(private http: HttpClient) {}

  /**
   * Get or create current user
   * Retrieves the current authenticated user or creates a new one if it doesn't exist
   */
  getOrCreateCurrentUser(): Observable<UserDto> {
    return this.http.get<UserDto>(`${this.baseUrl}/me`);
  }

  /**
   * Get user by username
   */
  getUserByUsername(username: string): Observable<UserDto> {
    return this.http.get<UserDto>(`${this.baseUrl}/${username}`);
  }

  /**
   * Check if user exists
   */
  checkUserExists(username: string): Observable<void> {
    return this.http.get<void>(`${this.baseUrl}/${username}/exists`);
  }

  /**
   * Update user default currency
   * Updates the default currency for a specific user. Accepts 3-letter ISO currency codes.
   */
  updateUserCurrency(username: string, currencyCode: Currency): Observable<UserDto> {
    const params = new HttpParams().set('currencyCode', currencyCode);
    return this.http.put<UserDto>(`${this.baseUrl}/${username}/currency`, {}, { params });
  }

  /**
   * Update user country
   * Updates the country for a specific user. Accepts both alpha-2 and alpha-3 country codes.
   */
  updateUserCountry(username: string, countryCode: Country): Observable<UserDto> {
    const params = new HttpParams().set('countryCode', countryCode);
    return this.http.put<UserDto>(`${this.baseUrl}/${username}/country`, {}, { params });
  }
}
