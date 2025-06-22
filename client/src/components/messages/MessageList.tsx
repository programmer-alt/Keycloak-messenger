import React from 'react';
import { Message } from './MessagesContainer';
import './cssMessages/MessageList.css';

interface MessageListProps {
  messages: Message[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  return (
    <div className="message-list">
      {messages.map((message) => (
        <div key={message.id} className="message-item">
          <span className="message-sender">{message.sender}</span>
          <p className="message-content">{message.content}</p>
          <span className="message-timestamp">
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
        </div>
      ))}
    </div>
  );
};

export default MessageList;
