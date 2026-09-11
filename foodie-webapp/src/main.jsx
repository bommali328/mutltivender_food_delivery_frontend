import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import CustomerWeb from './CustomerWeb.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CustomerWeb />
  </StrictMode>,
)