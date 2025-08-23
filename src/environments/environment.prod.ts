export const environment = {
  production: true,
  apiUrl: '/api', // Relative path for production
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
  }
};
