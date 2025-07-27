import React from "react";
import './cssMessages/userList.css';
import { useAuth } from "../../context/AuthContext";

// Описываем типы для данных, которые компонент получает
interface User {
  id: string;
  username: string;
}

interface UserListProps {
  users: User[];
  selectedUserId: string | null;
  onSelectUser: (id: string) => void;
}

const UserList: React.FC<UserListProps> = ({ users, selectedUserId, onSelectUser }) => {
  const { keycloakInstance } = useAuth();
  // Получаем идентификатор текущего пользователя
  const myUserId = keycloakInstance?.tokenParsed?.sub;
 if (!myUserId) return <div> Загурзка пользователей....</div>
  return (
    <ul className="user-list">
      {users.map((user) => {
        const isMe = String(user.id) === myUserId;
        return (
          <li
            key={user.id}
            className={
              // 
              user.id === selectedUserId
                ? isMe
                  ? 'user-list-item selected my-user'
                  : 'user-list-item selected'
                : isMe
                  ? 'user-list-item my-user'
                  : 'user-list-item'
            }
            onClick={() => onSelectUser(user.id)}
          >
            {user.username} {isMe && <span className="my-user-label">(я)</span>}
          </li>
        );
      })}
    </ul>
  );
};

export default UserList;
