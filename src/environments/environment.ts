export const environment = {
  production: false,
  keycloak: {
    url: 'http://localhost:8081',
    realm: 'pockito',
    clientId: 'pockito-web'
  },
  api: {
    baseUrl: 'http://localhost:8080/api'
  },
  app: {
    name: 'Pockito',
    version: '1.0.0'
  }
};
