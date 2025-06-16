import { Request, Response, Router } from 'express';
import pool from '../db';
import { body, validationResult } from 'express-validator';

const router = Router();

// Отправка сообщения
router.post('/', 
  [
    body('receiver_id').isString().notEmpty().withMessage(('receiver_id обязательно')),
    body('message').isString().notEmpty().withMessage(('message обязательно'))
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    
  try {
    // получаем id пользователя из токена
    const senderId: string = (req as any).kauth.grant.access_token.content.preferred_username;
    // получаем id получателя и текст сообщения
    const { receiver_id, message } = req.body;

    if (!receiver_id || !message) {
      res.status(400).json({ error: 'receiver_id и message обязательны' });
      return;
    }
    // добавляем сообщение в базу
    const query = `
      INSERT INTO messages (sender_id, receiver_id, message, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING *;
    `;
    // выполняем запрос в базе данных и возвращаем результат
    const result = await pool.query(query, [senderId, receiver_id, message]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Ошибка при отправке сообщения:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получение сообщений пользователя
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    // получаем id пользователя из токена
    const userId: string = (req as any).kauth.grant.access_token.content.preferred_username;
    // получаем все сообщения пользователя из базы данных
    const query = `
      SELECT * FROM messages
      WHERE sender_id = $1 OR receiver_id = $1
      ORDER BY created_at DESC;
    `;
    // выполняем запрос в базе данных и возвращаем результат
    const result = await pool.query(query, [userId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка при получении сообщений:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
