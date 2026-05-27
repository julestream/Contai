interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md'
  full?: boolean
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  children: React.ReactNode
  type?: 'button' | 'submit' | 'reset'
}

export default function Button({
  variant = 'primary',
  size = 'md',
  full = false,
  onClick,
  disabled,
  loading,
  children,
  type = 'button',
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-medium transition-all rounded-full'
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
  }
  const variants = {
    primary: 'bg-ink text-white hover:bg-ink-mid disabled:opacity-40',
    secondary: 'bg-white text-ink border border-ink hover:bg-bone disabled:opacity-40',
    ghost: 'bg-transparent text-ink-muted hover:text-ink disabled:opacity-40',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${sizes[size]} ${variants[variant]} ${full ? 'w-full' : ''}`}
    >
      {loading ? 'Loading...' : children}
    </button>
  )
}
