import React from 'react';
import { AuthGate } from './components/auth/AuthGate';
import MessagesContainer from './components/messages/MessagesContainer';
import './App.css';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
    <AuthGate>
  <MessagesContainer />
</AuthGate>
    </AuthProvider>
  );
}

export default App;
