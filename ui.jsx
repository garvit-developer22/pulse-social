export function Button({ children, className = '', variant = 'primary', ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50'
  const variants = {
    primary: 'bg-pulse-accent text-white hover:opacity-90',
    ghost: 'bg-transparent border border-pulse-line text-pulse-text hover:bg-white/5',
    soft: 'bg-pulse-card text-pulse-text border border-pulse-line hover:bg-white/5',
  }
  return (
    <button className={`${base} ${variants[variant] || variants.primary} ${className}`} {...props}>
      {children}
    </button>
  )
}

export function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full rounded-xl border border-pulse-line bg-pulse-card px-3 py-2.5 text-sm text-pulse-text outline-none focus:border-pulse-accent ${className}`}
      {...props}
    />
  )
}

export function Textarea({ className = '', ...props }) {
  return (
    <textarea
      className={`w-full rounded-xl border border-pulse-line bg-pulse-card px-3 py-2.5 text-sm text-pulse-text outline-none focus:border-pulse-accent ${className}`}
      {...props}
    />
  )
}

export function Avatar({ name = 'U', src, size = 'md' }) {
  const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-20 w-20 text-2xl' }
  if (src) {
    return <img src={src} alt={name} className={`${sizes[size]} rounded-full object-cover bg-pulse-card`} />
  }
  return (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-pulse-accent to-pulse-accent2 flex items-center justify-center font-bold text-white`}>
      {(name || 'U').slice(0, 1).toUpperCase()}
    </div>
  )
}

export function EmptyState({ title, subtitle }) {
  return (
    <div className="text-center py-16 px-6">
      <p className="text-lg font-semibold">{title}</p>
      <p className="text-sm text-pulse-muted mt-2">{subtitle}</p>
    </div>
  )
}

export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-xl bg-white/5 ${className}`} />
}
