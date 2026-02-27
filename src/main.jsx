import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import CloudSyncProvider from './components/CloudSyncProvider.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CloudSyncProvider>
      <App />
    </CloudSyncProvider>
  </React.StrictMode>,
)
