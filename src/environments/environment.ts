export const environment = {
  production: true,
  
  // Keycloak Configuration
  keycloak: {
    url: 'https://auth.ghassen.io',
    realm: 'pockito',
    clientId: 'pockito-web'
  },
  
  // API Configuration
  api: {
    baseUrl: 'http://localhost:8080/api'
  },
  
  // Application Configuration
  app: {
    name: 'Pockito',
    version: '1.0.0'
  },
  
  // Feature Flags
  features: {
    pwa: true,
    analytics: false,
    debug: false
  }
};
