import { StrictMode } from 'react'
import {BrowserRouter} from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {ClerkProvider} from "@clerk/react"

createRoot(document.getElementById('root')).render(
  
    <StrictMode>
      <ClerkProvider>
        <App />
      </ClerkProvider>
    </StrictMode>,
)
