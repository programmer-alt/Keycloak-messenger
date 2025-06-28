import Keycloak from 'keycloak-connect';
import session from 'express-session';
import express from 'express';
import { keycloakConfig } from './keycloakConfig';
import dotenv from 'dotenv';
/**
 * Модуль инициализации Keycloak для интеграции с Express-приложением.
 *
 *  Функция initializeKeycloak:
 *    - Создаёт in-memory хранилище сессий (MemoryStore), чтобы Express и Keycloak могли совместно хранить информацию о сессиях пользователей.
 *    - Создаёт экземпляр приложения Express (app).
 *    - Подключает middleware express-session к приложению, чтобы все запросы могли использовать сессии.
 *    - Инициализирует экземпляр Keycloak, передавая ему хранилище сессий и объект конфигурации.
 *    - Подключает middleware Keycloak к приложению Express, чтобы все маршруты могли быть защищены через Keycloak ( /logout и /admin).
 *    - Возвращает экземпляр Keycloak, чтобы его можно было использовать для защиты маршрутов в других частях приложения.
 */

export function initializeKeycloak(app: express.Application) {
    dotenv.config({ path: '../.envServer' });
    const memoryStore = new session.MemoryStore();
   

    const sessionSecret = process.env.SESSION_SECRET;
    if (!sessionSecret) {
        throw new Error('SESSION_SECRET не задан в переменных окружения ');
    }

    app.use(session({
        secret: sessionSecret,
        resave: false,
        saveUninitialized: true,
        store: memoryStore,
    }));
   

    const keycloak = new Keycloak({ store: memoryStore }, keycloakConfig);

    app.use(...keycloak.middleware({
        logout: '/logout',
        admin: '/admin',
    }));

    return keycloak;
}