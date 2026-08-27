import { useEffect, useState } from 'react'
import { fetchNotifications, markAllNotificationsRead } from './notifications'
import { useAuth } from './AuthContext'
import { Button, EmptyState } from './ui'
import { useToast } from './useToast'
export default function Notifications() {
  const { user, configured } = useAuth()
  const { push } = useToast()
  const [items, setItems] = useState([])

  async function load() {
    if (!user || !configured) return
    try {
      setItems(await fetchNotifications(user.uid))
    } catch (e) {
      push(e.message)
    }
  }

  useEffect(() => { load() }, [user, configured])

  if (!configured) return <EmptyState title="Notifications" subtitle="Connect Firebase first." />

  return (
    <div className="mx-auto max-w-xl p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Notifications</h1>
        <Button variant="ghost" onClick={async () => { await markAllNotificationsRead(user.uid, items); load() }}>Mark all read</Button>
      </div>
      {items.length === 0 && <EmptyState title="You're all caught up" subtitle="Likes, comments and follows will show here." />}
      <div className="divide-y divide-pulse-line">
        {items.map((n) => (
          <div key={n.id} className={`flex gap-3 py-3 text-sm ${n.isRead ? 'opacity-60' : ''}`}>
            <div className={`mt-1.5 h-2 w-2 rounded-full ${n.isRead ? 'bg-pulse-line' : 'bg-pulse-accent'}`} />
            <div>
              <p><span className="font-semibold">{n.type}</span> · {n.message || ''}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
