import React from 'react';
import { AuthGate } from './components/auth/AuthGate';
import MessagesContainer from './components/messages/MessagesContainer';
import './App.css';

function App() {
  return (
    <AuthGate>
      {(user) => (
        <div className="App">
          <h1>Привет, {user}!</h1>
          <MessagesContainer />
        </div>
      )}
    </AuthGate>
  );
}

export default App;
