import React, { useState } from 'react';
import './cssMessages/MessageInput.css';

interface MessagesInputProps {
  onSend: (content: string) => void;
}

const MessagesInput: React.FC<MessagesInputProps> = ({ onSend }) => {
  const [inputMessage, setInputMessage] = useState('');

  const handleSend = () => {
    if (inputMessage.trim() === '') {
      return;
    }
    onSend(inputMessage);
    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="message-input">
      <input
        type="text"
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        onKeyUp={handleKeyPress}
        placeholder="Введите сообщение..."
      />
      <button onClick={handleSend}>Отправить</button>
    </div>
  );
};

export default MessagesInput;