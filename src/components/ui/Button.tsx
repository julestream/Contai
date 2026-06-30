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
  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { padding: '8px 16px', fontSize: '14px' },
    md: { padding: '13px 24px', fontSize: '16px' },
  }

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: { background: '#0a0a0a', color: '#ffffff', border: 'none' },
    secondary: { background: '#ffffff', color: '#0a0a0a', border: '1px solid #0a0a0a' },
    ghost: { background: 'transparent', color: '#666', border: 'none' },
  }

  const isDisabled = disabled || loading

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        fontWeight: 500,
        borderRadius: '999px',
        cursor: isDisabled ? 'default' : 'pointer',
        width: full ? '100%' : 'auto',
        opacity: isDisabled ? 0.5 : 1,
        transition: 'opacity 0.15s',
        fontFamily: 'var(--font-instrument), sans-serif',
        ...sizeStyles[size],
        ...variantStyles[variant],
      }}
    >
      {loading ? 'Loading...' : children}
    </button>
  )
}