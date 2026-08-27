import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './AuthContext'
import { ToastProvider } from './useToast'
import AppLayout from './AppLayout'
import ProtectedRoute from './ProtectedRoute'
import Home from './Home'
import Auth from './Auth'
import Create from './Create'
import CreateStory from './CreateStory'
import Profile from './Profile'
import UserProfile from './UserProfile'
import Settings from './Settings'
import Messages from './Messages'
import Notifications from './Notifications'
import Explore from './Explore'
import Reels from './Reels'

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Home />} />
              <Route path="/create" element={<Create />} />
              <Route path="/create-story" element={<CreateStory />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/reels" element={<Reels />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/user/:uid" element={<UserProfile />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
            }
