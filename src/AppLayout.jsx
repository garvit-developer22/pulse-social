import { NavLink, Outlet } from 'react-router-dom'
import { Home, Compass, PlusSquare, Clapperboard, User, Bell, MessageCircle, Settings } from 'lucide-react'
import { useAuth } from './AuthContext'

const item =
  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 transition hover:bg-zinc-900 hover:text-zinc-100'
const active = 'bg-zinc-900 text-zinc-100'

export default function AppLayout() {
  const { profile } = useAuth()

  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <div className="mx-auto flex max-w-6xl">
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col gap-0.5 border-r border-zinc-900 p-4 md:flex">
          <div className="mb-8 px-2 pt-2">
            <div className="text-2xl font-extrabold tracking-tight">
              Pulse<span className="text-violet-400">.</span>
            </div>
          </div>
          <NavLink to="/" end className={({ isActive }) => `${item} ${isActive ? active : ''}`}>
            <Home size={22} /> Home
          </NavLink>
          <NavLink to="/explore" className={({ isActive }) => `${item} ${isActive ? active : ''}`}>
            <Compass size={22} /> Explore
          </NavLink>
          <NavLink to="/reels" className={({ isActive }) => `${item} ${isActive ? active : ''}`}>
            <Clapperboard size={22} /> Reels
          </NavLink>
          <NavLink to="/messages" className={({ isActive }) => `${item} ${isActive ? active : ''}`}>
            <MessageCircle size={22} /> Messages
          </NavLink>
          <NavLink to="/notifications" className={({ isActive }) => `${item} ${isActive ? active : ''}`}>
            <Bell size={22} /> Notifications
          </NavLink>
          <NavLink to="/create" className={({ isActive }) => `${item} ${isActive ? active : ''}`}>
            <PlusSquare size={22} /> Create
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => `${item} ${isActive ? active : ''}`}>
            <User size={22} /> Profile
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => `${item} ${isActive ? active : ''}`}>
            <Settings size={22} /> Settings
          </NavLink>
          <div className="mt-auto px-2 text-xs text-zinc-600">
            {profile?.username ? `@${profile.username}` : ''}
          </div>
        </aside>

        <main className="min-w-0 flex-1 border-r border-zinc-900 safe-bottom md:pb-0">
          <div className="sticky top-0 z-20 flex items-center justify-between border-b border-zinc-900 bg-black/80 px-4 py-3 backdrop-blur md:hidden">
            <div className="text-xl font-extrabold">
              Pulse<span className="text-violet-400">.</span>
            </div>
            <div className="flex gap-4 text-zinc-300">
              <NavLink to="/notifications">
                <Bell size={22} />
              </NavLink>
              <NavLink to="/messages">
                <MessageCircle size={22} />
              </NavLink>
            </div>
          </div>
          <Outlet />
        </main>

        <aside className="sticky top-0 hidden h-screen w-72 shrink-0 p-4 lg:block">
          <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-4">
            <p className="text-sm font-semibold text-zinc-200">Welcome to Pulse</p>
            <p className="mt-2 text-xs leading-relaxed text-zinc-500">
              Share photos, follow friends, and explore new posts.
            </p>
          </div>
        </aside>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-900 bg-black/90 backdrop-blur md:hidden pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto flex max-w-lg items-center justify-around py-2.5">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'text-white' : 'text-zinc-500')}>
            <Home size={26} />
          </NavLink>
          <NavLink to="/explore" className={({ isActive }) => (isActive ? 'text-white' : 'text-zinc-500')}>
            <Compass size={26} />
          </NavLink>
          <NavLink to="/create" className={({ isActive }) => (isActive ? 'text-white' : 'text-zinc-500')}>
            <PlusSquare size={26} />
          </NavLink>
          <NavLink to="/reels" className={({ isActive }) => (isActive ? 'text-white' : 'text-zinc-500')}>
            <Clapperboard size={26} />
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => (isActive ? 'text-white' : 'text-zinc-500')}>
            <User size={26} />
          </NavLink>
        </div>
      </nav>
    </div>
  )
}
