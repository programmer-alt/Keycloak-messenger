import { Socket } from "socket.io";
import Keycloak from "keycloak-connect";

/**
 * Задачи socketAuthMiddleware * - Проверка токена * - Извлечение ID пользователя из токена *
 * - Проверка существования пользователя * - Возвращение ID пользователя* - Middleware для проверки токена при подключении к сокету
 */
// Расширяем тип Socket, чтобы TypeScript знал о поле `userId`
export interface AuthenticatedSocket extends Socket {
  userId?: string;
}

export const socketAuthMiddleware =
  (keycloak: Keycloak.Keycloak) =>
  async (socket: AuthenticatedSocket, next: (err?: Error) => void) => {
    // получаем токен из авторизации
    const { token } = socket.handshake.auth;

    if (!token) {
      return next(new Error("Ошибка авторизации: токен не предоставлен"));
    }

    try {
      // получаем GrantManager из keycloak
      const { grantManager } = keycloak;
      const grant = await grantManager.createGrant({ access_token: token });
      const tokenContent = (grant.access_token as any)?.content
        if (!tokenContent){
            return next(new Error(" Ошибка авторизации: неверный токен"))
        }
        // Устанавливаем userId как UUID (sub) для унификации
        socket.userId = tokenContent.sub || tokenContent.preferred_username;
           // Сохраняем декодированный токен для совместимости с userSocketHandler
           (socket as any).decoded_token = tokenContent
           console.log(`WebSocket авторизация успешна для пользователя ${socket.userId}`)
      next();
    } catch (err) {
      console.error("Ошибка валидации токена:", err);
      next(new Error("Ошибка авторизации"));
    }
  };
