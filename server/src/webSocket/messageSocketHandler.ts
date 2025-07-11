import { Server as SocketIOServer } from "socket.io";
import { saveMessage, clearUserMessages } from "../utilsComponents/messageService";
import { AuthenticatedSocket } from "../middleware/socketAuthMiddleware";

/**
 * Компонент ответственный  за обработку сообщений через WebSocket
 */
// Карта для хранения соответствия userId -> socketId
const userSocketMap = new Map<string, string>();

interface ClientMessageData {
  recipientId: string;
  content: string;
}

export function registerMessageSocketHandler(io: SocketIOServer) {
  io.on("connection", (socket: AuthenticatedSocket) => {
    console.log(
      `Пользователь подключился к WebSocket Socket ID: ${socket.id}, User ID: ${socket.userId}`
    );

    if (socket.userId) {
      userSocketMap.set(socket.userId, socket.id);
    }

    socket.on("sendMessage", async (data: ClientMessageData) => {
      try {
        const senderId = socket.userId;

        if (!senderId) {
          throw new Error(
            "Критическая ошибка: ID пользователя отсутствует в аутентифицированном сокете."
          );
        }

        const { recipientId, content } = data;

        // Сохраняем сообщение
        const savedMessage = await saveMessage(senderId, recipientId, content);

        // Получаем socketId получателя из карты
        const recipientSocketId = userSocketMap.get(recipientId);

        // Отправляем сообщение получателю, если он онлайн
        if (recipientSocketId) {
          io.to(recipientSocketId).emit("newMessage", savedMessage);
        }

        // Отправляем сообщение обратно отправителю
        socket.emit("newMessage", savedMessage);
      } catch (error) {
        console.error(
          "Ошибка при сохранении сообщения через WebSocket:",
          error
        );
        socket.emit("message_error", "Не удалось отправить сообщение");
      }
    });

    // Обработчик события очистки сообщений
    socket.on("clearMessages", async () => {
      try {
        const userId = socket.userId;

        if (!userId) {
          throw new Error(
            "Критическая ошибка: ID пользователя отсутствует в аутентифицированном сокете."
          );
        }

        // Очищаем сообщения пользователя
        const deletedCount = await clearUserMessages(userId);

        // Отправляем уведомление самому пользователю
        socket.emit("messagesCleared", { success: true, count: deletedCount });

        // Также можно оповестить других пользователей, с которыми был чат
        // Но для этого нужно знать, с кем именно были сообщения
        // Здесь можно либо отправить всем, либо найти в базе данных соответствующих собеседников

        console.log(`Пользователь ${userId} очистил ${deletedCount} сообщений`);
      } catch (error) {
        console.error("Ошибка при очистке сообщений через WebSocket:", error);
        socket.emit("clearMessages_error", "Не удалось очистить сообщения");
      }
    });

    socket.on("disconnect", () => {
      if (socket.userId) {
        userSocketMap.delete(socket.userId);
      }
      console.log("Пользователь отключился от WebSocket");
    });
  });
}
