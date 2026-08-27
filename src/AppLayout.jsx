import { NavLink, Outlet } from 'react-router-dom'
import { Home, Compass, PlusSquare, Clapperboard, User, Bell, MessageCircle, Settings } from 'lucide-react'
import { useAuth } from './AuthContext'

const item = 'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-pulse-muted hover:bg-white/5 hover:text-pulse-text'
const active = 'bg-white/10 text-pulse-text'

export default function AppLayout() {
  const { profile } = useAuth()
  return (
    <div className="min-h-screen bg-pulse-bg text-pulse-text">
      <div className="mx-auto flex max-w-6xl">
        <aside className="hidden md:flex w-60 shrink-0 flex-col gap-1 border-r border-pulse-line p-4 sticky top-0 h-screen">
          <div className="mb-6 px-2">
            <div className="text-2xl font-extrabold tracking-tight">
              Pulse<span className="text-pulse-accent">.</span>
            </div>
            <p className="text-xs text-pulse-muted mt-1">Share moments</p>
          </div>
          <NavLink to="/" end className={({ isActive }) => `${item} ${isActive ? active : ''}`}><Home size={20} /> Home</NavLink>
          <NavLink to="/explore" className={({ isActive }) => `${item} ${isActive ? active : ''}`}><Compass size={20} /> Explore</NavLink>
          <NavLink to="/reels" className={({ isActive }) => `${item} ${isActive ? active : ''}`}><Clapperboard size={20} /> Reels</NavLink>
          <NavLink to="/messages" className={({ isActive }) => `${item} ${isActive ? active : ''}`}><MessageCircle size={20} /> Messages</NavLink>
          <NavLink to="/notifications" className={({ isActive }) => `${item} ${isActive ? active : ''}`}><Bell size={20} /> Notifications</NavLink>
          <NavLink to="/create" className={({ isActive }) => `${item} ${isActive ? active : ''}`}><PlusSquare size={20} /> Create</NavLink>
          <NavLink to="/profile" className={({ isActive }) => `${item} ${isActive ? active : ''}`}><User size={20} /> Profile</NavLink>
          <NavLink to="/settings" className={({ isActive }) => `${item} ${isActive ? active : ''}`}><Settings size={20} /> Settings</NavLink>
          <div className="mt-auto text-xs text-pulse-muted px-2">
            {profile?.username ? `@${profile.username}` : 'Guest'}
          </div>
        </aside>

        <main className="flex-1 min-w-0 border-r border-pulse-line safe-bottom md:pb-0">
          <div className="md:hidden sticky top-0 z-20 flex items-center justify-between border-b border-pulse-line bg-pulse-bg/90 px-4 py-3 backdrop-blur">
            <div className="text-xl font-extrabold">Pulse<span className="text-pulse-accent">.</span></div>
            <div className="flex gap-3 text-pulse-muted">
              <NavLink to="/notifications"><Bell size={22} /></NavLink>
              <NavLink to="/messages"><MessageCircle size={22} /></NavLink>
            </div>
          </div>
          <Outlet />
        </main>

        <aside className="hidden lg:block w-72 shrink-0 p-4 sticky top-0 h-screen">
          <div className="rounded-2xl border border-pulse-line bg-pulse-card p-4">
            <p className="text-sm font-semibold mb-2">Suggested</p>
            <p className="text-xs text-pulse-muted">Follow creators once Firebase is connected and users exist.</p>
          </div>
        </aside>
      </div>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-pulse-line bg-pulse-bg/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto flex max-w-lg items-center justify-around py-2">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'text-pulse-text' : 'text-pulse-muted'}><Home size={24} /></NavLink>
          <NavLink to="/explore" className={({ isActive }) => isActive ? 'text-pulse-text' : 'text-pulse-muted'}><Compass size={24} /></NavLink>
          <NavLink to="/create" className={({ isActive }) => isActive ? 'text-pulse-text' : 'text-pulse-muted'}><PlusSquare size={24} /></NavLink>
          <NavLink to="/reels" className={({ isActive }) => isActive ? 'text-pulse-text' : 'text-pulse-muted'}><Clapperboard size={24} /></NavLink>
          <NavLink to="/profile" className={({ isActive }) => isActive ? 'text-pulse-text' : 'text-pulse-muted'}><User size={24} /></NavLink>
        </div>
      </nav>
    </div>
  )
}
