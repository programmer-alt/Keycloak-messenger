import { Server as SocketIOServer } from "socket.io";
import { AuthenticatedSocket } from "../middleware/socketAuthMiddleware";
import { clearUserMessages, saveMessage } from "../utilsComponents/messageService";

export function registerMessageSocketHandler(io: SocketIOServer) {
  io.on("connection", (socket: AuthenticatedSocket) => {
    
    socket.on("clearMessages", async () => {
      try {
        const userId = socket.userId;
        
        if (!userId) {
          throw new Error("ID пользователя отсутствует");
        }

        console.log(`Очистка сообщений для пользователя: ${userId}`);
        
        const deletedCount = await clearUserMessages(userId);
        
        // Отправляем подтверждение клиенту
        socket.emit("messagesCleared", { 
          success: true, 
          count: deletedCount 
        });
        
        console.log(`Удалено ${deletedCount} сообщений для пользователя ${userId}`);
      } catch (error) {
        console.error("Ошибка при очистке сообщений:", error);
        socket.emit("clearMessages_error", "Не удалось очистить сообщения");
      }
    });

    // Добавляем обработчик отправки сообщений
    socket.on("sendMessage", async (messagePayload: { recipientId: string; content: string }) => {
      try {
        const senderId = socket.userId;
        if (!senderId) {
          throw new Error("ID отправителя отсутствует");
        }
        const { recipientId, content } = messagePayload;
        if (!recipientId || !content) {
          throw new Error("Получатель и содержимое сообщения обязательны");
        }

        // Сохраняем сообщение в базе
        const savedMessage = await saveMessage(senderId, recipientId, content);

        // Отправляем новое сообщение всем подключенным клиентам
        io.emit("newMessage", savedMessage);

        console.log(`Новое сообщение от ${senderId} к ${recipientId}: ${content}`);
      } catch (error) {
        console.error("Ошибка при отправке сообщения:", error);
        socket.emit("sendMessage_error", "Не удалось отправить сообщение");
      }
    });
  });
}
