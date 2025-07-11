import { Socket } from 'socket.io';
import Keycloak from 'keycloak-connect';

/**
 * Задачи socketAuthMiddleware * - Проверка токена * - Извлечение ID пользователя из токена *
 * - Проверка существования пользователя * - Возвращение ID пользователя* - Middleware для проверки токена при подключении к сокету
 */
// Расширяем тип Socket, чтобы TypeScript знал о поле `userId`
export interface AuthenticatedSocket extends Socket {
    userId?: string;
}

export const socketAuthMiddleware = (keycloak: Keycloak.Keycloak) => async (socket: AuthenticatedSocket, next: (err?: Error) => void) => {
    // получаем токен из авторизации
    const { token } = socket.handshake.auth;
    if (!token) {
        return next(new Error('Ошибка авторизации: токен не предоставлен'));
    }

    try {
        // получаем GrantManager из keycloak
        const { grantManager } = keycloak;

        // Валидация токена и получение информации о пользователе
        const userInfo = await grantManager.userInfo(token)  as { sub: string }; // Указываем тип для userInfo

        if (!userInfo || !userInfo.sub) {
            return next(new Error('Ошибка авторизации: неверный токен'));
        }

        
        socket.userId = userInfo.sub;
        

        next(); 
    } catch (err) {
        console.error("Ошибка валидации токена:", err);
        next(new Error('Ошибка авторизации'));
    }
};
