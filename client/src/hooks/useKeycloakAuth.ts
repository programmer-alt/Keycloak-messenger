import { useEffect, useState } from 'react';
import keycloak from '../keycloakClient/keycloakInitClient';

/**
 * Хук для работы с авторизацией через Keycloak.
 * Возвращает объект с данными об авторизации пользователя и экземпляром Keycloak.
 */

interface KeycloakAuth {
    authenticated: boolean;
    user: string | undefined;
    keycloakInstance: typeof keycloak;
    loading: boolean;
}
export function useKeycloakAuth(): KeycloakAuth {
    // для хранения информации об авторизации
    const [authenticated, setAuthenticated] = useState(false);
    // для хранения имени пользователя (если авторизация успешна)
    const [user, setUser] = useState<string | undefined>(undefined);
    // для хранения состояния загрузки
    const [loading, setLoading] = useState(true);

    // инициализация Keycloak
    useEffect(() => {
        // проверка авторизации при загрузке страницы
        keycloak.init({ onLoad: 'login-required' })
            .then((auth: boolean) => {
                setAuthenticated(auth);
                if (auth) {
                    setUser(keycloak.tokenParsed?.preferred_username);
                }
            })
            .catch((err: unknown) => {
                console.error('Keycloak init failed', err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    return {
        authenticated,
        user,
        keycloakInstance: keycloak,
        loading,
    };
}
