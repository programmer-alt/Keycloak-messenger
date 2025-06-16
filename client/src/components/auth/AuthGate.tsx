import React, {ReactNode } from 'react';
import { useKeycloakAuth } from '../../hooks/useKeycloakAuth';

interface AuthGateProps {
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