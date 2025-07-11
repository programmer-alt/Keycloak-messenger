import pool from '../db';

export interface SavedMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
}

/**
 * Сохраняет сообщение в базу данных.
 * @param senderId - ID отправителя
 * @param receiverId - ID получателя
 * @param messageContent - Текст сообщения
 * @returns сохранённое сообщение
 */
export async function saveMessage(senderId: string, receiverId: string, messageContent: string): Promise<SavedMessage> {
  const query = `
    INSERT INTO messages (sender_id, receiver_id, message, created_at)
    VALUES ($1, $2, $3, NOW())
    RETURNING *;
  `;
  const result = await pool.query(query, [senderId, receiverId, messageContent]);
  return result.rows[0];
}

/**
 * Очищает все сообщения пользователя.
 * @param userId - ID пользователя, чьи сообщения нужно удалить
 * @returns количество удаленных сообщений
 */
export async function clearUserMessages(userId: string): Promise<number> {
  const query = `
    DELETE FROM messages
    WHERE sender_id = $1 OR receiver_id = $1
    RETURNING *;
  `;
  const result = await pool.query(query, [userId]);
  return result.rowCount || 0; // Возвращаем 0, если result.rowCount равен null
}
