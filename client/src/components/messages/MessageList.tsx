import React from 'react';
import { Message, User } from './MessagesContainer';
import './cssMessages/messageList.css';

import { format, parseISO } from 'date-fns';
/*
  Комопнент отвечающий за отображение списка сообщений.
*/
interface MessageListProps {
  messages: Message[];
  users: User[];
  typingUserId?: string | null;
  selectedUserId?: string | null;
}
const MessageList: React.FC<MessageListProps> = ({ messages, users, typingUserId, selectedUserId }) => {
  const formatTimestamp = (timestamp: string | undefined) => {
    console.log('Время:', timestamp);
    if (!timestamp) {
      return '';
    }
    try {
      const date = parseISO(timestamp);
      return format(date, 'HH:mm');
    } catch (error) {
      console.error(' Не удалось отформатировать дату-', timestamp, error);
      return '';
    }
  };

  console.log('Users in MessageList:', users ?? 'undefined');
  console.log('Messages in MessageList:', messages);

  // Выводим весь массив пользователей для анализа
  console.log('Full users array:', users);

  const getUserName = (senderId: string) => {
    console.log('Looking for user with id or username:', senderId);
    if (!users) {
      console.warn('Users array is undefined');
      return senderId;
    }
    // Сначала ищем по id строго
    let user = users.find(u => u.id === senderId);
    if (!user) {
      // Если не нашли, ищем по username
      user = users.find(u => u.username === senderId);
    }
    // Если user не найден, попробуем найти по id в нижнем регистре (на случай несоответствия регистра)
    if (!user) {
      user = users.find(u => u.id.toLowerCase() === senderId.toLowerCase());
    }
    console.log('Found user:', user);
    return user ? user.username : senderId;
  };

  return (
    <div className="message-list">
      {messages.map((message, index) => (
        <div key={message.id ?? index} className="message-item">
          <span className="message-sender">{getUserName(message.sender)}</span>
          <p className="message-content">{message.content}</p>
          <span className="message-timestamp">
            {formatTimestamp(message.created_at)}
          </span>
        </div>
      ))}
      {/* Индикатор "печатает..." */}
      {typingUserId && typingUserId === selectedUserId && (
        <div className="typing-indicator">
          <span className="typing-user">{getUserName(typingUserId)}</span>
          <span className="typing-text"> печатает...</span>
        </div>
      )}
    </div>
  );
};
export default MessageList;
