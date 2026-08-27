import { useEffect, useState } from 'react'
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react'
import { Avatar } from './ui'
import { hasLiked, toggleLike, toggleSave, addComment, fetchComments, deletePost } from './posts'
import { createNotification } from './notifications'
import { createReport } from './reports'
import { useAuth } from './AuthContext'
import { useToast } from './useToast'
import { Link } from 'react-router-dom'

export default function PostCard({ post, onDeleted }) {
  const { user, profile } = useAuth()
  const { push } = useToast()
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(post.likesCount || 0)
  const [saved, setSaved] = useState(false)
  const [comments, setComments] = useState([])
  const [showComments, setShowComments] = useState(false)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!user) return
    hasLiked(post.id, user.uid).then(setLiked).catch(() => {})
  }, [post.id, user])

  async function onLike() {
    if (!user) return push('Login required')
    setBusy(true)
    try {
      const nowLiked = await toggleLike(post.id, user.uid)
      setLiked(nowLiked)
      setLikes((n) => n + (nowLiked ? 1 : -1))
      if (nowLiked) {
        await createNotification({
          recipientId: post.authorId,
          actorId: user.uid,
          type: 'like',
          postId: post.id,
          message: 'liked your post',
        })
      }
    } catch (e) {
      push(e.message || 'Like failed')
    } finally {
      setBusy(false)
    }
  }

  async function onSave() {
    if (!user) return
    try {
      const now = await toggleSave(post.id, user.uid)
      setSaved(now)
      push(now ? 'Saved' : 'Removed')
    } catch (e) {
      push(e.message)
    }
  }

  async function loadComments() {
    setShowComments(true)
    try {
      setComments(await fetchComments(post.id))
    } catch (e) {
      push(e.message)
    }
  }

  async function sendComment() {
    if (!user || !text.trim()) return
    try {
      await addComment(post.id, {
        uid: user.uid,
        username: profile?.username || 'user',
        displayName: profile?.displayName || 'User',
        photoURL: profile?.photoURL,
        text: text.trim(),
      })
      await createNotification({
        recipientId: post.authorId,
        actorId: user.uid,
        type: 'comment',
        postId: post.id,
        message: 'commented on your post',
      })
      setText('')
      setComments(await fetchComments(post.id))
    } catch (e) {
      push(e.message)
    }
  }

  async function onDelete() {
    if (!user || user.uid !== post.authorId) return
    if (!confirm('Delete this post?')) return
    try {
      await deletePost(post)
      push('Deleted')
      onDeleted?.(post.id)
    } catch (e) {
      push(e.message)
    }
  }

  async function onReport() {
    if (!user) return
    try {
      await createReport({
        reporterId: user.uid,
        targetType: 'post',
        targetId: post.id,
        reason: 'other',
        details: 'Reported from feed',
      })
      push('Report submitted')
    } catch (e) {
      push(e.message)
    }
  }

  const media = post.media?.[0]

  return (
    <article className="border-b border-pulse-line">
      <div className="flex items-center gap-3 px-4 py-3">
        <Link to={`/u/${post.authorId}`}><Avatar name={post.authorName} src={post.authorPhoto} /></Link>
        <div className="min-w-0 flex-1">
          <Link to={`/u/${post.authorId}`} className="text-sm font-semibold hover:underline">{post.authorName || 'user'}</Link>
          {post.location ? <p className="text-xs text-pulse-muted">{post.location}</p> : null}
        </div>
        <details className="relative">
          <summary className="list-none cursor-pointer p-1 text-pulse-muted"><MoreHorizontal size={18} /></summary>
          <div className="absolute right-0 z-10 mt-1 w-40 rounded-xl border border-pulse-line bg-pulse-card py-1 text-sm shadow-lg">
            {user?.uid === post.authorId && (
              <button type="button" className="block w-full px-3 py-2 text-left text-red-400 hover:bg-white/5" onClick={onDelete}>Delete</button>
            )}
            <button type="button" className="block w-full px-3 py-2 text-left hover:bg-white/5" onClick={onReport}>Report</button>
          </div>
        </details>
      </div>

      {media?.type === 'video' ? (
        <video src={media.url} className="aspect-square w-full bg-black object-cover" controls playsInline />
      ) : media?.url ? (
        <img src={media.url} alt="" className="aspect-square w-full object-cover bg-pulse-card" />
      ) : (
        <div className="flex aspect-square items-center justify-center bg-pulse-card text-pulse-muted">No media</div>
      )}

      <div className="flex items-center gap-4 px-4 pt-3">
        <button type="button" disabled={busy} onClick={onLike} className={liked ? 'text-red-500' : ''}>
          <Heart size={24} fill={liked ? 'currentColor' : 'none'} />
        </button>
        <button type="button" onClick={loadComments}><MessageCircle size={24} /></button>
        <button type="button" onClick={() => navigator.share?.({ text: post.caption || 'Pulse post' }).catch(() => {})}><Send size={24} /></button>
        <button type="button" className="ml-auto" onClick={onSave}><Bookmark size={24} fill={saved ? 'currentColor' : 'none'} /></button>
      </div>
      <div className="px-4 py-2 text-sm">
        <p className="font-semibold">{Math.max(0, likes)} likes</p>
        {post.caption && (
          <p className="mt-1">
            <span className="font-semibold mr-2">{post.authorName}</span>
            {post.caption}
          </p>
        )}
        {(post.commentsCount > 0 || showComments) && (
          <button type="button" className="mt-1 text-pulse-muted" onClick={loadComments}>
            View comments ({post.commentsCount || comments.length})
          </button>
        )}
      </div>

      {showComments && (
        <div className="border-t border-pulse-line px-4 py-3 space-y-2">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-2 text-sm">
              <Avatar name={c.displayName || c.username} src={c.photoURL} size="sm" />
              <p><span className="font-semibold mr-2">{c.username || c.displayName}</span>{c.text}</p>
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            <input
              className="flex-1 rounded-full border border-pulse-line bg-pulse-card px-3 py-2 text-sm outline-none"
              placeholder="Add a comment…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendComment()}
            />
            <button type="button" className="text-sm font-semibold text-pulse-accent" onClick={sendComment}>Post</button>
          </div>
        </div>
      )}
    </article>
  )
}
