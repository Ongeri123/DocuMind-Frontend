import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './Pages/Homepage'
import ChatPage from './Pages/Chatpage'
import ResetPasswordPage from './Pages/ResetPasswordPage'
import AuthPage from './Pages/AuthPage'
import AuthGuard from './components/AuthGuard'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/" element={
          <AuthGuard>
            <HomePage />
          </AuthGuard>
        } />
        <Route path="/chat" element={
          <AuthGuard>
            <ChatPage />
          </AuthGuard>
        } />
        <Route path="/reset-password" element={<ResetPasswordPage />} />  
      </Routes>
    </BrowserRouter>
  )
}
