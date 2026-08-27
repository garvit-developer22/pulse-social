import { useState } from 'react'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db, isFirebaseConfigured } from './config'
import { useAuth } from './AuthContext'
import { Button, Input, Textarea } from './ui'
import { useToast } from './useToast'

export default function Settings() {
  const { logout, profile, user, refreshProfile, configured } = useAuth()
  const { push } = useToast()
  const [displayName, setDisplayName] = useState(profile?.displayName || '')
  const [bio, setBio] = useState(profile?.bio || '')
  const [website, setWebsite] = useState(profile?.website || '')
  const [busy, setBusy] = useState(false)

  async function save() {
    if (!user || !isFirebaseConfigured) return push('Firebase required')
    setBusy(true)
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: displayName.trim() || profile?.username,
        bio: bio.trim(),
        website: website.trim(),
        updatedAt: serverTimestamp(),
      })
      await refreshProfile?.()
      push('Profile updated')
    } catch (e) {
      push(e.message || 'Update failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg p-4 space-y-4">
      <h1 className="text-xl font-bold">Settings</h1>
      <div className="rounded-2xl border border-pulse-line bg-pulse-card p-4 text-sm space-y-2">
        <p><span className="text-pulse-muted">Username</span> · @{profile?.username || '—'}</p>
        <p><span className="text-pulse-muted">Email</span> · {user?.email || '—'}</p>
        <p><span className="text-pulse-muted">Firebase</span> · {configured ? 'connected' : 'not configured'}</p>
      </div>
      <div className="space-y-2">
        <label className="text-xs text-pulse-muted">Display name</label>
        <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        <label className="text-xs text-pulse-muted">Bio</label>
        <Textarea value={bio} onChange={(e) => setBio(e.target.value)} />
        <label className="text-xs text-pulse-muted">Website</label>
        <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://" />
        <Button className="w-full" disabled={busy || !configured} onClick={save}>
          {busy ? 'Saving…' : 'Save profile'}
        </Button>
      </div>
      <Button variant="ghost" className="w-full" onClick={() => logout()}>Log out</Button>
    </div>
  )
                      }
