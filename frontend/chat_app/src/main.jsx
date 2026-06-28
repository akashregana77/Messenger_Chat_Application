import { StrictMode } from 'react'
import {BrowerRouter} from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <BrowerRouter>
    <StrictMode>
      <App />
    </StrictMode>
  </BrowerRouter>
)
