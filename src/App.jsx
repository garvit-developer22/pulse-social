import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './hooks/useToast'
import AppLayout from './layouts/AppLayout'
import ProtectedRoute from './routes/ProtectedRoute'
import Home from './pages/Home'
import Auth from './pages/Auth'
import Create from './pages/Create'
import CreateStory from './pages/CreateStory'
import Profile from './pages/Profile'
import UserProfile from './pages/UserProfile'
import Settings from './pages/Settings'
import Messages from './pages/Messages'
import Notifications from './pages/Notifications'
import Explore from './pages/Explore'
import Reels from './pages/Reels'

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Auth mode="login" />} />
            <Route path="/signup" element={<Auth mode="signup" />} />
            <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route index element={<Home />} />
              <Route path="explore" element={<Explore />} />
              <Route path="reels" element={<Reels />} />
              <Route path="messages" element={<Messages />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="create" element={<Create />} />
              <Route path="create-story" element={<CreateStory />} />
              <Route path="profile" element={<Profile />} />
              <Route path="u/:uid" element={<UserProfile />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
              }
