import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import vkBridge from '@vkontakte/vk-bridge'

// Инициализируем VK Bridge для работы внутри ВКонтакте
vkBridge.send('VKWebAppInit')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
