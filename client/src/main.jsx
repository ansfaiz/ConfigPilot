import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3200,
        style: {
          background: 'rgba(10, 15, 29, 0.92)',
          color: 'var(--color-text)',
          border: '1px solid rgba(148, 163, 184, 0.18)',
          backdropFilter: 'blur(10px)',
        },
      }}
    />
  </StrictMode>,
)
