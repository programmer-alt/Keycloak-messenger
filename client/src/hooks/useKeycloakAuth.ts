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
}
export function useKeycloakAuth(): KeycloakAuth {
    // для хранения информации об авторизации
    const [authenticated, setAuthenticated] = useState(false);
    // для хранения имени пользователя (если авторизация успешна)
    const [user, setUser] = useState<string | undefined>(undefined);

    // инициализация Keycloak
    useEffect(() => {
        // проверка авторизации при загрузке страницы
        keycloak.init({ onLoad: 'login-required' }).success((auth: boolean) => {
            // обновление состояний при успешной авторизации
            setAuthenticated(auth);
            // если авторизация успешна, получение имени пользователя
            if (auth) {
                // @ts-expect-error
                setUser(keycloak.tokenParsed?.preferred_username);
            }
        }).error((err: any) => {
            console.error('Keycloak init failed', err);
        });
    }, []);

    return {
        authenticated,
        user,
        keycloakInstance: keycloak,
    };
}
