import { useEffect, useState } from 'react';
import keycloak from '../keycloakClient/keycloakInitClient';

/*
    хук для работы с авторизацией через Keycloak,
    возвращает объект с данными об авторизации
    и экземпляром Keycloak
    
*/

// интерфейс для возвращаемых данных
interface KeycloakAuth {
    authenticated: boolean;
    user: string | undefined;
    keycloakInstance: typeof keycloak;
}

export function useKeycloakAuth() {
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
