
import { NextFunction, Request, Response } from "express";
import  Keycloak, {Grant}  from "keycloak-connect";

// 1. Определяем интерфейс, который расширяет стандартный Request
interface RequestWithKauth extends Request {
  kauth?: {
    grant?: Grant;
  };
}
/**
 * protectApi — это функция для REST API запросов, которая создаёт middleware для Express.
Этот middleware:
Проверяет, авторизован ли пользователь через Keycloak.
Если не авторизован — возвращает ошибку 401.
Если авторизован — даёт доступ к API.
 */
export const protectApi = (keycloack: Keycloak.Keycloak ) => {
    const protector = keycloack.protect();
    return (req: Request, res: Response, next: NextFunction) => {
        protector (req, res, (err)=> {
            const reqWithKauth = req as RequestWithKauth;
            if ('kauth' in reqWithKauth){

                const {kauth} = reqWithKauth;
                console.log('kauth:', kauth);
            }
            if (err || !reqWithKauth.kauth?.grant){
                return res.status(401).json({error: ' Не авторизовано', message:' Необходима аутентификация для доступа к этому ресурсу'});

            }
            return next()
  ;      });
    };
}