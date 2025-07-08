import React, { useEffect, useState } from "react";
import MessagesInput from "./MessagesInput";
import MessageList from "./MessageList";
import io, { Socket } from "socket.io-client";
import { useAuth } from "../../context/AuthContext";

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
  created_at: string;
  timestamp?: string;
}

const SOCKET_URL = "http://localhost:3000";

const MessagesContainer: React.FC = () => {
  const { user, authenticated, keycloakInstance } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Загрузка истории сообщений
  useEffect(() => {
    if (!authenticated || !keycloakInstance?.token) {
      console.log(
        "Пользователь не аутентифицирован, загрузка сообщений отменена."
      );
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    fetch(`${SOCKET_URL}/api/messages`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${keycloakInstance.token}`,
      },
      cache: "no-store",
    })
      .then((res) => {
        if (res.status === 304) {
          return [];
        }
        if (!res.ok) {
          throw new Error(`Ошибка загрузки: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then((data: any[]) => {
        // Преобразуем поле message из API в content для клиента
        const normalizedMessages = data.map(item => ({
          id: item.id,
          sender: item.sender_id,
          content: item.message,
          created_at: item.created_at,
        }));
        setMessages(normalizedMessages);
        setLoading(false);
      })
      .catch((error) => {
        console.error(" Ошибка загрузки сообщения:", error);
        setError(error.message || "Ошибка загрузки сообщений");
        setLoading(false);
      });
  }, [authenticated, keycloakInstance]);

  // Работа с сокетом
  useEffect(() => {
    if (!authenticated || !keycloakInstance?.token) return;

    const localSocket: Socket = io(SOCKET_URL, {
      auth: {
        token: keycloakInstance.token,
      },
    });
    setSocket(localSocket);
    localSocket.on("newMessage", (message: Message) => {
      console.log('New message received via socket:', message);
      // Преобразуем поле timestamp в created_at для унификации
      const normalizedMessage = {
        ...message,
        created_at: message.timestamp ?? '',
      };
      setMessages((prev) => [...prev, normalizedMessage]);
    });

    return () => {
      localSocket.disconnect();
    };
  }, [authenticated, keycloakInstance?.token]);

const handleSendMessage = async (content: string) => {
    if (!user || !keycloakInstance?.token) return;
    
    try {
        // Используем существующий REST API endpoint
        const response = await fetch('http://localhost:3000/api/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${keycloakInstance.token}` // Keycloak токен
            },
            body: JSON.stringify({
                receiver_id: 'some_user', // Указываем получателя
                message: content         
            })
        });
        
        if (response.ok) {
            const savedMessage = await response.json();
            
            // Обновляем локальное состояние
            setMessages(prev => [savedMessage, ...prev]);
            
            // Опционально: уведомляем через WebSocket
            socket?.emit('messageNotification', savedMessage);
        }
    } catch (error) {
        console.error('Ошибка отправки:', error);
        setError('Не удалось отправить сообщение');
    }
};
  const handleSend = async (content: string) => {
    if (!user || !content.trim() || !socket) return;

    // Отправляем только user и content
    const messageData = { sender: user, content };

    socket.emit("sendMessage", messageData);
  };

  if (loading) {
    return <div>Загрузка сообщений...</div>;
  }

  return (
    <div className="messages-container">
      <header
        className="chat-header"
        style={{
          padding: "10px",
          borderBottom: "1px solid #ccc",
          textAlign: "center",
        }}
      >
        {user && (
          <h3> {user}! Добро пожаловать в чат, который создал Вадим!</h3>
        )}
      </header>
      <MessageList messages={messages} />
      <MessagesInput onSend={handleSend} />
    </div>
  );
};

export default MessagesContainer;
