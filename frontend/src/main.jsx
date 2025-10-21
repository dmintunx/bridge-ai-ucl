// frontend/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './AuthContext'; // AuthProvider ကို import လုပ်ပါ

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider> {/* App Component ကို AuthProvider နဲ့ ထုပ်ပိုးပါ */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);