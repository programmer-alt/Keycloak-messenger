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
    const { user, authenticated } = useKeycloakAuth();

    if(!authenticated) {
        return <div>Загрузка...</div>;
    }
    return (
        <>
            {children(user)}
        </>
    );
}