import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { Button, Input } from './ui'

export default function Auth() {
  const { user, loading, login, signup, loginGoogle, resetPassword, configured } = useAuth()
  const [isSignup, setIsSignup] = useState(true)
  const [form, setForm] = useState({
    email: '',
    password: '',
    username: '',
    displayName: '',
    confirm: '',
  })
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)

  if (!loading && user) return <Navigate to="/" replace />

  function friendlyError(msg = '') {
    const m = String(msg).toLowerCase()
    if (m.includes('email-already')) return 'This email is already registered. Try logging in.'
    if (m.includes('wrong-password') || m.includes('invalid-credential')) return 'Wrong email or password.'
    if (m.includes('user-not-found')) return 'No account found. Please sign up.'
    if (m.includes('weak-password')) return 'Password should be at least 6 characters.'
    if (m.includes('network')) return 'Network error. Check your internet.'
    if (m.includes('popup')) return 'Google sign-in was closed. Try again.'
    if (m.includes('passwords do not match')) return 'Passwords do not match.'
    if (m.includes('username required')) return 'Username required.'
    return 'Something went wrong. Please try again.'
  }

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
      setError(friendlyError(err.message) || err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[radial-gradient(ellipse_at_top,_rgba(139,92,246,0.25),_transparent_55%)]">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-black/40 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-8 text-center">
          <div className="text-4xl font-extrabold tracking-tight">
            Pulse<span className="text-violet-400">.</span>
          </div>
          <p className="mt-2 text-sm text-zinc-400">
            {isSignup ? 'Sign up to see photos and videos from your friends.' : 'Welcome back'}
          </p>
        </div>

        <form className="space-y-3" onSubmit={onSubmit}>
          {isSignup && (
            <>
              <Input
                placeholder="Username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
              />
              <Input
                placeholder="Full name"
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              />
            </>
          )}
          <Input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          {isSignup && (
            <Input
              type="password"
              placeholder="Confirm password"
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              required
            />
          )}

          {error && <p className="text-center text-xs text-red-400">{error}</p>}
          {info && <p className="text-center text-xs text-emerald-400">{info}</p>}

          <Button className="w-full" disabled={busy || !configured}>
            {busy ? 'Please wait…' : isSignup ? 'Sign up' : 'Log in'}
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs text-zinc-500">OR</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <Button
          className="w-full"
          variant="ghost"
          type="button"
          disabled={!configured || busy}
          onClick={() => loginGoogle().catch((e) => setError(friendlyError(e.message)))}
        >
          Continue with Google
        </Button>

        {!isSignup && (
          <button
            type="button"
            className="mt-4 w-full text-center text-xs text-zinc-500 hover:text-zinc-300"
            onClick={async () => {
              try {
                if (!form.email) return setError('Enter your email first')
                await resetPassword(form.email.trim())
                setInfo('Password reset email sent')
              } catch (e) {
                setError(friendlyError(e.message))
              }
            }}
          >
            Forgot password?
          </button>
        )}

        <p className="mt-8 text-center text-sm text-zinc-400">
          {isSignup ? (
            <>
              Have an account?{' '}
              <button type="button" className="font-semibold text-violet-400" onClick={() => setIsSignup(false)}>
                Log in
              </button>
            </>
          ) : (
            <>
              Don&apos;t have an account?{' '}
              <button type="button" className="font-semibold text-violet-400" onClick={() => setIsSignup(true)}>
                Sign up
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
