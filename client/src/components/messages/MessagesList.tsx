import React, {useState} from 'react';
import './cssMessages/MessageList.css';


/*
компонент для отображения списка сообщений
*/
interface MessageInputProps {
    onSend: (message: string) => void
}

const MessageInput: React.FC<MessageInputProps> = ({onSend}) => {
    const [message, setMessage] = useState('');

    const handleSend = () => {
        if (message.trim() === '') {
          return;
       }
        onSend(message); // отправка сообщения
        setMessage(''); // очистка поля ввода после отправки
    }

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSend();
        }
        }
        return (
            <div className="message-input"> 
            <input
            type='text'
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyUp={handleKeyPress}
            placeholder='введите сообщение'
            />
            <button onClick={handleSend}>отправить</button>
            </div>
        )
}

export default MessageInput;