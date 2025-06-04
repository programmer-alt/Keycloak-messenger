import express from 'express';
import Keycloak from 'keycloak-connect';
import session from 'express-session';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
// настройка сессий
const memoryStore = new session.MemoryStore();

app.use(session({
    secret: 'some secret',
    resave: false,
    saveUnitilized: true,
    store: memoryStore,
}),
);
// инициализация Keycloak
const keycloak = new Keycloak({
  store: memoryStore(),
});
app.use(keycloak.middleware());
app.listen(PORT, ()=> {
    console.log(` Сервер работает на порту ${PORT}`);
});