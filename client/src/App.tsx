import React from 'react';
import { AuthGate } from './components/auth/AuthGate';
import './App.css';

function App() {
  return (
    <AuthGate>
      {(user) => (
        <div className="App">
          <h1>Привет, {user}!</h1>
        </div>
      )}
    </AuthGate>
  );
}

export default App;