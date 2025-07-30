import React, { useState, useRef } from "react";
import "./cssMessages/messageInput.css";

interface MessagesInputProps {
  onSend: (content: string) => void;
  onTyping: () => void;
}

const MessagesInput: React.FC<MessagesInputProps> = ({ onSend, onTyping }) => {
  const [inputMessage, setInputMessage] = useState("");
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  const handleSend = () => {
    if (inputMessage.trim() === "") {
      return;
    }
    onSend(inputMessage);
    setInputMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="message-input">
      <input
        type="text"
        value={inputMessage}
        onChange={(e) => {
          setInputMessage(e.target.value);
          
          // Отправляем typing только раз в начале печатания
          if (onTyping && !isTypingRef.current && e.target.value.trim()) {
            onTyping();
            isTypingRef.current = true;
          }
          
          // Сбрасываем флаг через 2 секунды
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }
          typingTimeoutRef.current = setTimeout(() => {
            isTypingRef.current = false;
          }, 2000);
        }}
        onKeyUp={handleKeyPress}
        placeholder="Введите сообщение..."
      />
      <button onClick={handleSend}>Отправить</button>
    </div>
  );
};

export default MessagesInput;
