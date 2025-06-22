import React, { useEffect, useState } from 'react';
import MessagesInput from './MessagesInput';
import MessageList from './MessageList';
import { useKeycloakAuth } from '../../hooks/useKeycloakAuth';
import io from 'socket.io-client';

export interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
}

const socket = io('http://localhost:3001'); // 连接到WebSocket服务器

const MessagesContainer: React.FC = () => {
  const { user, authenticated } = useKeycloakAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authenticated) return;

    // 从服务器加载消息
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

    // 订阅新消息
    socket.on('newMessage', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    // 清理订阅
    return () => {
      socket.off('newMessage');
    };
  }, [authenticated]);

  const handleSend = (content: string) => {
    if (!user || !content.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      sender: user,
      content,
      timestamp: new Date().toISOString(),
    };

    // 通过WebSocket发送消息
    socket.emit('sendMessage', newMessage);
  };

  if (!authenticated) {
    return <div>Please login to view messages.</div>;
  }

  if (loading) {
    return <div>Loading messages...</div>;
  }

  return (
    <div className="messages-container">
      <MessageList messages={messages} />
      <MessagesInput onSend={handleSend} />
    </div>
  );
};

export default MessagesContainer;