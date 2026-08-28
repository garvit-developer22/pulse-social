import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db, isFirebaseConfigured } from './config'

const AuthContext = createContext(null)

async function ensureUserDoc(user, extra = {}) {
  if (!db || !user) return null
  const ref = doc(db, 'users', user.uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    const username =
      extra.username ||
      (user.email ? user.email.split('@')[0] : `user_${user.uid.slice(0, 6)}`)
    await setDoc(ref, {
      uid: user.uid,
      username:
        String(username)
          .toLowerCase()
          .replace(/[^a-z0-9_]/g, '')
          .slice(0, 20) || `user${user.uid.slice(0, 4)}`,
      displayName: extra.displayName || user.displayName || username,
      email: user.email || '',
      photoURL: user.photoURL || '',
      bio: '',
      website: '',
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      isPrivate: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }
  const again = await getDoc(ref)
  return again.exists() ? again.data() : null
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false)
      return
    }

    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      // IMPORTANT: loading pehle band
      setLoading(false)

      if (u) {
        ensureUserDoc(u)
          .then((p) => setProfile(p))
          .catch((e) => {
            console.error('profile error', e)
            setProfile(null)
          })
      } else {
        setProfile(null)
      }
    })

    const t = setTimeout(() => setLoading(false), 8000)
    return () => {
      unsub()
      clearTimeout(t)
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      configured: isFirebaseConfigured,
      async login(email, password) {
        if (!auth) throw new Error('Firebase not configured')
        await signInWithEmailAndPassword(auth, email, password)
      },
      async signup({ email, password, username, displayName }) {
        if (!auth) throw new Error('Firebase not configured')
        const cred = await createUserWithEmailAndPassword(auth, email, password)
        if (displayName) await updateProfile(cred.user, { displayName })
        const p = await ensureUserDoc(cred.user, { username, displayName })
        setProfile(p)
        return p
      },
      async loginGoogle() {
        if (!auth) throw new Error('Firebase not configured')
        const provider = new GoogleAuthProvider()
        const cred = await signInWithPopup(auth, provider)
        const p = await ensureUserDoc(cred.user)
        setProfile(p)
        return p
      },
      async logout() {
        if (!auth) return
        await signOut(auth)
      },
      async resetPassword(email) {
        if (!auth) throw new Error('Firebase not configured')
        await sendPasswordResetEmail(auth, email)
      },
      async refreshProfile() {
        if (!auth?.currentUser) return
        const p = await ensureUserDoc(auth.currentUser)
        setProfile(p)
      },
    }),
    [user, profile, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
  }
