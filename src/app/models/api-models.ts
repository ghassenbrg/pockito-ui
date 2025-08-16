/**
 * API Response Models based on OpenAPI specification
 */

/**
 * Base error response structure
 */
export interface ErrorResponse {
  error: string;
  message: string;
  timestamp: string;
  status: number;
}

/**
 * Protected endpoint response
 */
export interface ProtectedResponse {
  message: string;
  timestamp: string;
  authenticated: boolean;
  userRole: string;
  accessLevel: string;
}

/**
 * Health check response
 */
export interface HealthResponse {
  status: string;
  timestamp: string;
  service: string;
  version: string;
  uptime: string;
}

/**
 * Echo response
 */
export interface EchoResponse {
  message: string;
  timestamp: string;
  length: number;
  uppercase: string;
  lowercase: string;
}

/**
 * Public endpoint response
 */
export interface PublicResponse {
  message: string;
  timestamp: string;
  authenticated: boolean;
  service: string;
}
