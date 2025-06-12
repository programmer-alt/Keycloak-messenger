import { Request, Response, Router } from 'express';
import pool from '../db';

const router = Router();

// Отправка сообщения
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const senderId: string = (req as any).kauth.grant.access_token.content.preferred_username;
    const { receiver_id, message } = req.body;

    if (!receiver_id || !message) {
      res.status(400).json({ error: 'receiver_id и message обязательны' });
      return;
    }

    const query = `
      INSERT INTO messages (sender_id, receiver_id, message, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING *;
    `;

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
    const userId: string = (req as any).kauth.grant.access_token.content.preferred_username;

    const query = `
      SELECT * FROM messages
      WHERE sender_id = $1 OR receiver_id = $1
      ORDER BY created_at DESC;
    `;

    const result = await pool.query(query, [userId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка при получении сообщений:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
