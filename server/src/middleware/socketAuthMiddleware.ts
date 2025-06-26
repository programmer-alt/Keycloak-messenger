import {  Socket } from 'socket.io';
import { NextFunction } from 'express';
import Keycloak from 'keycloak-connect';

/*
    Middleware для проверки токена при подключении к сокету
*/
export const socketAuthMiddleware = (keycloak: Keycloak.Keycloak) => async (socket: Socket, next: (err?: Error) => void) => {
    // получаем токен из авторизации
    const { token } = socket.handshake.auth;
    if (!token) {
        return next(new Error('Ошибка авторизации'));
    }
    try {
        // получаем GrantManager из keycloak
        const {grantManager} = keycloak;
        // Валидация токена
        const userInfo = await grantManager.userInfo(token);
        if (!userInfo) {
            return next(new Error('Ошибка авторизации'));
        }
        next();
    } catch (err) {
        next(new Error('Ошибка авторизации'));
    }
};