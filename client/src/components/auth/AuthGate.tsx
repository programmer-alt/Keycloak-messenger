import React, {ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import keycloak from '../../keycloakClient/keycloakInitClient';

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
    const { authenticated, loading } = useAuth();

    const handleLogout = async () => {
        // вызываем серверный endpoint для логаута
        try {
            await fetch('http://localhost:3000/logout', {
                credentials: 'include'
            });
            // вызываем клиентский endpoint для логаута
            keycloak.logout({
                redirectUri: window.location.origin
            });
        } catch (error) {
            console.error(' Ошибка при выходе:', error);
            keycloak.logout({
                redirectUri: window.location.origin
            });
        }
    };

    if (loading) {
        return <div>Проверка авторизации...</div>;
    }
    if (!authenticated) {
        return <div>Пожалуйста, войдите через Keycloak</div>;
    }
    return (
        <>
        <div> 
             <button 
                onClick={handleLogout}
                style={{ 
                    padding: '8px 16px', 
                    backgroundColor: '#dc3545', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
            >
                Выйти c  чата 
            </button>
        </div>
            {children}
        </>
    );
};
