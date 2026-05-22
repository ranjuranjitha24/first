import { motion } from 'framer-motion'

export function Card({ children, className = '', hoverEffect = false, ...props }) {
  return (
    <motion.div
      whileHover={hoverEffect ? { y: -4, boxShadow: '0 12px 40px rgba(0,0,0,0.6)', borderColor: 'var(--primary-glow)' } : {}}
      transition={{ duration: 0.3 }}
      className={`card ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  )
}
