/*
 объект конфигурации для интеграции с Keycloak, 
Конфигурация экспортируется как `keycloakConfig`,

*/

export const keycloakConfig = {
        'realm': 'Messenger',
        'auth-server-url': 'http://localhost:8080/auth',
        'ssl-required': 'external',
        'resource': 'Messenger-realm',
         'credentials': {
        secret: 'AGjchgw3eURL0WqmdfU5f3zYogG4And9', 
    },
        'public-client': true,
        'confidential-port': 0,
    };