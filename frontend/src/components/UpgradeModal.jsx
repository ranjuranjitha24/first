import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Zap, ArrowRight, X } from 'lucide-react'

export default function UpgradeModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [modalData, setModalData] = useState({ reason: '', message: '' })

  useEffect(() => {
    const handleShow = (e) => {
      setModalData(e.detail || { reason: '', message: 'Upgrade required.' })
      setIsOpen(true)
    }
    
    window.addEventListener('showUpgradeModal', handleShow)
    return () => window.removeEventListener('showUpgradeModal', handleShow)
  }, [])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative"
        >
          {/* Header Graphic */}
          <div className="bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 p-8 flex flex-col items-center text-center relative border-b border-slate-800">
            <button 
              onClick={() => setIsOpen(false)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2"
            >
              <X size={20} />
            </button>
            <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white mb-4 shadow-[0_0_30px_rgba(99,102,241,0.5)]">
              {modalData.reason === 'demo_expired' ? <Lock size={32} /> : <Zap size={32} />}
            </div>
            <h2 className="text-2xl font-black text-white">
              {modalData.reason === 'demo_expired' ? 'Trial Expired' : 'Usage Limit Reached'}
            </h2>
            <p className="text-slate-300 mt-2 text-sm max-w-sm">
              {modalData.message || 'You have reached the limits of your current plan.'}
            </p>
          </div>

          {/* Body */}
          <div className="p-8">
            <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 mb-6">
              <h3 className="text-sm font-bold text-white mb-3">Upgrade to Premium to unlock:</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm text-slate-300">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">✓</div>
                  Unlimited Employees & Users
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-300">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">✓</div>
                  Unlimited Interview Scheduling
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-300">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">✓</div>
                  Advanced Analytics & Reporting
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-300">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">✓</div>
                  Priority Support
                </li>
              </ul>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setIsOpen(false)}
                className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors"
              >
                Maybe Later
              </button>
              <button 
                onClick={() => {
                  window.location.href = '/#contact';
                  setIsOpen(false);
                }}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
              >
                Contact Sales <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
