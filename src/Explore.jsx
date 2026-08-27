import { useEffect, useState } from 'react'
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore'
import { db, isFirebaseConfigured } from './config'
import { EmptyState, Skeleton, Input } from './ui'
import { searchUsersByUsername } from './follows'
import { Link } from 'react-router-dom'

export default function Explore() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [users, setUsers] = useState([])

  useEffect(() => {
    if (!isFirebaseConfigured) { setLoading(false); return }
    getDocs(query(collection(db, 'posts'), orderBy('likesCount', 'desc'), limit(30)))
      .then((snap) => setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() }))))
      .catch(() => getDocs(query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(30)))
        .then((snap) => setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() }))))
        .catch(() => {}))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const t = setTimeout(() => {
      if (!q.trim()) return setUsers([])
      searchUsersByUsername(q).then(setUsers).catch(() => setUsers([]))
    }, 300)
    return () => clearTimeout(t)
  }, [q])

  return (
    <div className="mx-auto max-w-3xl p-4">
      <Input placeholder="Search users" value={q} onChange={(e) => setQ(e.target.value)} />
      {users.length > 0 && (
        <div className="mt-3 space-y-2">
          {users.map((u) => (
            <Link key={u.uid || u.id} to={`/u/${u.uid || u.id}`} className="block rounded-xl border border-pulse-line bg-pulse-card px-3 py-2 text-sm">
              @{u.username} · {u.displayName}
            </Link>
          ))}
        </div>
      )}
      <h2 className="mt-6 mb-3 font-semibold">Discover</h2>
      {loading && <div className="grid grid-cols-3 gap-1"><Skeleton className="aspect-square" /><Skeleton className="aspect-square" /><Skeleton className="aspect-square" /></div>}
      {!loading && posts.length === 0 && <EmptyState title="Nothing to explore" subtitle="Posts will appear here." />}
      <div className="grid grid-cols-3 gap-1">
        {posts.map((p) => (
          <div key={p.id} className="aspect-square overflow-hidden bg-pulse-card">
            {p.media?.[0]?.url ? <img src={p.media[0].url} alt="" className="h-full w-full object-cover" /> : null}
          </div>
        ))}
      </div>
    </div>
  )
                                 }
