import { motion } from 'framer-motion'

export function SkeletonLoader({ className = '', style = {} }) {
  return (
    <div className={`skeleton ${className}`} style={{ width: '100%', height: 20, borderRadius: 8, ...style }} />
  )
}

export function SkeletonGrid({ count = 4 }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24, width: '100%' }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card" style={{ padding: 24 }}>
          <SkeletonLoader style={{ height: 48, width: 48, borderRadius: 12, marginBottom: 16 }} />
          <SkeletonLoader style={{ height: 16, width: '80%', marginBottom: 8 }} />
          <SkeletonLoader style={{ height: 14, width: '40%' }} />
        </div>
      ))}
    </motion.div>
  )
}
