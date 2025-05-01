import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css' // This should be your only CSS import
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)