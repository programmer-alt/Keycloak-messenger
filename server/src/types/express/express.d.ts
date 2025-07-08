// server/src/types/express.d.ts

import { Grant } from 'keycloak-connect';

// Мы используем 'declare global', чтобы расширить существующий модуль 'express-serve-static-core',
// в котором определен Request, а не создавать новый.
declare global {
  namespace Express {
    // Расширяем стандартный интерфейс Request
    export interface Request {
      // Добавляем опциональное свойство kauth.
      // Оно опционально (?), потому что будет существовать только на защищенных маршрутах
      // и только после того, как middleware от Keycloak отработает.
      kauth?: {
        grant?: Grant;
      };
    }
  }
}