import express from 'express';
import { initializeKeycloak } from './keycloak/initializeKeycloak'; 
import { keycloakConfig } from './keycloak/keycloakConfig';
import messagesRouter from './routes/messages';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Инициализация Keycloak
const keycloak = initializeKeycloak(app);

app.use('/messages', keycloak.protect() as any, messagesRouter);

app.get('/protected', keycloak.protect() as any, (req, res) => {
    res.json({
        message: 'Это защищенный маршрут',
        user: (req as any).kauth.grant.access_token.content.preferred_username,
    });
});

app.get('/login', keycloak.protect() as any, (req, res) => {
    res.json({
        message: 'Вы успешно авторизованы!',
        user: (req as any).kauth.grant.access_token.content.preferred_username,
    });
});

app.listen(PORT, () => {
    console.log(`Сервер работает на порту ${PORT}`);
    console.log(`Keycloak настроен на realm: ${keycloakConfig.realm}`);
});
