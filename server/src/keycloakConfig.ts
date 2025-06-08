import Keycloak from 'keycloak-connect';
import session from 'express-session';
import express from 'express';

 export const keycloakConfig = {
        'realm': 'Messenger',
        'auth-server-url': 'http://localhost:8080/auth',
        'ssl-required': 'external',
        'resource': 'Messenger-realm',
        'public-client': true,
        'confidential-port': 0,
    };
export function initializeKeycloak() {
    const memoryStore = new session.MemoryStore();
    const app = express();

    app.use(session({
        secret: 'some secret',
        resave: false,
        saveUninitialized: true,
        store: memoryStore,
    }));

   

    const keycloak = new Keycloak({ store: memoryStore }, keycloakConfig);

    app.use(keycloak.middleware({
        logout: '/logout',
        admin: '/admin',
    }));

    return keycloak;
}