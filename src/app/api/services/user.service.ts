import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserDto } from '@api/model/user.model';
import { Currency, Country } from '@api/model/common.model';
import { environment } from '@environments/environment';
import { catchError, tap } from 'rxjs/operators';
import { ToastService } from '@shared/services/toast.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly baseUrl = `${environment.api.baseUrl}/users`;

  constructor(
    private http: HttpClient,
    private toastService: ToastService
  ) {}

  /**
   * Get or create current user
   * Retrieves the current authenticated user or creates a new one if it doesn't exist.
   */
  getOrCreateCurrentUser(): Observable<UserDto> {
    return this.http.get<UserDto>(`${this.baseUrl}/me`).pipe(
      tap(user => {
        if (user.username) {
          this.toastService.showSuccess('welcomeBack', { username: user.username });
        }
      }),
      catchError(error => {
        console.error('Error getting/creating current user:', error);
        throw error; // Re-throw error for component handling
      })
    );
  }

  /**
   * Get user by username
   * Retrieves a user by their username
   */
  getUserByUsername(username: string): Observable<UserDto> {
    return this.http.get<UserDto>(`${this.baseUrl}/${username}`).pipe(
      catchError(error => {
        console.error(`Error fetching user ${username}:`, error);
        throw error; // Re-throw error for component handling
      })
    );
  }

  /**
   * Check if user exists
   * Checks whether a user with the specified username exists
   */
  checkUserExists(username: string): Observable<void> {
    return this.http.get<void>(`${this.baseUrl}/${username}/exists`).pipe(
      catchError(error => {
        console.error(`Error checking if user ${username} exists:`, error);
        throw error; // Re-throw error for component handling
      })
    );
  }

  /**
   * Update user default currency
   * Updates the default currency for a specific user. Accepts 3-letter ISO currency codes.
   */
  updateUserCurrency(username: string, currencyCode: Currency): Observable<UserDto> {
    const params = new HttpParams().set('currencyCode', currencyCode);
    return this.http.put<UserDto>(`${this.baseUrl}/${username}/currency`, {}, { params }).pipe(
      tap(() => {
        this.toastService.showSuccess('currencyUpdated', { currency: currencyCode });
      }),
      catchError(error => {
        console.error(`Error updating currency for user ${username}:`, error);
        throw error; // Re-throw error for component handling
      })
    );
  }

  /**
   * Update user country
   * Updates the country for a specific user. Accepts both alpha-2 and alpha-3 country codes.
   */
  updateUserCountry(username: string, countryCode: Country): Observable<UserDto> {
    const params = new HttpParams().set('countryCode', countryCode);
    return this.http.put<UserDto>(`${this.baseUrl}/${username}/country`, {}, { params }).pipe(
      tap(() => {
        this.toastService.showSuccess('countryUpdated', { country: countryCode });
      }),
      catchError(error => {
        console.error(`Error updating country for user ${username}:`, error);
        throw error; // Re-throw error for component handling
      })
    );
  }
}

