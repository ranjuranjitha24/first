import { motion } from 'framer-motion'

export function StatusBadge({ status }) {
  let color = 'primary'
  let label = status || 'Unknown'
  
  const s = label.toLowerCase()
  if (s === 'approved' || s === 'completed' || s === 'active') color = 'success'
  else if (s === 'rejected' || s === 'cancelled' || s === 'expired') color = 'danger'
  else if (s === 'pending' || s === 'scheduled') color = 'warning'

  return (
    <motion.span 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`status-badge ${color}`}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
        background: `var(--${color}-light)`, color: `var(--${color})`, border: `1px solid rgba(var(--${color}-rgb, 0,0,0), 0.1)`
      }}
    >
      <span className="status-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: `var(--${color})`, boxShadow: `0 0 8px var(--${color})` }} />
      {label}
    </motion.span>
  )
}
