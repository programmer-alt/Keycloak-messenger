import { Server as SocketIOServer } from "socket.io";
import { saveMessage } from "../utilsComponents/messageService";
import { AuthenticatedSocket } from '../middleware/socketAuthMiddleware';

// Карта для хранения соответствия userId -> socketId
const userSocketMap = new Map<string, string>();

interface ClientMessageData {
    recipientId: string;
    content: string;
}

export function registerMessageSocketHandler(io: SocketIOServer) {
    io.on('connection', (socket: AuthenticatedSocket) => {
        console.log(`Пользователь подключился к WebSocket Socket ID: ${socket.id}, User ID: ${socket.userId}`);

        if (socket.userId) {
            userSocketMap.set(socket.userId, socket.id);
        }

        socket.on('sendMessage', async (data: ClientMessageData) => {
            try {
                const senderId = socket.userId;

                if (!senderId) {
                    throw new Error('Критическая ошибка: ID пользователя отсутствует в аутентифицированном сокете.');
                }

                const { recipientId, content } = data;

                // Сохраняем сообщение
                const savedMessage = await saveMessage(senderId, recipientId, content);

                // Получаем socketId получателя из карты
                const recipientSocketId = userSocketMap.get(recipientId);

                // Отправляем сообщение получателю, если он онлайн
                if (recipientSocketId) {
                    io.to(recipientSocketId).emit('newMessage', savedMessage);
                }

                // Отправляем сообщение обратно отправителю
                socket.emit('newMessage', savedMessage);

            } catch (error) {
                console.error('Ошибка при сохранении сообщения через WebSocket:', error);
                socket.emit('message_error', 'Не удалось отправить сообщение');
            }
        });

        socket.on('disconnect', () => {
            if (socket.userId) {
                userSocketMap.delete(socket.userId);
            }
            console.log('Пользователь отключился от WebSocket');
        });
    });
}
