import React, {ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';

/**
 * AuthGate — компонент для проверки аутентификации пользователя через Keycloak.
 * Если пользователь не авторизован — показывает "Загрузка...".
 * Если авторизован — рендерит дочерние элементы с передачей user.
 */
interface AuthGateProps {
    // пропс для проверки аутентификации
    children:  ReactNode;
}

export const AuthGate: React.FC<AuthGateProps> = ({ children }) => {
    const { user, authenticated, loading } = useAuth();

    if(loading) {
        return <div>Проверка авторизации...</div>;
    }
    if(!authenticated) {
        return <div>Пожалуйста, войдите через Keycloak</div>;
    }
    return (
        <>
            {children}
        </>
    );
}
