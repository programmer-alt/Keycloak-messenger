import React from 'react';
import { Message } from './MessagesContainer';
import './cssMessages/messageList.css';
import { format, parseISO } from 'date-fns';
/*
  Комопнент отвечающий за отображение списка сообщений.
*/
interface MessageListProps {
  messages: Message[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const formatTimestamp =(timestamp: string | undefined) =>{
    console.log('Timestamp for formatting:', timestamp);
    if (!timestamp) {
      return '';
    }
    try {
      const date = parseISO(timestamp);
      return format(date, 'HH:mm');
    } catch (error){
      console.error(' Не удалось отформатировать дату-', timestamp, error);
   return '';
    }
  };
  return (
    <div className="message-list">
      {messages.map((message, index) => (
        <div key={message.id ?? index} className="message-item">
          <span className="message-sender">{message.sender}</span>
          <p className="message-content">{message.content}</p>
          <span className="message-timestamp">
            {formatTimestamp(message.created_at)}
          </span>
        </div>
      ))}
    </div>
  );
};

export default MessageList;
