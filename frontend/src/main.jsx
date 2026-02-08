
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import './i18n';

// Force unregister valid service workers to fix "refresh twice" issues
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    for (let registration of registrations) {
      registration.unregister();
    }
  });
}

createRoot(document.getElementById('root')).render(
  <App />
)
