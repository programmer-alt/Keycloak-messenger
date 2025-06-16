import { useEffect, useState } from 'react';
import keycloak from '../keycloakClient/keycloakInitClient';

interface KeycloakAuth {
    authenticated: boolean;
    user: string | undefined;
    keycloakInstance: typeof keycloak;
}

export function useKeycloakAuth(): KeycloakAuth {
    const [authenticated, setAuthenticated] = useState(false);
    const [user, setUser] = useState<string | undefined>(undefined);

    useEffect(() => {
        keycloak.init({ onLoad: 'login-required' }).success((auth: boolean) => {
            setAuthenticated(auth);
            if (auth) {
                // @ts-expect-error
                setUser(keycloak.tokenParsed?.preferred_username);
            }
        });
    }, []);

    return {
        authenticated,
        user,
        keycloakInstance: keycloak,
    };
}
