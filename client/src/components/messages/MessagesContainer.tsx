import React, { useEffect, useState, useRef } from "react";
import MessagesInput from "./MessagesInput";
import MessageList from "./MessageList";
import io, { Socket } from "socket.io-client";
import { useAuth } from "../../context/AuthContext";
import './cssMessages/messagesContainer.css';
import  UserList from "./UserList";

export interface User {
  id: string;
  username: string
}
// Интерфейс для сообщения на стороне клиента
export interface Message {
 id: string;
 sender: string;
 content: string;
 created_at: string;
}

// Выносим URL в константу для удобства
const SOCKET_URL = "http://localhost:3000";

// Вспомогательная функция для приведения сообщений к единому формату
// Принимает сообщение от REST API или от WebSocket
const normalizeMessage = (rawMessage: any): Message => {
 return {
 id: rawMessage.id,
 sender: rawMessage.sender_id || rawMessage.sender, // Поддержка обоих форматов
 content: rawMessage.message || rawMessage.content, // 'message' от REST, 'content' от WebSocket
 created_at: rawMessage.created_at || rawMessage.timestamp, // 'created_at' от REST, 'timestamp' от WebSocket
 };
};

const MessagesContainer: React.FC = () => {
 const { authenticated, keycloakInstance } = useAuth();
 const [messages, setMessages] = useState<Message[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [clearingMessages, setClearingMessages] = useState(false);
 //  Используем useRef для хранения экземпляра сокета
 const socketRef = useRef<Socket | null>(null);

 // Загружаем список пользователей при монтировании
useEffect(() => {
    if (authenticated && keycloakInstance?.token) {
      fetch(`${SOCKET_URL}/api/users`, { // Наш новый эндпоинт
        headers: {
          'Authorization': `Bearer ${keycloakInstance.token}`,
        },
      })
      .then(res => res.json())
      .then(data => {
        // Фильтруем самого себя из списка, чтобы не писать самому себе
        const otherUsers = data.filter((u: User) => u.id !== keycloakInstance?.subject);
        setUsers(otherUsers);
      })
      .catch(console.error);
    }
  }, [authenticated, keycloakInstance]); 
 // Загрузка истории сообщений
 useEffect(() => {
 if (!authenticated || !keycloakInstance?.token) {
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
 if (!res.ok) {
 throw new Error(`Ошибка загрузки: ${res.status} ${res.statusText}`);
 }
 return res.json();
 })
 .then((data: any[]) => {
 // ШАГ 3: Используем единую функцию для нормализации
 const normalizedMessages = data.map(normalizeMessage);
 setMessages(normalizedMessages);
 })
 .catch((error) => {
 console.error("Ошибка загрузки сообщений:", error);
 setError(error.message || "Не удалось загрузить сообщения");
 })
 .finally(() => {
 setLoading(false);
 });
 
 }, [authenticated, keycloakInstance]);

 // Управление WebSocket соединением
 useEffect(() => {
 if (!authenticated || !keycloakInstance?.token) {
 // Если пользователь разлогинился, отключаем сокет
 if (socketRef.current) {
 socketRef.current.disconnect();
 socketRef.current = null;
 }
-    setMessages([]);
 return;
 }

 // Подключаемся только если еще не подключены
 if (!socketRef.current) {
 const newSocket = io(SOCKET_URL, {
 auth: {
 token: keycloakInstance.token,
 },
 });
 
 socketRef.current = newSocket;

 newSocket.on("newMessage", (message: any) => {
 console.log('Получено новое сообщение:', message);
 // ШАГ 3: Используем единую функцию для нормализации
 const normalized = normalizeMessage(message);
 setMessages((prevMessages) => [...prevMessages, normalized]);
 });
 }

 // Функция для очистки при размонтировании компонента
 return () => {
 if (socketRef.current) {
 socketRef.current.disconnect();
 socketRef.current = null;
 }
 };
 }, [authenticated, keycloakInstance?.token]); // Зависимость от токена для переподключения при его обновлении

//   функция отправки
 const handleSendMessage = (content: string) => {
 if (!content.trim() || !socketRef.current || !selectedUserId) return;

 const messagePayload = {
  recipientId: selectedUserId,
   content: content,
 }
 // Отправляем на сервер только текст сообщения
 // Сервер сам определит отправителя по токену сокета
 socketRef.current.emit("sendMessage", messagePayload);
 };

 // функция очистки всех сообщений
 const handleClearMessages = () => {
   if (!socketRef.current) return;

   // Устанавливаем состояние загрузки
   setClearingMessages(true);

   // Отправляем запрос на очистку сообщений через WebSocket
   socketRef.current.emit("clearMessages");

   // Очищаем локальные сообщения
   setMessages([]);
   setClearingMessages(false);
 };

 if (!authenticated) {
 return <div>Пожалуйста, войдите, чтобы увидеть сообщения.</div>;
 }
 
 if (loading) {
 return <div>Загрузка сообщений...</div>;
 }
 
 // ШАГ 4: Отображение ошибки
 if (error) {
 return <div className="error-message">Ошибка: {error}</div>;
 }

return (
  <div className="app-container"> {/* Общий контейнер */}
    <div className="user-list-container">
      <h3>Пользователи</h3>
      <UserList 
        users={users} 
        selectedUserId={selectedUserId}
        onSelectUser={setSelectedUserId} 
      />
    </div>

    <div className="messages-container">
      {selectedUserId ? (
        <>
          <header className="chat-header">
            {/* Можно найти имя выбранного пользователя и показать его */}
            <h3>Чат с {users.find(u => u.id === selectedUserId)?.username}</h3>
            <button 
              className="clear-messages-btn" 
              onClick={handleClearMessages}
              disabled={clearingMessages}
            >
              {clearingMessages ? "Очистка..." : "Очистить сообщения"}
            </button>
          </header>
          {/* Здесь нужно будет фильтровать сообщения для selectedUserId */}
          <MessageList messages={messages} /> 
          <MessagesInput onSend={handleSendMessage} />
        </>
      ) : (
        <div className="no-chat-selected">
          Пожалуйста, выберите пользователя, чтобы начать чат.
        </div>
      )}
    </div>
  </div>
);
};
export default MessagesContainer;