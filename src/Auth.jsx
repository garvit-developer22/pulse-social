import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { Button, Input } from './ui'

export default function Auth({ mode = 'login' }) {
  const { user, loading, login, signup, loginGoogle, resetPassword, configured } = useAuth()
  const [form, setForm] = useState({ email: '', password: '', username: '', displayName: '', confirm: '' })
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)
  const isSignup = mode === 'signup'

  if (!loading && user) return <Navigate to="/" replace />

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setInfo('')
    setBusy(true)
    try {
      if (isSignup) {
        if (form.password !== form.confirm) throw new Error('Passwords do not match')
        if (!form.username.trim()) throw new Error('Username required')
        await signup({
          email: form.email.trim(),
          password: form.password,
          username: form.username.trim(),
          displayName: form.displayName.trim() || form.username.trim(),
        })
      } else {
        await login(form.email.trim(), form.password)
      }
    } catch (err) {
      setError(err.message || 'Auth failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[radial-gradient(ellipse_at_top,_rgba(139,92,246,0.2),_transparent_50%)]">
      <div className="w-full max-w-md rounded-3xl border border-pulse-line bg-pulse-card/90 p-6 shadow-glow backdrop-blur">
        <div className="mb-6 text-center">
          <div className="text-3xl font-extrabold">Pulse<span className="text-pulse-accent">.</span></div>
          <p className="mt-2 text-sm text-pulse-muted">{isSignup ? 'Create your account' : 'Welcome back'}</p>
        </div>
        {!configured && (
          <p className="mb-4 rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 text-xs text-amber-100">
            Add Firebase keys to <code>.env</code> before auth will work.
          </p>
        )}
        <form className="space-y-3" onSubmit={onSubmit}>
          {isSignup && (
            <>
              <Input placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
              <Input placeholder="Display name" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
            </>
          )}
          <Input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          {isSignup && (
            <Input type="password" placeholder="Confirm password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} required />
          )}
          {error && <p className="text-xs text-red-400">{error}</p>}
          {info && <p className="text-xs text-emerald-400">{info}</p>}
          <Button className="w-full" disabled={busy || !configured}>{busy ? 'Please wait…' : isSignup ? 'Sign up' : 'Log in'}</Button>
        </form>
        <Button className="w-full mt-3" variant="ghost" type="button" disabled={!configured || busy} onClick={() => loginGoogle().catch((e) => setError(e.message))}>
          Continue with Google
        </Button>
        {!isSignup && (
          <button
            type="button"
            className="mt-3 w-full text-center text-xs text-pulse-muted hover:text-pulse-text"
            onClick={async () => {
              try {
                if (!form.email) return setError('Enter email first')
                await resetPassword(form.email.trim())
                setInfo('Password reset email sent')
              } catch (e) {
                setError(e.message)
              }
            }}
          >
            Forgot password?
          </button>
        )}
        <p className="mt-6 text-center text-sm text-pulse-muted">
          {isSignup ? (
            <>Have an account? <Link className="text-pulse-accent" to="/login">Log in</Link></>
          ) : (
            <>New here? <Link className="text-pulse-accent" to="/signup">Sign up</Link></>
          )}
        </p>
      </div>
    </div>
  )
}
