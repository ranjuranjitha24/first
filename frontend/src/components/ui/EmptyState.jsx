import { motion } from 'framer-motion'

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="empty-state"
      style={{ padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
    >
      {Icon && (
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          style={{ width: 64, height: 64, borderRadius: 20, background: 'var(--primary-glow)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}
        >
          <Icon size={32} strokeWidth={1.5} />
        </motion.div>
      )}
      <motion.h3
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}
      >
        {title}
      </motion.h3>
      <motion.p
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 300, textAlign: 'center', marginBottom: 24, lineHeight: 1.5 }}
      >
        {description}
      </motion.p>
      {action && (
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
          {action}
        </motion.div>
      )}
    </motion.div>
  )
}
