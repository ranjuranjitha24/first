import os

content = """import React, { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Shield, Zap, Activity, Users, Clock, CreditCard, ChevronRight, Check, Key, Terminal } from 'lucide-react'
import { useSession } from '../context/SessionContext'
import { submitDemoRequest } from '../services/api'

// Sub-components
const BootSequence = ({ onComplete }) => {
  const [step, setStep] = useState(0)
  const steps = [
    "Initializing Workforce Core...",
    "Establishing secure RBAC tunnels...",
    "Syncing enterprise modules...",
    "System operational."
  ]

  useEffect(() => {
    let currentStep = 0
    const interval = setInterval(() => {
      currentStep++
      if (currentStep < steps.length) {
        setStep(currentStep)
      } else {
        clearInterval(interval)
        setTimeout(onComplete, 800)
      }
    }, 600)
    return () => clearInterval(interval)
  }, [onComplete])

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] bg-[#020202] flex items-center justify-center font-mono text-sm"
    >
      <div className="flex flex-col items-start gap-2 text-cyan-500/80">
        {steps.map((text, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={idx <= step ? { opacity: 1, x: 0 } : {}}
            className="flex items-center gap-3"
          >
            <span className="text-slate-600">{`[${(idx + 1) * 1024}ms]` }</span>
            <span>{text}</span>
            {idx === step && idx < steps.length - 1 && (
              <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }}>_</motion.span>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

const LiveSignals = () => {
  const [logs, setLogs] = useState([
    { type: 'SECURE', msg: 'RBAC verification strict' },
    { type: 'ACTIVE', msg: 'Awaiting node sync' }
  ])

  useEffect(() => {
    const newLogs = [
      { type: 'SYNC', msg: 'Payroll node connected' },
      { type: 'ACTIVE', msg: 'Attendance stream online' },
      { type: 'SECURE', msg: 'Session token refreshed' },
      { type: 'EVENT', msg: 'Candidate application received' },
      { type: 'SYNC', msg: 'Leave matrix compiled' }
    ]
    let i = 0
    const interval = setInterval(() => {
      setLogs(prev => [newLogs[i], ...prev].slice(0, 4))
      i = (i + 1) % newLogs.length
    }, 4500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="absolute bottom-10 left-10 font-mono text-[10px] hidden md:flex flex-col gap-1.5 z-40 pointer-events-none">
      <AnimatePresence>
        {logs.map((log, idx) => (
          <motion.div 
            key={log.msg + idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1 - (idx * 0.25), x: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            <span className={`px-1.5 py-0.5 rounded-sm bg-white/5 border border-white/10 ${log.type === 'SECURE' ? 'text-emerald-400' : log.type === 'ACTIVE' ? 'text-cyan-400' : 'text-purple-400'}`}>
              [{log.type}]
            </span>
            <span className="text-slate-400">{log.msg}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default function LandingPage() {
  const { user } = useSession()
  const navigate = useNavigate()
  
  const [booting, setBooting] = useState(true)

  // Scroll Tracking for Cinematic Canvas
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  // State 1: Dormant (0 - 0.2)
  // State 2: Synchronizing (0.2 - 0.5)
  // State 3: Operational (0.5 - 0.8)
  // State 4: Access Request (0.8 - 1.0)

  // Cinematic Transforms
  const coreScale = useTransform(scrollYProgress, [0, 0.4, 0.8, 1], [0.8, 1, 1.2, 5])
  const coreOpacity = useTransform(scrollYProgress, [0, 0.8, 0.95, 1], [0.6, 1, 0, 0])
  const coreBlur = useTransform(scrollYProgress, [0, 0.4, 0.8, 1], ["10px", "0px", "0px", "20px"])
  
  // Title Transforms
  const titleY = useTransform(scrollYProgress, [0, 0.3], [0, -100])
  const titleOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])

  // Orbital Nodes Transforms
  const nodesOpacity = useTransform(scrollYProgress, [0.1, 0.3, 0.7, 0.9], [0, 1, 1, 0])
  const nodesScale = useTransform(scrollYProgress, [0.1, 0.3, 0.7, 0.9], [0.8, 1, 1, 1.5])
  const nodesRotate = useTransform(scrollYProgress, [0.2, 0.8], [0, 15])

  // Access Console Transforms
  const consoleOpacity = useTransform(scrollYProgress, [0.8, 0.95], [0, 1])
  const consoleY = useTransform(scrollYProgress, [0.8, 0.95], [50, 0])

  // Form State
  const [formData, setFormData] = useState({ name: '', email: '', company: '' })
  const [formStatus, setFormStatus] = useState('idle') // idle, syncing, success

  const handleAccessRequest = async (e) => {
    e.preventDefault()
    setFormStatus('syncing')
    try {
      await submitDemoRequest({
        name: formData.name,
        email: formData.email,
        company_name: formData.company,
        planType: 'Enterprise',
        message: 'Requested via Access Console'
      })
      setTimeout(() => setFormStatus('success'), 1500)
    } catch (e) {
      console.error(e)
      setFormStatus('idle')
    }
  }

  const getDashboardRedirect = () => {
    if (!user) return '/login'
    if (['admin', 'hr'].includes(user.role)) return '/admin/dashboard'
    if (user.role === 'employee') return '/employee/dashboard'
    return '/candidate/dashboard'
  }

  return (
    <div className="bg-[#020202] text-slate-200 font-sans selection:bg-cyan-900/50">
      <AnimatePresence>
        {booting && <BootSequence onComplete={() => setBooting(false)} />}
      </AnimatePresence>

      {!booting && (
        <>
          {/* Top minimal nav overlaid */}
          <motion.nav 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="fixed top-0 left-0 right-0 z-50 px-8 py-6 flex justify-between items-center mix-blend-difference"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-sm font-semibold tracking-widest uppercase text-white/80">RecruiterPro OS</span>
            </div>
            <div className="flex items-center gap-6 text-xs font-semibold tracking-wider uppercase text-white/60">
              <Link to="/login" className="hover:text-white transition-colors">Internal Auth</Link>
              {user && (
                <Link to={getDashboardRedirect()} className="text-cyan-400 hover:text-cyan-300 transition-colors">Access Hub</Link>
              )}
            </div>
          </motion.nav>

          <LiveSignals />

          {/* Sticky Cinematic Scroll Canvas */}
          <div ref={containerRef} className="relative h-[500vh]">
            <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col items-center justify-center">
              
              {/* Atmospheric Background */}
              <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_20%,transparent_100%)] opacity-30" />
              </div>

              {/* Central Title (Fades out quickly) */}
              <motion.div 
                style={{ y: titleY, opacity: titleOpacity }}
                className="absolute top-[15%] z-20 flex flex-col items-center text-center px-4"
              >
                <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white mb-4">
                  Workforce Intelligence
                </h1>
                <p className="text-slate-400 max-w-xl text-lg font-light">
                  A live operational ecosystem connecting talent acquisition, identity provisioning, and payroll into a single cinematic control center.
                </p>
                <p className="mt-8 text-[10px] uppercase tracking-widest text-cyan-500/50 flex items-center gap-2">
                  <span className="w-px h-6 bg-cyan-500/50 block" /> Scroll to initialize <span className="w-px h-6 bg-cyan-500/50 block" />
                </p>
              </motion.div>

              {/* The Workforce Core */}
              <motion.div 
                style={{ scale: coreScale, opacity: coreOpacity, filter: coreBlur }}
                className="absolute z-10 flex items-center justify-center"
              >
                {/* Core Glow */}
                <motion.div 
                  animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute w-[300px] h-[300px] rounded-full bg-cyan-500/10 blur-[60px]"
                />
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                  className="w-[120px] h-[120px] rounded-full border border-cyan-500/30 flex items-center justify-center bg-black/50 backdrop-blur-xl shadow-[0_0_50px_rgba(6,182,212,0.2)]"
                >
                  <div className="w-[80px] h-[80px] rounded-full border border-cyan-400/50 flex items-center justify-center relative">
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="w-8 h-8 rounded-full bg-cyan-400 shadow-[0_0_30px_rgba(6,182,212,1)]"
                    />
                  </div>
                </motion.div>
              </motion.div>

              {/* Orbital Nodes (Appears as user scrolls) */}
              <motion.div 
                style={{ opacity: nodesOpacity, scale: nodesScale, rotate: nodesRotate }}
                className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center"
              >
                {/* Node: Talent Acquisition */}
                <div className="absolute -top-[120px] -left-[200px] w-48 p-4 rounded-xl bg-[#0a0a0a]/80 border border-white/10 backdrop-blur-md">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-6 h-6 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center"><Users size={12} /></div>
                    <span className="text-[10px] font-bold text-white uppercase">Talent</span>
                  </div>
                  <div className="text-[9px] text-slate-400">Sourcing & Pipeline Sync</div>
                  {/* Connection Line to Core */}
                  <svg className="absolute -bottom-16 -right-16 w-32 h-32 overflow-visible">
                    <path d="M 0 0 Q 100 100 150 150" fill="none" stroke="rgba(255,255,255,0.05)" />
                    <motion.path d="M 0 0 Q 100 100 150 150" fill="none" stroke="rgba(6,182,212,0.5)" strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: [0, 1, 0], opacity: [0,1,0] }} transition={{ duration: 3, repeat: Infinity }} />
                  </svg>
                </div>

                {/* Node: RBAC Provisioning */}
                <div className="absolute top-[50px] left-[250px] w-48 p-4 rounded-xl bg-[#0a0a0a]/80 border border-white/10 backdrop-blur-md">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-6 h-6 rounded bg-cyan-500/20 text-cyan-400 flex items-center justify-center"><Shield size={12} /></div>
                    <span className="text-[10px] font-bold text-white uppercase">Identity</span>
                  </div>
                  <div className="text-[9px] text-slate-400">Secure Protocol Active</div>
                  <svg className="absolute top-1/2 -left-32 w-32 h-2 overflow-visible -translate-y-1/2">
                    <path d="M 0 0 L 120 0" fill="none" stroke="rgba(255,255,255,0.05)" />
                    <motion.path d="M 0 0 L 120 0" fill="none" stroke="rgba(6,182,212,0.5)" strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: [0, 1, 0], opacity: [0,1,0] }} transition={{ duration: 2.5, repeat: Infinity, delay: 1 }} />
                  </svg>
                </div>

                {/* Node: Attendance Heartbeat */}
                <div className="absolute bottom-[80px] -left-[180px] w-48 p-4 rounded-xl bg-[#0a0a0a]/80 border border-white/10 backdrop-blur-md">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center"><Clock size={12} /></div>
                    <span className="text-[10px] font-bold text-white uppercase">Attendance</span>
                  </div>
                  <div className="text-[9px] text-slate-400">Live Grid Syncing</div>
                  <svg className="absolute -top-16 -right-16 w-32 h-32 overflow-visible">
                    <path d="M 0 100 Q 100 0 150 -50" fill="none" stroke="rgba(255,255,255,0.05)" />
                    <motion.path d="M 0 100 Q 100 0 150 -50" fill="none" stroke="rgba(6,182,212,0.5)" strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: [0, 1, 0], opacity: [0,1,0] }} transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }} />
                  </svg>
                </div>

                {/* Node: Payroll Execution */}
                <div className="absolute -bottom-[150px] right-[50px] w-48 p-4 rounded-xl bg-[#0a0a0a]/80 border border-white/10 backdrop-blur-md">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-6 h-6 rounded bg-purple-500/20 text-purple-400 flex items-center justify-center"><CreditCard size={12} /></div>
                    <span className="text-[10px] font-bold text-white uppercase">Payroll</span>
                  </div>
                  <div className="text-[9px] text-slate-400">Processing Node Ready</div>
                  <svg className="absolute -top-32 left-16 w-32 h-32 overflow-visible">
                    <path d="M 50 150 Q 50 50 -50 0" fill="none" stroke="rgba(255,255,255,0.05)" />
                    <motion.path d="M 50 150 Q 50 50 -50 0" fill="none" stroke="rgba(6,182,212,0.5)" strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: [0, 1, 0], opacity: [0,1,0] }} transition={{ duration: 4, repeat: Infinity, delay: 1.5 }} />
                  </svg>
                </div>
              </motion.div>

              {/* Final Access Console Overlay */}
              <motion.div 
                style={{ opacity: consoleOpacity, y: consoleY, pointerEvents: useTransform(consoleOpacity, v => v > 0.5 ? 'auto' : 'none') }}
                className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-md"
              >
                <div className="w-full max-w-lg mx-6 bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                  {/* Sublte top glow */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
                  
                  <div className="flex items-center gap-3 mb-8">
                    <Terminal className="text-cyan-400" size={24} />
                    <h2 className="text-xl font-bold tracking-tight text-white uppercase">Access Request Console</h2>
                  </div>

                  {formStatus === 'success' ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6">
                        <Check size={32} />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">Credentials Issued</h3>
                      <p className="text-sm text-slate-400 font-mono">Deployment channel opening. An operative will contact you securely.</p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleAccessRequest} className="space-y-5 relative z-10">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest block">Operative Name</label>
                        <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black/50 border-b border-white/20 px-0 py-2 text-white outline-none focus:border-cyan-400 transition-colors font-mono text-sm" placeholder="_" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest block">Secure Comms (Email)</label>
                        <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-black/50 border-b border-white/20 px-0 py-2 text-white outline-none focus:border-cyan-400 transition-colors font-mono text-sm" placeholder="_" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest block">Enterprise Entity</label>
                        <input required type="text" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full bg-black/50 border-b border-white/20 px-0 py-2 text-white outline-none focus:border-cyan-400 transition-colors font-mono text-sm" placeholder="_" />
                      </div>
                      <button 
                        type="submit" 
                        disabled={formStatus === 'syncing'}
                        className="w-full mt-8 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 py-3 rounded text-xs font-mono tracking-widest uppercase transition-all flex items-center justify-center gap-2"
                      >
                        {formStatus === 'syncing' ? (
                          <><div className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" /> Synchronizing...</>
                        ) : (
                          <><Key size={14} /> Request Authorization</>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
"""

with open(r"c:\hr recruiter\frontend\src\pages\LandingPage.jsx", "w", encoding="utf-8") as f:
    f.write(content)
print("LandingPage updated.")
