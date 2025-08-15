import { Injectable } from '@angular/core';

declare const Keycloak: any;

@Injectable({ providedIn: 'root' })
export class KeycloakService {
  private kc: any;

  async init(cfg: { url: string; realm: string; clientId: string; }) {
    // @ts-ignore
    this.kc = new (window as any).Keycloak(cfg);
    await this.kc.init({ onLoad: 'login-required' });
  }

  login() { return this.kc.login(); }
  logout() { return this.kc.logout(); }
  getToken(): Promise<string> { return this.kc.updateToken(30).then(() => this.kc.token); }
  getRoles(): string[] { return this.kc.realmAccess?.roles ?? []; }
  isAuthenticated(): boolean { return !!this.kc?.authenticated; }
}
