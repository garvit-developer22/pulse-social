import { useEffect, useState } from 'react'
import { listConversationsFor, getOrCreateConversation, listenMessages, sendMessage } from '../services/messages'
import { searchUsersByUsername } from '../services/follows'
import { useAuth } from '../context/AuthContext'
import { Avatar, Button, EmptyState, Input } from '../components/ui'
import { useToast } from '../hooks/useToast'

export default function Messages() {
  const { user, profile, configured } = useAuth()
  const { push } = useToast()
  const [list, setList] = useState([])
  const [active, setActive] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])

  useEffect(() => {
    if (!user || !configured) return
    listConversationsFor(user.uid).then(setList).catch((e) => push(e.message))
  }, [user, configured])

  useEffect(() => {
    if (!active) return
    const unsub = listenMessages(active, setMessages)
    return () => unsub && unsub()
  }, [active])

  useEffect(() => {
    const t = setTimeout(() => {
      if (!q.trim()) return setResults([])
      searchUsersByUsername(q).then(setResults).catch(() => setResults([]))
    }, 300)
    return () => clearTimeout(t)
  }, [q])

  async function openWith(uid) {
    try {
      const id = await getOrCreateConversation(user.uid, uid)
      setActive(id)
      setList(await listConversationsFor(user.uid))
      setQ('')
      setResults([])
    } catch (e) {
      push(e.message)
    }
  }

  async function onSend() {
    if (!text.trim() || !active) return
    try {
      await sendMessage(active, { senderId: user.uid, text: text.trim() })
      setText('')
    } catch (e) {
      push(e.message)
    }
  }

  if (!configured) return <EmptyState title="Messages" subtitle="Connect Firebase to enable realtime chat." />

  return (
    <div className="mx-auto grid max-w-3xl md:grid-cols-[280px_1fr] min-h-[70vh]">
      <div className="border-r border-pulse-line">
        <div className="p-3 border-b border-pulse-line">
          <p className="font-semibold mb-2">{profile?.username || 'Messages'}</p>
          <Input placeholder="Search users to message" value={q} onChange={(e) => setQ(e.target.value)} />
          {results.map((u) => (
            <button key={u.uid || u.id} type="button" className="mt-2 flex w-full items-center gap-2 rounded-xl p-2 hover:bg-white/5" onClick={() => openWith(u.uid || u.id)}>
              <Avatar name={u.displayName || u.username} src={u.photoURL} size="sm" />
              <span className="text-sm">@{u.username}</span>
            </button>
          ))}
        </div>
        {list.length === 0 && <EmptyState title="No chats" subtitle="Search a user to start." />}
        {list.map((c) => (
          <button key={c.id} type="button" onClick={() => setActive(c.id)} className={`flex w-full items-center gap-3 border-b border-pulse-line px-3 py-3 text-left hover:bg-white/5 ${active === c.id ? 'bg-white/5' : ''}`}>
            <Avatar name="C" size="md" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">Chat</p>
              <p className="truncate text-xs text-pulse-muted">{c.lastMessage || '…'}</p>
            </div>
          </button>
        ))}
      </div>
      <div className="flex min-h-[50vh] flex-col">
        {!active ? (
          <EmptyState title="Select a conversation" />
        ) : (
          <>
            <div className="flex-1 space-y-2 overflow-y-auto p-4">
              {messages.map((m) => (
                <div key={m.id} className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${m.senderId === user.uid ? 'ml-auto bg-pulse-accent text-white' : 'bg-pulse-card'}`}>
                  {m.text}
                </div>
              ))}
            </div>
            <div className="flex gap-2 border-t border-pulse-line p-3">
              <Input className="flex-1" placeholder="Message…" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && onSend()} />
              <Button onClick={onSend}>Send</Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
