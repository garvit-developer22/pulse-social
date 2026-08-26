import { useEffect, useState } from 'react'
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore'
import { Link } from 'react-router-dom'
import { db, isFirebaseConfigured } from '../firebase/config'
import { useAuth } from '../context/AuthContext'
import { Avatar, Button, EmptyState, Skeleton } from '../components/ui'

export default function Profile() {
  const { profile, user } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !isFirebaseConfigured) {
      setLoading(false)
      return
    }
    ;(async () => {
      setLoading(true)
      try {
        const q = query(
          collection(db, 'posts'),
          where('authorId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(30)
        )
        const snap = await getDocs(q)
        setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      } catch {
        setPosts([])
      } finally {
        setLoading(false)
      }
    })()
  }, [user])

  if (!profile) {
    return <EmptyState title="Profile" subtitle="Login and connect Firebase to load profile." />
  }

  return (
    <div className="mx-auto max-w-xl p-4">
      <div className="flex gap-6 items-center">
        <Avatar name={profile.displayName || profile.username} src={profile.photoURL} size="lg" />
        <div className="min-w-0">
          <h1 className="text-xl font-bold truncate">@{profile.username}</h1>
          <p className="text-sm text-pulse-muted">{profile.displayName}</p>
          <div className="mt-3 flex gap-4 text-sm">
            <span><b>{profile.postsCount ?? posts.length}</b> posts</span>
            <span><b>{profile.followersCount || 0}</b> followers</span>
            <span><b>{profile.followingCount || 0}</b> following</span>
          </div>
        </div>
      </div>
      <p className="mt-4 text-sm whitespace-pre-wrap">{profile.bio || 'No bio yet.'}</p>
      {profile.website ? (
        <a className="text-sm text-pulse-accent" href={profile.website} target="_blank" rel="noreferrer">
          {profile.website}
        </a>
      ) : null}
      <div className="mt-4 flex gap-2">
        <Link to="/settings" className="flex-1">
          <Button className="w-full" variant="soft">Edit profile</Button>
        </Link>
        <Link to="/create-story" className="flex-1">
          <Button className="w-full" variant="ghost">Add story</Button>
        </Link>
      </div>
      {loading ? (
        <div className="mt-6 grid grid-cols-3 gap-1">
          <Skeleton className="aspect-square" />
          <Skeleton className="aspect-square" />
          <Skeleton className="aspect-square" />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-3 gap-1 border-t border-pulse-line pt-1">
          {posts.map((p) => (
            <div key={p.id} className="aspect-square overflow-hidden bg-pulse-card">
              {p.media?.[0]?.url ? (
                p.media[0].type === 'video' ? (
                  <div className="grid h-full place-items-center text-pulse-muted">▶</div>
                ) : (
                  <img src={p.media[0].url} alt="" className="h-full w-full object-cover" />
                )
              ) : null}
            </div>
          ))}
        </div>
      )}
      {!loading && posts.length === 0 && (
        <p className="mt-4 text-center text-xs text-pulse-muted">No posts yet — use Create.</p>
      )}
    </div>
  )
}
