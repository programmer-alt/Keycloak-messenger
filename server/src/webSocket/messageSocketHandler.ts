import { Server as SocketIOServer } from "socket.io";
import { AuthenticatedSocket } from "../middleware/socketAuthMiddleware";
import { clearUserMessages, saveMessage } from "../utilsComponents/messageService";

const userSocketMap = new Map<string, string>(); // userId -> socketId

export function registerMessageSocketHandler(io: SocketIOServer) {
  io.on("connection", (socket: AuthenticatedSocket) => {
    const userId = socket.userId;
    if (userId) {
      userSocketMap.set(userId, socket.id);
    }

    socket.on("disconnect", () => {
      if (userId) {
        userSocketMap.delete(userId);
      }
    });

    socket.on("clearMessages", async () => {
      try {
        if (!userId) {
          throw new Error("ID пользователя отсутствует");
        }

        console.log(`Очистка сообщений для пользователя: ${userId}`);

        const deletedCount = await clearUserMessages(userId);

        socket.emit("messagesCleared", {
          success: true,
          count: deletedCount,
        });

        console.log(`Удалено ${deletedCount} сообщений для пользователя ${userId}`);
      } catch (error) {
        console.error("Ошибка при очистке сообщений:", error);
        socket.emit( "Не удалось очистить сообщения");
      }
    });

    socket.on(
      "sendMessage",
      async (messagePayload: { recipientId: string; content: string }) => {
        try {
          if (!userId) {
            throw new Error("ID отправителя отсутствует");
          }
          const { recipientId, content } = messagePayload;
          if (!recipientId || !content) {
            throw new Error("Получатель и содержимое сообщения обязательны");
          }

          console.log("Текущий userSocketMap:", Array.from(userSocketMap.entries()));
          console.log("Полученный recipientId:", recipientId);

          // Сохраняем сообщение в базе
          const savedMessage = await saveMessage(userId, recipientId, content);

          // Отправляем новое сообщение отправителю
          socket.emit("newMessage", savedMessage);

          // Отправляем новое сообщение получателю, если он онлайн
          const recipientSocketId = userSocketMap.get(recipientId);
          if (recipientSocketId) {
            io.to(recipientSocketId).emit("newMessage", savedMessage);
          } else {
            console.log(`SocketId для получателя ${recipientId} не найден`);
          }

          console.log(
            `Новое сообщение от ${userId} к ${recipientId}: ${content}`
          );
        } catch (error) {
          console.error("Ошибка при отправке сообщения:", error);
          socket.emit("sendMessage_error", "Не удалось отправить сообщение");
        }
      }
    );
  });
}
