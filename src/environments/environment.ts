export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080',
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
