import React from "react";
import './cssMessages/userList.css';

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
  return (
    <ul className="user-list">
      {users.map((user) => (
        <li
          key={user.id}
          // Если ID пользователя совпадает с выбранным, добавляем класс 'selected' для подсветки
          className={user.id === selectedUserId ? 'user-list-item selected' : 'user-list-item'}
          // При клике вызываем функцию onSelectUser и передаем ей ID выбранного пользователя
          onClick={() => onSelectUser(user.id)}
        >
          {user.username}
        </li>
      ))}
    </ul>
  );
};

export default UserList;
