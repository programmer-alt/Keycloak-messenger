import React, { useEffect, useState, useRef } from "react";
import MessagesInput from "./MessagesInput";
import MessageList from "./MessageList";
import io, { Socket } from "socket.io-client";
import { useAuth } from "../../context/AuthContext";
import "./cssMessages/messagesContainer.css";
import UserList from "./UserList";

export interface User {
  id: string;
  username: string;
}
// Интерфейс для сообщения на стороне клиента
export interface Message {
  id: string;
  sender: string;
  content: string;
  receiver_id: string;
  created_at: string;
}

// Выносим URL в константу для удобства
const SOCKET_URL = "http://localhost:3000";

const MessagesContainer: React.FC = () => {
  const { authenticated, keycloakInstance } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [clearingMessages, setClearingMessages] = useState(false);
  const [typingUserId, setTypingUserId] = useState<string | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  //  Используем useRef для хранения экземпляра сокета
  const socketRef = useRef<Socket | null>(null);

  const normalizeMessage = (rawMessage: any): Message => {
    const senderId = rawMessage.sender_id || rawMessage.sender;
    const senderUser = users.find((user) => user.id === senderId);
    return {
      id: rawMessage.id,
      sender: senderUser?.username || senderId,
      content: rawMessage.message || rawMessage.content,
      receiver_id: rawMessage.receiver_id,
      created_at: rawMessage.created_at || rawMessage.timestamp,
    };
  };

  // Загружаем список пользователей при монтировании
  useEffect(() => {
    if (authenticated && keycloakInstance?.token) {
      fetch(`${SOCKET_URL}/api/users`, {
        headers: {
          Authorization: `Bearer ${keycloakInstance.token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setUsers(data);
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
    if (users.length === 0) {
      setLoading(true);
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
  }, [authenticated, keycloakInstance, users]);

  // Управление WebSocket соединением
  useEffect(() => {
    if (!authenticated || !keycloakInstance?.token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setMessages([]);
      return;
    }

    if (!socketRef.current) {
      const newSocket = io(SOCKET_URL, {
        auth: {
          token: keycloakInstance.token,
        },
      });

      socketRef.current = newSocket;

      newSocket.on("newMessage", (message: any) => {
        console.log("Получено новое сообщение:", message);
        const normalized = normalizeMessage(message);
        setMessages((prevMessages) => [...prevMessages, normalized]);
      });

      // Обработчик успешной очистки сообщений
      newSocket.on("messagesCleared", (response) => {
        console.log("Сообщения успешно очищены:", response);
        if (response.success) {
          setMessages([]);
          setClearingMessages(false);
        }
      });

      // Обработчик ошибки очистки
      newSocket.on("clearMessages_error", (error) => {
        console.error("Ошибка очистки сообщений:", error);
        setClearingMessages(false);
      });
      // Обработчик печатает (typing)
      newSocket.on("typing", ({ senderId }) => {
        setTypingUserId(senderId);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
          setTypingUserId(null);
        }, 3000); //  3 секунды
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [authenticated, keycloakInstance?.token, users]);

  //   функция отправки
  const handleSendMessage = (content: string) => {
    if (!content.trim() || !socketRef.current || !selectedUserId) return;

    const messagePayload = {
      recipientId: selectedUserId,
      content: content,
    };
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
  };
  const getFilteredMessages = () => {
    if (!selectedUserId || !keycloakInstance?.tokenParsed?.sub) return [];
    const myUserId = keycloakInstance.tokenParsed.sub;
    if (selectedUserId === myUserId) {
      // Если выбран сам себя — показываем все сообщения, где я получатель
      return messages.filter((msg) => msg.receiver_id === myUserId);
    }
    // Обычная логика для чата между двумя пользователями
    return messages.filter(
      (msg) =>
        (msg.sender === users.find((u) => u.id === selectedUserId)?.username &&
          msg.receiver_id === myUserId) ||
        (msg.sender === users.find((u) => u.id === myUserId)?.username &&
          msg.receiver_id === selectedUserId)
    );
  };
  // функция отправки  события typing(печатает)
  const handleTyping = () => {
    if (
      socketRef.current &&
      selectedUserId &&
      keycloakInstance?.tokenParsed?.sub !== selectedUserId
    ) {
      socketRef.current.emit("typing", { recipientId: selectedUserId });
    }
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
    <div className="app-container">
      {" "}
      {/* Общий контейнер */}
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
              <h3>
                Чат с {users.find((u) => u.id === selectedUserId)?.username}
              </h3>
              <button
                className="clear-messages-btn"
                onClick={handleClearMessages}
                disabled={clearingMessages}
              >
                {clearingMessages ? "Очистка..." : "Очистить сообщения"}
              </button>
            </header>
            {/* Здесь нужно будет фильтровать сообщения для selectedUserId */}
            <MessageList 
              messages={getFilteredMessages()} 
              users={users} 
              typingUserId={typingUserId}
              selectedUserId={selectedUserId}
            />
            <MessagesInput onSend={handleSendMessage} onTyping={handleTyping} />
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
