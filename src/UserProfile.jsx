import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore'
import { db, isFirebaseConfigured } from './config'
import { useAuth } from './AuthContext'
import { followUser, unfollowUser, getFollowState } from './follows'
import { Avatar, Button, EmptyState, Skeleton } from './ui'
import { useToast } from './useToast'
import { createNotification } from './notifications'
export default function UserProfile() {
  const { uid } = useParams()
  const { user } = useAuth()
  const { push } = useToast()
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [state, setState] = useState('none')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isFirebaseConfigured || !uid) return
    ;(async () => {
      setLoading(true)
      try {
        const snap = await getDoc(doc(db, 'users', uid))
        setProfile(snap.exists() ? snap.data() : null)
        const pq = query(collection(db, 'posts'), where('authorId', '==', uid), orderBy('createdAt', 'desc'), limit(30))
        try {
          const ps = await getDocs(pq)
          setPosts(ps.docs.map((d) => ({ id: d.id, ...d.data() })))
        } catch {
          setPosts([])
        }
        if (user) setState(await getFollowState(user.uid, uid))
      } finally {
        setLoading(false)
      }
    })()
  }, [uid, user])

  async function onFollow() {
    if (!user) return push('Login required')
    try {
      if (state === 'following' || state === 'requested') {
        await unfollowUser(user.uid, uid)
        setState('none')
      } else {
        const r = await followUser(user.uid, uid)
        setState(r === 'requested' ? 'requested' : 'following')
        await createNotification({
          recipientId: uid,
          actorId: user.uid,
          type: r === 'requested' ? 'follow_request' : 'follow',
          message: r === 'requested' ? 'requested to follow you' : 'started following you',
        })
      }
    } catch (e) {
      push(e.message)
    }
  }

  if (loading) return <div className="p-4"><Skeleton className="h-40 w-full" /></div>
  if (!profile) return <EmptyState title="User not found" />

  const label = state === 'following' ? 'Following' : state === 'requested' ? 'Requested' : state === 'self' ? 'You' : 'Follow'

  return (
    <div className="mx-auto max-w-xl p-4">
      <div className="flex items-center gap-5">
        <Avatar name={profile.displayName} src={profile.photoURL} size="lg" />
        <div>
          <h1 className="text-xl font-bold">@{profile.username}</h1>
          <p className="text-sm text-pulse-muted">{profile.displayName}</p>
          <div className="mt-2 flex gap-4 text-sm">
            <span><b>{profile.postsCount || posts.length}</b> posts</span>
            <span><b>{profile.followersCount || 0}</b> followers</span>
            <span><b>{profile.followingCount || 0}</b> following</span>
          </div>
        </div>
      </div>
      <p className="mt-4 text-sm">{profile.bio}</p>
      {state !== 'self' && (
        <Button className="mt-4" variant={state === 'none' ? 'primary' : 'soft'} onClick={onFollow}>{label}</Button>
      )}
      <div className="mt-6 grid grid-cols-3 gap-1 border-t border-pulse-line pt-1">
        {posts.map((p) => (
          <div key={p.id} className="aspect-square bg-pulse-card overflow-hidden">
            {p.media?.[0]?.url && <img src={p.media[0].url} alt="" className="h-full w-full object-cover" />}
          </div>
        ))}
      </div>
    </div>
  )
}
