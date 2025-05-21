import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css' // This should be your only CSS import
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)