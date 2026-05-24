import { motion } from 'framer-motion'

export function Button({ 
  children, onClick, variant = 'primary', loading = false, disabled = false, 
  icon: Icon, className = '', type = 'button', style = {} 
}) {
  
  const baseStyle = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: '10px 20px', borderRadius: 12, fontFamily: 'Inter, sans-serif',
    fontSize: 13, fontWeight: 600, transition: 'all 0.2s', cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.6 : 1, outline: 'none', border: 'none', whiteSpace: 'nowrap'
  }

  let variantStyle = {}
  if (variant === 'primary') {
    variantStyle = {
      background: 'linear-gradient(135deg, var(--primary-light), var(--primary-dark))',
      color: 'white',
      boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
    }
  } else if (variant === 'secondary') {
    variantStyle = {
      background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)'
    }
  } else if (variant === 'danger') {
    variantStyle = {
      background: 'var(--danger-light)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.2)'
    }
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{ ...baseStyle, ...variantStyle, ...style }}
      whileHover={!disabled && !loading ? { y: -2, boxShadow: variant === 'primary' ? '0 8px 24px rgba(139, 92, 246, 0.4)' : undefined } : {}}
      whileTap={!disabled && !loading ? { scale: 0.97 } : {}}
      className={className}
    >
      {loading ? (
        <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
      ) : Icon && (
        <Icon size={16} strokeWidth={2} />
      )}
      {children}
    </motion.button>
  )
}
