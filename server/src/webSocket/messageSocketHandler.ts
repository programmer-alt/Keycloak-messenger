import { Server as SocketIOServer, Socket } from "socket.io";
import { saveMessage } from "../utilsComponents/messageService";

export function registerMessageSocketHandler(io: SocketIOServer) {
    io.on('connection', (socket: Socket) => {
        console.log('Пользователь подключился к WebSocket');
        socket.on('sendMessage', async (data) => {
            try {
                // Здесь предполагается, что data содержит sender, receiver_id и content
                const senderId = data.sender;
                const receiverId = data.receiver_id || 'some_user'; // если receiver_id не передан, можно задать дефолт
                const messageContent = data.content;

                const savedMessage = await saveMessage(senderId, receiverId, messageContent);

                // Отправляем всем клиентам новое сообщение
                io.emit('newMessage', savedMessage);
            } catch (error) {
                console.error('Ошибка при сохранении сообщения через WebSocket:', error);
            }
        });
        socket.on('disconnect', () => {
            console.log('Пользователь отключился от WebSocket');
        });
    });
}
