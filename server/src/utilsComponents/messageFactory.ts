import { v4 as uuidv4 } from 'uuid';

/**
 * createServerMessage - Функция для создания сообщения на стороне сервера
 *  @param sender - Отправитель сообщения 
 *  @param content - Текст сообщения 
 *  @returns Созданное сообщение
 */
export interface ServerMessage {
    id: string;
    sender: string;
    content: string;
    timestamp: string;
}

export function createServerMessage(sender: string, content: string): ServerMessage {
    return {
        id: uuidv4(),
        sender,
        content,
        timestamp: new Date().toISOString(),
    }
}