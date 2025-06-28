import React, { useEffect, useState } from 'react';
import MessagesInput from './MessagesInput';
import MessageList from './MessageList';
import { useKeycloakAuth } from '../../hooks/useKeycloakAuth';
import io from 'socket.io-client';

/*

MessagesContainer — основной компонент чата.
Проверяет авторизацию пользователя через Keycloak.
При авторизации загружает историю сообщений с сервера и подписывается на новые сообщения через WebSocket (socket.io).
Все новые сообщения (от других пользователей или себя) добавляются в список сообщений в реальном времени.
Позволяет отправлять сообщения, которые сразу отправляются на сервер через сокет.
Если пользователь не авторизован — отображает просьбу войти.
Пока сообщения загружаются — показывает индикатор загрузки. 
*/
export interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
}

const socket = io('http://localhost:3001'); 

const MessagesContainer: React.FC = () => {
  const { user, authenticated, loading: authLoading } = useKeycloakAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authenticated) {
      return;
    }

    fetch('http://localhost:3001/api/messages')
      .then(res => res.json())
      .then((data: Message[]) => {
        setMessages(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching messages:', error);
        setLoading(false);
      });

    socket.on('newMessage', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      socket.off('newMessage');
    };
  }, [authenticated]);

  const handleSend = (content: string) => {
    if (!user || !content.trim()) {
      return;
    }

    const newMessage = {
      id: Date.now().toString(),
      sender: user,
      content,
      timestamp: new Date().toISOString(),
    };

    socket.emit('sendMessage', newMessage);
  };

  if (authLoading) {
    return null;
  }

  if (!authenticated) {
    return <div> Пожалуйста авторизуйтесь.</div>;
  }

  if (loading) {
    return <div>Загрузка сообщений...</div>;
  }

  return (
    <div className="messages-container">
      <MessageList messages={messages} />
      <MessagesInput onSend={handleSend} />
    </div>
  );
};

export default MessagesContainer;