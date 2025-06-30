import React, { useEffect, useState } from 'react';
import MessagesInput from './MessagesInput';
import MessageList from './MessageList';
import { useKeycloakAuth } from '../../hooks/useKeycloakAuth';
import io, { Socket } from 'socket.io-client';

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

const SOCKET_URL = 'http://localhost:3001'; 

const MessagesContainer: React.FC = () => {
  const { user, authenticated, loading: authLoading } = useKeycloakAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка истории сообщен��й
  useEffect(() => {
    if (!authenticated) return;

    setLoading(true);
    setError(null);
    fetch(`${SOCKET_URL}/api/messages`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`Ошибка загрузки: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then((data: Message[]) => {
        setMessages(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(' Ошибка загрузки сообщений:', error);
        setError(error.message || 'Ошибка загрузки сообщений');
        setLoading(false);
      });
  }, [authenticated]);

  // Работа с сокетом
  useEffect(() => {
    if (!authenticated) return;

    const socket: Socket = io(SOCKET_URL);

    socket.on('newMessage', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      socket.disconnect();
    };
  }, [authenticated]);

  const handleSend = (content: string) => {
    if (!user || !content.trim()) return;

    // Отправляем только user и content
    const messageData = { sender: user, content };
    const socket: Socket = io(SOCKET_URL);
    socket.emit('sendMessage', messageData);
    socket.disconnect();
  };

  if (authLoading) {
    return null;
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