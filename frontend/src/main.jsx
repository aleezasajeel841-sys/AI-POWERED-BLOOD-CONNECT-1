import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/theme.css'
import App from './App.jsx'
import { AuthContextProvider } from './contexts/AuthContext.jsx'
import { SecondAuthProvider } from './contexts/SecondAuthContext.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com"}>
      <AuthContextProvider>
        <SecondAuthProvider>
          <App />
        </SecondAuthProvider>
      </AuthContextProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
