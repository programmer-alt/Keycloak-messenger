import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
    url: 'http://localhost:8080',
    realm: 'Messenger',
    clientId: 'MessengerClient',
});

export default keycloak;