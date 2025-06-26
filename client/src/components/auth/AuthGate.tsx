import React, {ReactNode } from 'react';
import { useKeycloakAuth } from '../../hooks/useKeycloakAuth';

/**
 * AuthGate — компонент для проверки аутентификации пользователя через Keycloak.
 * Если пользователь не авторизован — показывает "Загрузка...".
 * Если авторизован — рендерит дочерние элементы с передачей user.
 */
interface AuthGateProps {
    // пропс для проверки аутентификации
    children: (user: string | undefined) => ReactNode;
}

export const AuthGate: React.FC<AuthGateProps> = ({ children }) => {
    const { user, authenticated, loading } = useKeycloakAuth();

    if(loading) {
        return <div>Загрузка...</div>;
    }
    if(!authenticated) {
        return <div>Пожалуйста, войдите через Keycloak</div>;
    }
    return (
        <>
            {children(user)}
        </>
    );
}
