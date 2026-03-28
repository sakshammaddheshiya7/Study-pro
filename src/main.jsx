import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { DatabaseProvider } from './contexts/DatabaseContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <DatabaseProvider>
          <App />
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1E293B',
                color: '#fff',
                borderRadius: '12px',
                padding: '12px 20px',
                fontSize: '14px',
                fontWeight: '500'
              },
              success: {
                iconTheme: { primary: '#10B981', secondary: '#fff' }
              },
              error: {
                iconTheme: { primary: '#EF4444', secondary: '#fff' }
              }
            }}
          />
        </DatabaseProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
