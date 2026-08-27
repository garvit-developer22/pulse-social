import { useCallback, useEffect, useState } from 'react'
import { fetchFeedPage } from '../services/posts'
import { fetchActiveStories } from '../services/stories'
import { isFirebaseConfigured } from '../firebase/config'
import { useAuth } from '../context/AuthContext'
import { EmptyState, Skeleton } from '../components/ui'
import PostCard from '../components/PostCard'
import { Link } from 'react-router-dom'

export default function Home() {
  const { configured } = useAuth()
  const [posts, setPosts] = useState([])
  const [cursor, setCursor] = useState(null)
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async (reset = true) => {
    if (!configured || !isFirebaseConfigured) {
      setLoading(false)
      return
    }
    try {
      if (reset) setLoading(true)
      else setLoadingMore(true)
      setError('')
      const [{ items, nextCursor }, st] = await Promise.all([
        fetchFeedPage(10, reset ? null : cursor),
        reset ? fetchActiveStories().catch(() => []) : Promise.resolve(stories),
      ])
      setPosts((p) => reset ? items : [...p, ...items])
      setCursor(nextCursor)
      if (reset) setStories(st)
    } catch (e) {
      setError(e.message || 'Failed to load')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [configured, cursor, stories])

  useEffect(() => { load(true) }, [configured])

  // group stories by author
  const storyAuthors = []
  const seen = new Set()
  for (const s of stories) {
    if (seen.has(s.authorId)) continue
    seen.add(s.authorId)
    storyAuthors.push(s)
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="flex gap-4 overflow-x-auto no-scrollbar border-b border-pulse-line px-4 py-3">
        <Link to="/create-story" className="w-16 shrink-0 text-center">
          <div className="mx-auto h-14 w-14 rounded-full bg-gradient-to-tr from-pulse-accent to-pulse-accent2 p-[2px]">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-pulse-bg text-xl font-bold">+</div>
          </div>
          <p className="mt-1 truncate text-[11px] text-pulse-muted">Your story</p>
        </Link>
        {storyAuthors.map((s) => (
          <Link key={s.id} to={`/stories/${s.authorId}`} className="w-16 shrink-0 text-center">
            <div className="mx-auto h-14 w-14 rounded-full bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 p-[2px]">
              <div className="h-full w-full overflow-hidden rounded-full border-2 border-pulse-bg bg-pulse-card">
                {s.authorPhoto ? <img src={s.authorPhoto} alt="" className="h-full w-full object-cover" /> : (
                  <div className="grid h-full place-items-center text-sm font-bold">{(s.authorName || 'U')[0]}</div>
                )}
              </div>
            </div>
            <p className="mt-1 truncate text-[11px]">{s.authorName || 'user'}</p>
          </Link>
        ))}
      </div>

      {!configured && (
        <div className="m-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
          Firebase not configured yet. App UI works; connect env keys when ready.
        </div>
      )}

      {loading && <div className="space-y-4 p-4"><Skeleton className="h-96 w-full" /><Skeleton className="h-96 w-full" /></div>}
      {error && <EmptyState title="Feed error" subtitle={error} />}
      {!loading && !error && posts.length === 0 && (
        <EmptyState title="No posts yet" subtitle="Be the first — use Create." />
      )}

      {posts.map((p) => (
        <PostCard key={p.id} post={p} onDeleted={(id) => setPosts((all) => all.filter((x) => x.id !== id))} />
      ))}

      {cursor && (
        <div className="p-4 text-center">
          <button type="button" disabled={loadingMore} onClick={() => load(false)} className="text-sm font-semibold text-pulse-accent">
            {loadingMore ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  )
}
