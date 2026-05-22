import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export function Modal({ isOpen, onClose, title, subtitle, children, className = '', maxWidth = 520 }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="modal-overlay open"
          style={{ 
            display: 'flex', position: 'fixed', inset: 0, 
            background: 'rgba(9, 9, 11, 0.7)', backdropFilter: 'blur(12px)',
            zIndex: 9999, alignItems: 'center', justifyContent: 'center', padding: 24 
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && onClose) onClose()
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`modal ${className}`}
            style={{ 
              background: 'var(--bg-card)', borderRadius: 24, width: '100%', maxWidth, 
              boxShadow: '0 24px 60px rgba(0,0,0,0.4)', border: '1px solid var(--border)', overflow: 'hidden' 
            }}
          >
            {(title || onClose) && (
              <div style={{ padding: '24px 24px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  {title && <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{title}</h3>}
                  {subtitle && <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0 0' }}>{subtitle}</p>}
                </div>
                {onClose && (
                  <button onClick={onClose} className="modal-close" style={{ background: 'var(--bg)', border: 'none', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    <X size={16} />
                  </button>
                )}
              </div>
            )}
            <div style={{ padding: 24, maxHeight: 'calc(90vh - 80px)', overflowY: 'auto' }}>
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
