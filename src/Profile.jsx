import { useEffect, useState } from 'react'
import { doc, getDoc, setDoc, serverTimestamp, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore'
import { Link } from 'react-router-dom'
import { db, isFirebaseConfigured } from './config'
import { useAuth } from './AuthContext'
import { Avatar, Button, EmptyState, Skeleton } from './ui'

export default function Profile() {
  const { user, logout } = useAuth()
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function loadProfile() {
    if (!user || !isFirebaseConfigured || !db) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    try {
      const ref = doc(db, 'users', user.uid)
      let snap = await getDoc(ref)

      // Agar doc nahi hai to banao
      if (!snap.exists()) {
        const username = (user.email || 'user').split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20)
        await setDoc(ref, {
          uid: user.uid,
          username: username || `user${user.uid.slice(0, 4)}`,
          displayName: user.displayName || username || 'User',
          email: user.email || '',
          photoURL: user.photoURL || '',
          bio: '',
          website: '',
          followersCount: 0,
          followingCount: 0,
          postsCount: 0,
          isPrivate: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
        snap = await getDoc(ref)
      }

      if (snap.exists()) {
        setProfile(snap.data())
      } else {
        setError('Could not create profile document')
      }

      // posts optional
      try {
        const q = query(
          collection(db, 'posts'),
          where('authorId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(30)
        )
        const ps = await getDocs(q)
        setPosts(ps.docs.map((d) => ({ id: d.id, ...d.data() })))
      } catch {
        setPosts([])
      }
    } catch (e) {
      console.error(e)
      setError(e.message || 'Firestore error')
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [user])

  if (!user) {
    return <EmptyState title="Profile" subtitle="Please log in first." />
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-xl p-6 text-center text-sm text-pulse-muted">
        Loading profile…
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-xl space-y-3 p-6 text-center">
        <h1 className="text-xl font-bold">Profile</h1>
        <p className="text-sm text-pulse-muted">Logged in: {user.email}</p>
        <p className="text-xs text-pulse-muted">UID: {user.uid}</p>
        {error && <p className="text-xs text-red-400 break-all">{error}</p>}
        <button
          type="button"
          disabled={busy}
          className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white"
          onClick={async () => {
            setBusy(true)
            await loadProfile()
            setBusy(false)
          }}
        >
          {busy ? 'Retrying…' : 'Create / Retry profile'}
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl p-4">
      <div className="flex items-center gap-6">
        <Avatar name={profile.displayName || profile.username} src={profile.photoURL} size="lg" />
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold">@{profile.username}</h1>
          <p className="text-sm text-pulse-muted">{profile.displayName}</p>
          <div className="mt-3 flex gap-4 text-sm">
            <span><b>{profile.postsCount ?? posts.length}</b> posts</span>
            <span><b>{profile.followersCount || 0}</b> followers</span>
            <span><b>{profile.followingCount || 0}</b> following</span>
          </div>
        </div>
      </div>
      <p className="mt-4 text-sm whitespace-pre-wrap">{profile.bio || 'No bio yet.'}</p>
      <div className="mt-4 flex gap-2">
        <Link to="/settings" className="flex-1">
          <Button className="w-full" variant="soft">Edit profile</Button>
        </Link>
        <Button className="flex-1" variant="ghost" onClick={() => logout?.()}>
          Log out
        </Button>
      </div>
      <div className="mt-6 grid grid-cols-3 gap-1 border-t border-pulse-line pt-1">
        {posts.map((p) => (
          <div key={p.id} className="aspect-square overflow-hidden bg-pulse-card">
            {p.media?.[0]?.url ? (
              <img src={p.media[0].url} alt="" className="h-full w-full object-cover" />
            ) : null}
          </div>
        ))}
      </div>
      {posts.length === 0 && (
        <p className="mt-4 text-center text-xs text-pulse-muted">No posts yet</p>
      )}
    </div>
  )
            }
