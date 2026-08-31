import { useEffect, useState } from 'react'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db, isFirebaseConfigured } from './config'
import { useAuth } from './AuthContext'
import { Button, Input, Textarea } from './ui'
import { useToast } from './useToast'

export default function Settings() {
  const { logout, profile, user, refreshProfile } = useAuth()
  const { push } = useToast()
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [website, setWebsite] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setDisplayName(profile?.displayName || '')
    setBio(profile?.bio || '')
    setWebsite(profile?.website || '')
  }, [profile])

  async function save() {
    if (!user || !isFirebaseConfigured || !db) {
      push('Not connected. Check internet and try again.')
      return
    }
    setBusy(true)
    try {
      // setDoc merge = create OR update (updateDoc fails if doc missing)
      await setDoc(
        doc(db, 'users', user.uid),
        {
          uid: user.uid,
          email: user.email || '',
          username:
            profile?.username ||
            (user.email || 'user').split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20),
          displayName: displayName.trim() || profile?.username || 'User',
          bio: bio.trim(),
          website: website.trim(),
          photoURL: profile?.photoURL || user.photoURL || '',
          followersCount: profile?.followersCount || 0,
          followingCount: profile?.followingCount || 0,
          postsCount: profile?.postsCount || 0,
          isPrivate: profile?.isPrivate || false,
          updatedAt: serverTimestamp(),
          createdAt: profile?.createdAt || serverTimestamp(),
        },
        { merge: true }
      )
      await refreshProfile?.()
      push('Profile updated')
    } catch (e) {
      const msg = String(e.message || '')
      if (msg.toLowerCase().includes('offline')) {
        push('Network offline. Turn on internet and retry.')
      } else {
        push('Could not save. Try again.')
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-4 p-4">
      <h1 className="text-xl font-bold">Settings</h1>

      <div className="space-y-2 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-sm">
        <p>
          <span className="text-zinc-500">Username</span> · @{profile?.username || '—'}
        </p>
        <p>
          <span className="text-zinc-500">Email</span> · {user?.email || '—'}
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-xs text-zinc-500">Display name</label>
        <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        <label className="text-xs text-zinc-500">Bio</label>
        <Textarea value={bio} onChange={(e) => setBio(e.target.value)} />
        <label className="text-xs text-zinc-500">Website</label>
        <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://" />
        <Button className="w-full" disabled={busy} onClick={save}>
          {busy ? 'Saving…' : 'Save profile'}
        </Button>
      </div>

      <Button variant="ghost" className="w-full" onClick={() => logout()}>
        Log out
      </Button>
    </div>
  )
}
