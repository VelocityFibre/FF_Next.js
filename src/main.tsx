import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/fallback.css'
import './styles/index-integrated.css'
// Performance optimization imports temporarily disabled due to TypeScript errors
// import './utils/performance/cssPerformanceMonitor'
// import './utils/performance/assetOptimizer'
// import './utils/performance/hotReloadOptimizer'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)