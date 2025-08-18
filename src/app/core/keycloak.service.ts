import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import * as Keycloak from 'keycloak-js';

export interface KeycloakConfig {
  url: string;
  realm: string;
  clientId: string;
}

@Injectable({ providedIn: 'root' })
export class KeycloakService {
  private keycloak: any = null;
  private authenticated$ = new BehaviorSubject<boolean>(false);
  private initialized$ = new BehaviorSubject<boolean>(false);

  constructor() {

  }

  async init(cfg: KeycloakConfig): Promise<boolean> {
    try {
      if (!(Keycloak as any).default) {
        throw new Error('Keycloak.default is not available');
      }

      this.keycloak = new (Keycloak as any).default(cfg);
      
      const authenticated = await this.keycloak.init({
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: window.location.origin + '/assets/silent-check-sso.html',
        pkceMethod: 'S256',
        enableLogging: false // Disable verbose logging
      });


      
      this.authenticated$.next(authenticated);
      this.initialized$.next(true);

      if (authenticated) {
        this.setupTokenRefresh();
      }

      return authenticated;
    } catch (error: any) {
      console.error('Keycloak initialization failed:', error.message);
      this.initialized$.next(true);
      return false;
    }
  }

  private setupTokenRefresh(): void {
    if (!this.keycloak) return;
    
    // Refresh token 10 seconds before it expires
    setInterval(() => {
      this.keycloak?.updateToken(70).catch(() => {
        this.authenticated$.next(false);
      });
    }, 60000);
  }

  login(options?: any): void {
    this.keycloak?.login(options);
  }

  register(): void {
    // Keycloak registration is handled through the login method with action=register
    this.keycloak?.login({ action: 'register' });
  }

  logout(options?: any): void {
    this.keycloak?.logout(options);
  }

  async getToken(): Promise<string> {
    if (!this.keycloak?.authenticated) {
      throw new Error('Not authenticated');
    }
    
    try {
      await this.keycloak.updateToken(70);
      return this.keycloak.token || '';
    } catch (error) {
      this.authenticated$.next(false);
      this.login();
      throw error;
    }
  }

  getRoles(): string[] {
    return this.keycloak?.realmAccess?.roles ?? [];
  }

  hasRole(role: string): boolean {
    return this.keycloak?.hasRealmRole?.(role) ?? false;
  }

  hasResourceRole(role: string, resource?: string): boolean {
    return this.keycloak?.hasResourceRole?.(role, resource) ?? false;
  }

  isAuthenticated(): boolean {
    return !!this.keycloak?.authenticated;
  }

  getAuthenticated(): Observable<boolean> {
    return this.authenticated$.asObservable();
  }

  getInitialized(): Observable<boolean> {
    return this.initialized$.asObservable();
  }

  getUserInfo(): any {
    return this.keycloak?.tokenParsed;
  }

  getUsername(): string {
    return this.keycloak?.tokenParsed?.preferred_username || 
           this.keycloak?.tokenParsed?.name || 
           'User';
  }

  getEmail(): string {
    return this.keycloak?.tokenParsed?.email || '';
  }

  getTokenExpiration(): number {
    return this.keycloak?.tokenParsed?.exp || 0;
  }

  isTokenExpired(): boolean {
    const exp = this.getTokenExpiration();
    return exp > 0 && exp * 1000 < Date.now();
  }

  accountManagement(): void {
    this.keycloak?.accountManagement();
  }

  async getTokenWithLifetime(lifetime: number): Promise<string> {
    if (!this.keycloak?.authenticated) {
      throw new Error('Not authenticated');
    }
    
    await this.keycloak.updateToken(lifetime);
    return this.keycloak.token || '';
  }
}
