import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles/tokens.css';
import './styles/app.css';
import './styles/landing.css';
import './styles/connect.css';
import './styles/client.css';
import './styles/lab.css';
import './styles/eval.css';
import './styles/theme-dark.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
