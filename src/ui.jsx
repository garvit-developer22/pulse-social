export function Button({ children, className = '', variant = 'primary', ...props }) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition active:scale-[0.98] disabled:opacity-45 disabled:pointer-events-none'
  const variants = {
    primary: 'bg-violet-600 text-white hover:bg-violet-500',
    ghost: 'bg-transparent border border-zinc-700 text-zinc-100 hover:bg-zinc-900',
    soft: 'bg-zinc-900 text-zinc-100 border border-zinc-800 hover:bg-zinc-800',
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
      className={`w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-violet-500 ${className}`}
      {...props}
    />
  )
}

export function Textarea({ className = '', ...props }) {
  return (
    <textarea
      className={`w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-violet-500 ${className}`}
      {...props}
    />
  )
}

export function Avatar({ name = 'U', src, size = 'md' }) {
  const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-9 w-9 text-sm', lg: 'h-20 w-20 text-2xl' }
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizes[size]} rounded-full object-cover bg-zinc-800 ring-1 ring-zinc-700`}
      />
    )
  }
  return (
    <div
      className={`${sizes[size]} flex items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500 font-bold text-white ring-1 ring-zinc-700`}
    >
      {(name || 'U').slice(0, 1).toUpperCase()}
    </div>
  )
}

export function EmptyState({ title, subtitle }) {
  return (
    <div className="px-6 py-20 text-center">
      <p className="text-lg font-semibold text-zinc-100">{title}</p>
      <p className="mt-2 text-sm text-zinc-500">{subtitle}</p>
    </div>
  )
}

export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-lg bg-zinc-900 ${className}`} />
}
