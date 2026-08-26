import { useState } from 'react'
import { createStory } from '../services/stories'
import { uploadToCloudinary, isCloudinaryConfigured } from '../services/cloudinary'
import { useAuth } from '../context/AuthContext'
import { Button, Input } from '../components/ui'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../hooks/useToast'
import { isFirebaseConfigured } from '../firebase/config'

export default function CreateStory() {
  const { user, profile, configured } = useAuth()
  const [file, setFile] = useState(null)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const nav = useNavigate()
  const { push } = useToast()

  async function publish() {
    if (!configured || !isFirebaseConfigured) return push('Firebase required')
    if (!file) return push('Choose a photo or short video')
    if (!isCloudinaryConfigured()) return push('Cloudinary not configured')
    setBusy(true)
    try {
      const media = await uploadToCloudinary(file, setProgress)
      // stories service still expects File for storage — write story doc directly here for cloudinary URL
      const { addDoc, collection, serverTimestamp } = await import('firebase/firestore')
      const { db } = await import('../firebase/config')
      const now = Date.now()
      await addDoc(collection(db, 'stories'), {
        authorId: user.uid,
        authorName: profile?.displayName || profile?.username || 'user',
        authorPhoto: profile?.photoURL || '',
        mediaUrl: media.url,
        mediaPath: media.path,
        mediaType: media.type,
        text,
        createdAt: serverTimestamp(),
        createdAtMs: now,
        expiresAt: now + 24 * 60 * 60 * 1000,
        viewsCount: 0,
      })
      push('Story shared')
      nav('/')
    } catch (e) {
      console.error(e)
      push(e.message || 'Story failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg p-4">
      <h1 className="text-xl font-bold mb-4">New story</h1>
      <Input type="file" accept="image/*,video/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      {file && file.type.startsWith('image/') && (
        <img src={URL.createObjectURL(file)} alt="" className="mt-3 max-h-80 w-full rounded-2xl object-cover" />
      )}
      <Input className="mt-3" placeholder="Optional text" value={text} onChange={(e) => setText(e.target.value)} />
      {busy && <p className="mt-2 text-xs text-pulse-muted">Upload {progress}%</p>}
      <Button className="mt-4 w-full" disabled={busy} onClick={publish}>
        {busy ? 'Uploading…' : 'Share story'}
      </Button>
    </div>
  )
}
