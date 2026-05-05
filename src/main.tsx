import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/context/AuthContext'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <AuthProvider>
        <App />
        <Toaster 
          position="bottom-right"
          toastOptions={{
            style: {
              borderRadius: '8px',
              fontSize: '14px',
            }
          }}
        />
      </AuthProvider>
    </HashRouter>
  </StrictMode>
)
