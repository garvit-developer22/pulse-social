import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { createPost } from './posts'
import { uploadManyToCloudinary, isCloudinaryConfigured } from './cloudinary'
import { isFirebaseConfigured } from './config'
import { Button, Input, Textarea } from './ui'
import { useToast } from './useToast'

export default function Create() {
  const { user, profile } = useAuth()
  const nav = useNavigate()
  const { push } = useToast()
  const [files, setFiles] = useState([])
  const [caption, setCaption] = useState('')
  const [location, setLocation] = useState('')
  const [progress, setProgress] = useState(0)
  const [busy, setBusy] = useState(false)

  async function publish() {
    if (!isFirebaseConfigured) return push('Firebase not configured')
    if (!user) return push('Login required')
    if (!files.length) return push('Select at least one image')
    if (!isCloudinaryConfigured()) {
      return push('Cloudinary not configured — check .env')
    }
    setBusy(true)
    setProgress(0)
    try {
      const media = await uploadManyToCloudinary(files, setProgress)
      await createPost({
        uid: user.uid,
        authorName: profile?.displayName || profile?.username || 'user',
        authorPhoto: profile?.photoURL,
        media,
        caption,
        location,
      })
      push('Published')
      nav('/')
    } catch (e) {
      console.error(e)
      push(e.message || 'Publish failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg p-4">
      <h1 className="mb-4 text-xl font-bold">Create post</h1>
      <p className="mb-3 text-xs text-pulse-muted">
        Photos upload via Cloudinary (free). Firebase saves the post.
      </p>
      <Input
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={(e) => setFiles([...e.target.files].slice(0, 6))}
      />
      <div className="mt-3 grid grid-cols-3 gap-2">
        {files.map((f, i) => (
          <div key={i} className="aspect-square overflow-hidden rounded-xl bg-pulse-card">
            {f.type.startsWith('image/') ? (
              <img src={URL.createObjectURL(f)} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full place-items-center p-2 text-center text-[10px] text-pulse-muted">
                {f.name}
              </div>
            )}
          </div>
        ))}
      </div>
      <Textarea
        className="mt-4 min-h-[100px]"
        placeholder="Caption… #hashtags"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
      />
      <Input
        className="mt-3"
        placeholder="Location (optional)"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
      {busy && <p className="mt-2 text-xs text-pulse-muted">Upload {progress}%</p>}
      <Button className="mt-4 w-full" disabled={busy} onClick={publish}>
        {busy ? 'Publishing…' : 'Publish'}
      </Button>
    </div>
  )
}
