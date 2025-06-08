import express from 'express';
import { initializeKeycloak , keycloakConfig} from './keycloakConfig'; 

const app = express();
const PORT = process.env.PORT || 3000;

// Инициализация Keycloak
const keycloak = initializeKeycloak();

app.use(express.json());

app.get('/protected', keycloak.protect(), (req, res) => {
    res.json({
        message: 'Это защищенный маршрут',
        user: (req as any).kauth.grant.access_token.content.preferred_username,
    });
});

app.get('/login', keycloak.protect(), (req, res) => {
    res.json({
        message: 'Вы успешно авторизованы!',
        user: (req as any).kauth.grant.access_token.content.preferred_username,
    });
});

app.listen(PORT, () => {
    console.log(`Сервер работает на порту ${PORT}`);
    console.log(`Keycloak настроен на realm: ${keycloakConfig.realm}`);
});