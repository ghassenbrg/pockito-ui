import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { 
  ProtectedResponse, 
  HealthResponse, 
  EchoResponse, 
  PublicResponse 
} from '../models/api-models';
import { EnvironmentService } from '../core/environment.service';

/**
 * Service for utility endpoints including health checks, echo, and protected access
 * Based on OpenAPI specification for Pockito API
 */
@Injectable({
  providedIn: 'root'
})
export class UtilitiesService {

  constructor(
    private http: HttpClient,
    private environmentService: EnvironmentService
  ) {
    // No initialization needed! EnvironmentService auto-loads when needed
  }

  /**
   * Access protected endpoint that requires authentication with USER role
   * @returns Observable of protected response data
   */
  accessProtectedEndpoint(): Observable<ProtectedResponse> {
    // Just use environmentService.apiBaseUrl directly - it auto-loads config if needed!
    return this.http.post<ProtectedResponse>(`${this.environmentService.apiBaseUrl}/sample/protected`, {});
  }

  /**
   * Get health status of the Pockito API service
   * @returns Observable of health response data
   */
  getHealthStatus(): Observable<HealthResponse> {
    // Just use environmentService.apiBaseUrl directly - it auto-loads config if needed!
    return this.http.get<HealthResponse>(`${this.environmentService.apiBaseUrl}/sample/health`);
  }

  /**
   * Echo back a message with additional metadata
   * @param message - Message to echo back (1-100 characters)
   * @returns Observable of echo response data
   */
  echoMessage(message: string): Observable<EchoResponse> {
    if (!message || message.trim().length === 0) {
      throw new Error('Message cannot be empty or null');
    }
    if (message.length > 100) {
      throw new Error('Message cannot exceed 100 characters');
    }
    // Just use environmentService.apiBaseUrl directly - it auto-loads config if needed!
    return this.http.get<EchoResponse>(`${this.environmentService.apiBaseUrl}/sample/echo/${encodeURIComponent(message)}`);
  }

  /**
   * Access public endpoint that doesn't require authentication
   * @returns Observable of public response data
   */
  getPublicInfo(): Observable<PublicResponse> {
    // Just use environmentService.apiBaseUrl directly - it auto-loads config if needed!
    return this.http.get<PublicResponse>(`${this.environmentService.apiBaseUrl}/public`);
  }
}
