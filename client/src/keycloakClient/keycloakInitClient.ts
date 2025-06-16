
import Keycloak from 'keycloak-js';

const keycloak = Keycloak({
    url: 'http://localhost:8080/auth',
    realm: 'Messenger',
    clientId: 'messenger-client',
});

export default keycloak;