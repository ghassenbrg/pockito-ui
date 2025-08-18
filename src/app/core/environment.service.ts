import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export interface EnvironmentConfig {
  production: boolean;
  keycloak: {
    url: string;
    realm: string;
    clientId: string;
  };
  api: {
    baseUrl: string;
  };
  app: {
    name: string;
    version: string;
  };
  features: {
    pwa: boolean;
    analytics: boolean;
    debug: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {
  private _config: EnvironmentConfig | null = null;
  private configLoaded = false;
  private loadingPromise: Promise<void> | null = null;

  constructor() {}

  /**
   * Load configuration with priority system:
   * 1. Environment Variables (highest priority - Docker/container)
   * 2. Environment Files (fallback - development defaults)
   * 3. Hardcoded Defaults (lowest priority - safety net)
   */
  async loadConfig(): Promise<void> {
    // If already loading, wait for that promise
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    // If already loaded, return immediately
    if (this.configLoaded && this._config) {
      return Promise.resolve();
    }

    // Start loading
    this.loadingPromise = this._loadConfigInternal();
    try {
      await this.loadingPromise;
    } finally {
      this.loadingPromise = null;
    }
  }

  private async _loadConfigInternal(): Promise<void> {
    try {
      // Always merge environment variables with environment files
      this._config = this.mergeConfigurations();
      this.configLoaded = true;

    } catch (error) {
      console.error('Failed to load configuration:', error);
      // Use fallback configuration
      this._config = this.getFallbackConfig();
      this.configLoaded = true;

    }
  }

  /**
   * Ensure configuration is loaded (called automatically by getters)
   */
  private async ensureConfigLoaded(): Promise<void> {
    if (!this.configLoaded || !this._config) {
      await this.loadConfig();
    }
  }

  /**
   * Merge configurations with priority: Environment Variables > Environment Files > Defaults
   */
  private mergeConfigurations(): EnvironmentConfig {
    // Start with environment file defaults
    const envFileConfig = this.loadFromEnvironmentFiles();
    
    // Get environment variables (if any)
    const envVars = this.loadFromEnvironmentVariables();
    
    // Merge with environment variables taking precedence
    return {
      production: envVars.production ?? envFileConfig.production,
      keycloak: {
        url: envVars.keycloak?.url || envFileConfig.keycloak.url,
        realm: envVars.keycloak?.realm || envFileConfig.keycloak.realm,
        clientId: envVars.keycloak?.clientId || envFileConfig.keycloak.clientId
      },
      api: {
        baseUrl: envVars.api?.baseUrl || envFileConfig.api.baseUrl
      },
      app: {
        name: envVars.app?.name || envFileConfig.app.name,
        version: envVars.app?.version || envFileConfig.app.version
      },
      features: {
        pwa: envVars.features?.pwa !== undefined ? envVars.features.pwa : envFileConfig.features.pwa,
        analytics: envVars.features?.analytics !== undefined ? envVars.features.analytics : envFileConfig.features.analytics,
        debug: envVars.features?.debug !== undefined ? envVars.features.debug : envFileConfig.features.debug
      }
    };
  }

  /**
   * Load configuration from Angular environment files (development defaults)
   */
  private loadFromEnvironmentFiles(): EnvironmentConfig {
    return {
      production: environment.production,
      keycloak: {
        url: environment.keycloak?.url || 'http://localhost:8081',
        realm: environment.keycloak?.realm || 'pockito',
        clientId: environment.keycloak?.clientId || 'pockito-web'
      },
      api: {
        baseUrl: environment.api?.baseUrl || 'api'
      },
      app: {
        name: environment.app?.name || 'Pockito',
        version: environment.app?.version || '1.0.0'
      },
      features: {
        pwa: true,
        analytics: false,
        debug: true
      }
    };
  }

  /**
   * Load configuration from environment variables (set by Docker)
   * Returns partial config with only defined values
   */
  private loadFromEnvironmentVariables(): Partial<EnvironmentConfig> {
    // Access environment variables that Angular can see
    // These are injected during the build process or can be set in the container
    const env = (window as any).__ENV__ || {};
    
    const config: Partial<EnvironmentConfig> = {};
    
    // Only set values that are actually defined in environment variables
    if (env.NODE_ENV !== undefined) {
      config.production = env.NODE_ENV === 'production';
    }
    
    if (env.KEYCLOAK_AUTH_SERVER_URL || env.KEYCLOAK_REALM || env.KEYCLOAK_CLIENT_ID) {
      config.keycloak = {
        url: env.KEYCLOAK_AUTH_SERVER_URL || '',
        realm: env.KEYCLOAK_REALM || '',
        clientId: env.KEYCLOAK_CLIENT_ID || ''
      };
    }
    
    if (env.API_BASE_URL) {
      config.api = { baseUrl: env.API_BASE_URL };
    }
    
    if (env.APP_NAME || env.APP_VERSION) {
      config.app = {
        name: env.APP_NAME || '',
        version: env.APP_VERSION || ''
      };
    }
    
    if (env.PWA_ENABLED !== undefined || env.ANALYTICS_ENABLED !== undefined || env.DEBUG_ENABLED !== undefined) {
      config.features = {
        pwa: env.PWA_ENABLED !== undefined ? env.PWA_ENABLED !== 'false' : false,
        analytics: env.ANALYTICS_ENABLED !== undefined ? env.ANALYTICS_ENABLED === 'true' : false,
        debug: env.DEBUG_ENABLED !== undefined ? env.DEBUG_ENABLED === 'true' : false
      };
    }
    
    return config;
  }

  /**
   * Fallback configuration if everything else fails
   */
  private getFallbackConfig(): EnvironmentConfig {
    return {
      production: false,
      keycloak: {
        url: 'https://auth.ghassen.io',
        realm: 'pockito',
        clientId: 'pockito-web'
      },
      api: {
        baseUrl: '/api'
      },
      app: {
        name: 'Pockito',
        version: '1.0.0'
      },
      features: {
        pwa: true,
        analytics: false,
        debug: true
      }
    };
  }

  /**
   * Validate configuration object
   */
  private validateConfig(config: any): EnvironmentConfig | null {
    try {
      if (config && 
          config.keycloak && 
          config.keycloak.url && 
          config.keycloak.realm && 
          config.keycloak.clientId) {
        return config as EnvironmentConfig;
      }
    } catch (error) {
      console.error('Invalid configuration format:', error);
    }
    return null;
  }

  // ===== CONVENIENT GETTER METHODS (AUTO-LOADING) =====

  /**
   * Check if configuration is loaded
   */
  get isReady(): boolean {
    return this.configLoaded && this._config !== null;
  }

  /**
   * Get the complete configuration object (auto-loads if needed)
   */
  get config(): EnvironmentConfig {
    if (!this.isReady) {
      // Auto-load config synchronously (this will work because config is already available)
      this.ensureConfigLoaded().catch(console.error);
      if (!this._config) {
        throw new Error('Configuration not available');
      }
    }
    return this._config!;
  }

  // ===== KEYCLOAK CONFIGURATION (AUTO-LOADING) =====

  /**
   * Get Keycloak server URL (auto-loads config if needed)
   */
  get keycloakUrl(): string {
    return this.config.keycloak.url;
  }

  /**
   * Get Keycloak realm (auto-loads config if needed)
   */
  get keycloakRealm(): string {
    return this.config.keycloak.realm;
  }

  /**
   * Get Keycloak client ID (auto-loads config if needed)
   */
  get keycloakClientId(): string {
    return this.config.keycloak.clientId;
  }

  // ===== API CONFIGURATION (AUTO-LOADING) =====

  /**
   * Get API base URL (auto-loads config if needed)
   */
  get apiBaseUrl(): string {
    return this.config.api.baseUrl;
  }

  /**
   * Build full API URL with path (auto-loads config if needed)
   */
  getApiUrl(path: string = ''): string {
    const baseUrl = this.apiBaseUrl;
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return baseUrl.endsWith('/') ? `${baseUrl}${cleanPath}` : `${baseUrl}/${cleanPath}`;
  }

  // ===== APP CONFIGURATION (AUTO-LOADING) =====

  /**
   * Get application name (auto-loads config if needed)
   */
  get appName(): string {
    return this.config.app.name;
  }

  /**
   * Get application version (auto-loads config if needed)
   */
  get appVersion(): string {
    return this.config.app.version;
  }

  // ===== FEATURE FLAGS (AUTO-LOADING) =====

  /**
   * Check if PWA is enabled (auto-loads config if needed)
   */
  get isPwaEnabled(): boolean {
    return this.config.features.pwa;
  }

  /**
   * Check if analytics is enabled (auto-loads config if needed)
   */
  get isAnalyticsEnabled(): boolean {
    return this.config.features.analytics;
  }

  /**
   * Check if debug mode is enabled (auto-loads config if needed)
   */
  get isDebugEnabled(): boolean {
    return this.config.features.debug;
  }

  /**
   * Check if production mode is enabled (auto-loads config if needed)
   */
  get isProduction(): boolean {
    return this.config.production;
  }

  /**
   * Check if development mode is enabled (auto-loads config if needed)
   */
  get isDevelopment(): boolean {
    return !this.config.production;
  }

  // ===== LEGACY METHODS (for backward compatibility) =====

  /**
   * @deprecated Use isReady instead
   */
  isConfigLoaded(): boolean {
    return this.isReady;
  }

  /**
   * @deprecated Use config instead
   */
  getConfig(): EnvironmentConfig {
    return this.config;
  }

  /**
   * @deprecated Use keycloakUrl instead
   */
  getKeycloakUrl(): string {
    return this.keycloakUrl;
  }

  /**
   * @deprecated Use apiBaseUrl instead
   */
  getApiBaseUrl(): string {
    return this.apiBaseUrl;
  }

  /**
   * @deprecated Use isProduction instead
   */
  isProductionMode(): boolean {
    return this.isProduction;
  }

  /**
   * @deprecated Use isFeatureEnabled instead
   */
  isFeatureEnabled(feature: keyof EnvironmentConfig['features']): boolean {
    return this.config.features[feature];
  }

  // ===== DEBUG METHODS =====

  /**
   * Debug method to show configuration sources
   */
  debugConfigSources(): void {
    // Load configuration from multiple sources for debugging
    this.loadFromEnvironmentFiles();
    this.loadFromEnvironmentVariables();
  }

  /**
   * Get configuration summary for debugging
   */
  getConfigSummary(): any {
    if (!this.isReady) {
      return { status: 'not-loaded' };
    }

    return {
      status: 'loaded',
      production: this.isProduction,
      keycloak: {
        url: this.keycloakUrl,
        realm: this.keycloakRealm,
        clientId: this.keycloakClientId
      },
      api: {
        baseUrl: this.apiBaseUrl
      },
      app: {
        name: this.appName,
        version: this.appVersion
      },
      features: {
        pwa: this.isPwaEnabled,
        analytics: this.isAnalyticsEnabled,
        debug: this.isDebugEnabled
      }
    };
  }
}
