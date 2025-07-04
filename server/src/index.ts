import express from 'express';
import cors from 'cors';
import { initializeKeycloak } from './keycloak/initializeKeycloak'; 
import { keycloakConfig } from './keycloak/keycloakConfig';
import messagesRouter from './routes/messages';
import { Server as SocketIOServer} from 'socket.io';
import http from 'http';
import {socketAuthMiddleware} from './middleware/socketAuthMiddleware';
import { createServerMessage } from './utilsComponents/messageFactory';


const app = express();

// Добавляем CORS middleware для Express
app.use(cors({
    origin: 'http://localhost:3001',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
}));

// Создание HTTP-сервера
const server = http.createServer(app);
// Создание Socket.IO-сервера
const io = new SocketIOServer(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    }
});
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Инициализация Keycloak

const keycloak = initializeKeycloak(app);

app.use('api/messages', keycloak.protect() as any, messagesRouter);

app.get('/protected', keycloak.protect() as any, (req, res) => {
    res.json({
        message: 'Это защищенный маршрут',
        user: (req as any)?.kauth?.grant?.access_token?.content?.preferred_username
    });
});

app.get('/login', keycloak.protect() as any, (req, res) => {
    res.json({
        message: 'Вы успешно авторизованы!',
        user: (req as any)?.kauth?.grant?.access_token?.content?.preferred_username,
    });
});

// Middleware для аутентификации socket.io
io.use(socketAuthMiddleware(keycloak));

// 
io.on('connection', (socket) => {
    console.log(' Пользователь подключился к WebSocket');
    socket.on('sendMessage', (data) => {
        const message = createServerMessage(data.sender, data.content);
        io.emit('newMessage', data);
    });
    socket.on('disconnect', () => {
        console.log('Пользователь отключился от WebSocket');
    });
});
server.listen(PORT, () => {
    console.log(`Сервер работает на порту ${PORT}`);
    console.log(`Keycloak настроен на realm: ${keycloakConfig.realm}`);
});
