import { Server as SocketIOServer, Socket } from "socket.io";
import { saveMessage } from "../utilsComponents/messageService";

// Ключ Id пользователя из Keycloak, значение id сокета
const userSocket = new Map<string, string>();

export function registerUserSocketHandler(io: SocketIOServer) {
  io.on("connection", (socket: Socket) => {
    // Получаем ID пользователя из токена, который мы добавили при аутентификации сокет
    const userId = (socket as any).decoded_token?.sub;

    if (userId) {
      // Сохраняем соответствие между ID пользователя и идентификатором сокета
      userSocket.set(userId, socket.id);
      console.log(
        `Пользователь ${userId} подключился к сокету с ID: ${socket.id}`
      );
    }

    socket.on("sendMessage", async ({ recipientId, content }) => {
      const senderId = (socket as any).decoded_token?.sub;
      if (!senderId) {
        console.error("Не удалось получить senderId из токена");
        return;
      }
      const savedMessage = await saveMessage(senderId, recipientId, content);
      // находим сокет получателя из нашей карты
      const recipientSocketId = userSocket.get(recipientId);
      // если получатель онлайн, отправляем ему сообщение
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("newMessage", {
          sender: senderId,
          content: content,
          created_at: savedMessage.created_at,
          id: savedMessage.id,
        });
      }
      // отправляем сообщение обратно отправителю
      socket.emit("newMessage", {
        sender: senderId,
        recipientId: recipientId,
        content: content,
        created_at: savedMessage.created_at,
        id: savedMessage.id,
      });
    });

    // очищаем карту при отключении
    socket.on("disconnect", () => {
      for (let [key, value] of userSocket.entries()) {
        if (value === socket.id) {
          userSocket.delete(key);
          break;
        }
      }
      console.log(`Пользователь с сокетом ${socket.id} отключился`);
    });
  });
}
