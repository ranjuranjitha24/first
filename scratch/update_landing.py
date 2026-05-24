import os

new_content = """import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Menu, X, Check, ArrowRight, User, Building, Mail, Phone,
  Database, GitBranch, Shield, Activity, Users, Clock, CreditCard,
  ChevronRight, ArrowUpRight, Zap
} from 'lucide-react'
import { useSession } from '../context/SessionContext'
import { submitDemoRequest } from '../services/api'

// Sub-component for Animated Connection Line
const ConnectionLine = ({ startX, startY, endX, endY, delay = 0 }) => {
  const path = `M ${startX} ${startY} C ${startX + 50} ${startY}, ${endX - 50} ${endY}, ${endX} ${endY}`
  return (
    <svg className="absolute inset-0 pointer-events-none z-0 w-full h-full overflow-visible">
      {/* Base track */}
      <path d={path} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2" strokeLinecap="round" />
      {/* Animated pulse */}
      <motion.path
        d={path}
        fill="none"
        stroke="rgba(6, 182, 212, 0.6)" // cyan-500
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ 
          pathLength: [0, 1, 1],
          opacity: [0, 1, 0]
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: delay 
        }}
      />
    </svg>
  )
}

// Sub-component for an Animated Number
const AnimatedCounter = ({ value, prefix = "", suffix = "" }) => {
  return (
    <span className="font-mono text-white tracking-tight">
      {prefix}{value}{suffix}
    </span>
  )
}

export default function LandingPage() {
  const { user } = useSession()
  const navigate = useNavigate()
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [formData, setFormData] = useState({ name: '', companyName: '', email: '', phone: '', planType: 'Professional', message: '' })
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [formSuccess, setFormSuccess] = useState(false)

  // Realtime Simulation State
  const [activeUsers, setActiveUsers] = useState(1243)
  const [sysHealth, setSysHealth] = useState(99.9)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveUsers(prev => prev + Math.floor(Math.random() * 5) - 1)
      setSysHealth(prev => (prev > 99.7 ? prev - 0.01 : 99.99))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleDemoSubmit = async (e) => {
    e.preventDefault()
    setFormSubmitting(true)
    try {
      const apiData = { ...formData, company_name: formData.companyName }
      await submitDemoRequest(apiData)
      setFormSubmitting(false)
      setFormSuccess(true)
      setFormData({ name: '', companyName: '', email: '', phone: '', planType: 'Professional', message: '' })
      setTimeout(() => setFormSuccess(false), 4000)
    } catch (err) {
      console.error(err)
      setFormSubmitting(false)
    }
  }

  const getDashboardRedirect = () => {
    if (!user) return '/login'
    if (['admin', 'hr'].includes(user.role)) return '/admin/dashboard'
    if (user.role === 'employee') return '/employee/dashboard'
    return '/candidate/dashboard'
  }

  const scrollToSection = (id) => {
    setMobileMenuOpen(false)
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  // Animation variants
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }
  }
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  }

  return (
    <div className="min-h-screen font-sans bg-[#050505] text-slate-300 selection:bg-cyan-900/50 selection:text-cyan-100 overflow-x-hidden relative">
      
      {/* AMBIENT GLOW MESH (Cinematic Depth) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[10%] w-[40%] h-[40%] rounded-full bg-cyan-900/10 blur-[120px] mix-blend-screen animate-[pulse_10s_ease-in-out_infinite]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-900/10 blur-[150px] mix-blend-screen animate-[pulse_14s_ease-in-out_infinite_reverse]" />
      </div>

      {/* TOAST */}
      <AnimatePresence>
        {formSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-[9999] bg-[#111] border border-white/10 text-white px-6 py-4 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-4"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Check size={16} />
            </div>
            <div>
              <h4 className="font-semibold text-sm">Demo Requested</h4>
              <p className="text-xs text-slate-400">Our enterprise team will reach out shortly.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-[#050505]/70 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 no-underline group">
            <div className="w-8 h-8 bg-gradient-to-tr from-cyan-600 to-cyan-400 rounded flex items-center justify-center text-white font-bold text-sm shadow-[0_0_15px_rgba(6,182,212,0.3)] group-hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] transition-all">
              HR
            </div>
            <span className="font-bold text-lg tracking-tight text-white">
              Recruiter<span className="text-cyan-400 font-light">Pro</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {['ecosystem', 'features', 'pricing'].map(item => (
              <button key={item} onClick={() => scrollToSection(item)} className="text-sm font-medium text-slate-400 hover:text-white transition-colors capitalize bg-transparent border-none cursor-pointer p-0">
                {item}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-5">
            {user ? (
              <Link to={getDashboardRedirect()} className="bg-white/10 hover:bg-white/20 border border-white/5 text-white flex items-center gap-2 no-underline py-2 px-4 rounded-lg text-sm font-medium transition-all backdrop-blur-md">
                Launch System <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-slate-400 hover:text-white transition-colors no-underline font-medium text-sm">
                  Sign In
                </Link>
                <button onClick={() => scrollToSection('contact')} className="bg-white text-black hover:bg-slate-200 py-2 px-5 rounded-lg text-sm font-semibold border-none cursor-pointer flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                  Request Demo
                </button>
              </>
            )}
          </div>
          
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-slate-400 hover:text-white p-2 bg-transparent border-none">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* HERO SECTION - LIVING ECOSYSTEM */}
      <section className="relative pt-24 pb-32 px-6 overflow-hidden z-10">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold mb-8 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Live Operational Core v2.0
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }} className="text-5xl sm:text-7xl font-extrabold text-white tracking-tight mb-6 max-w-4xl leading-[1.1]">
            The intelligent <br className="hidden sm:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-300 to-slate-500">
              Workforce OS.
            </span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }} className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Unify candidate sourcing, RBAC provisioning, real-time attendance, and automated payroll into a single cinematic enterprise hub.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }} className="flex gap-4">
            <button onClick={() => scrollToSection('contact')} className="bg-white text-black hover:bg-slate-200 py-3.5 px-7 rounded-xl font-semibold flex items-center gap-2 transition-all cursor-pointer border-none">
              Deploy Ecosystem <ArrowUpRight size={18} />
            </button>
          </motion.div>
        </div>

        {/* HERO ANIMATED VISUALIZATION (Signature Identity) */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-6xl mx-auto mt-20 relative h-[400px] md:h-[500px]"
        >
          {/* Glass Pane Background */}
          <div className="absolute inset-0 bg-[#111]/40 border border-white/5 rounded-3xl backdrop-blur-2xl shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden" />
          
          {/* Grid lines inside glass */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />

          {/* Connection Lines Container */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Candidate -> Onboard */}
            <ConnectionLine startX={150} startY={250} endX={400} endY={150} delay={0} />
            {/* Onboard -> Attendance */}
            <ConnectionLine startX={550} startY={150} endX={800} endY={150} delay={1.5} />
            {/* Attendance -> Payroll */}
            <ConnectionLine startX={800} startY={150} endX={950} endY={300} delay={3} />
          </div>

          {/* Floating Operational Nodes */}
          
          {/* Node 1: Sourcing (Bottom Left) */}
          <motion.div 
            animate={{ y: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-[5%] md:left-[10%] bottom-[20%] md:bottom-[25%] bg-[#1a1a1a]/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 w-[220px] shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center"><Users size={16} /></div>
              <span className="text-xs font-bold text-white uppercase tracking-wider">Talent Sourcing</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px]"><span className="text-slate-400">Active Pipelines</span><span className="text-white font-mono">14</span></div>
              <div className="flex justify-between items-center text-[10px]"><span className="text-slate-400">New Apps/Hr</span><span className="text-cyan-400 font-mono flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" /> +<AnimatedCounter value={3} /></span></div>
            </div>
          </motion.div>

          {/* Node 2: Core Provisioning (Top Center) */}
          <motion.div 
            animate={{ y: [0, 10, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute left-1/2 -translate-x-1/2 top-[10%] md:top-[15%] bg-[#1a1a1a]/90 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-5 w-[260px] shadow-[0_0_30px_rgba(6,182,212,0.1)] z-10"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shadow-inner"><Shield size={20} /></div>
                <div>
                  <span className="text-[10px] text-cyan-500 font-bold tracking-widest uppercase block">RBAC Engine</span>
                  <span className="text-xs text-white font-medium">Provisioning Core</span>
                </div>
              </div>
            </div>
            <div className="bg-black/50 rounded-lg p-2.5 border border-white/5 space-y-1.5">
              <div className="flex items-center justify-between text-[10px]"><span className="text-slate-500">System Health</span><span className="text-emerald-400 font-mono">{sysHealth.toFixed(2)}%</span></div>
              <div className="flex items-center justify-between text-[10px]"><span className="text-slate-500">Access Tokens</span><span className="text-white font-mono">Secured</span></div>
            </div>
          </motion.div>

          {/* Node 3: Workforce Ops (Right Middle) */}
          <motion.div 
            animate={{ y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute right-[10%] md:right-[15%] top-[25%] md:top-[25%] bg-[#1a1a1a]/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 w-[220px] shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center"><Clock size={16} /></div>
              <span className="text-xs font-bold text-white uppercase tracking-wider">Attendance Logs</span>
            </div>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-2xl font-light text-white tracking-tight"><AnimatedCounter value={activeUsers} /></span>
              <span className="text-[10px] text-slate-500 mb-1">Clocked In</span>
            </div>
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400 w-[92%]" />
            </div>
          </motion.div>

          {/* Node 4: Payroll Event (Bottom Right) */}
          <motion.div 
            animate={{ y: [0, 8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute right-[5%] md:right-[5%] bottom-[15%] bg-[#1a1a1a]/80 backdrop-blur-md border border-white/10 rounded-2xl p-3 w-[200px] shadow-2xl flex items-center gap-3"
          >
             <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0"><CreditCard size={14} /></div>
             <div className="overflow-hidden">
               <span className="text-[9px] text-slate-500 block">Payroll Event</span>
               <span className="text-xs text-white font-medium truncate block">Cycle Executing...</span>
             </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ECOSYSTEM FEATURES */}
      <section id="ecosystem" className="py-32 px-6 relative z-10 border-t border-white/5 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="mb-20 text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">Intelligent Infrastructure</h2>
            <p className="text-slate-400 text-lg font-light leading-relaxed">
              A meticulously engineered stack designed to replace fragmented tools. Operations happen in real-time, secured by enterprise-grade RBAC.
            </p>
          </motion.div>

          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Identity & Access', icon: <Shield size={20} />, desc: 'Strict compartmentation between candidate portals and internal employee networks. Zero-trust principles applied.', glow: 'group-hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] group-hover:border-cyan-500/30', textHov: 'group-hover:text-cyan-400' },
              { title: 'Live Data Backbone', icon: <Activity size={20} />, desc: 'Websocket-driven analytics ensuring headcount, attendance metrics, and pipeline stages reflect true reality instantaneously.', glow: 'group-hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] group-hover:border-emerald-500/30', textHov: 'group-hover:text-emerald-400' },
              { title: 'Workflow Automation', icon: <Zap size={20} />, desc: 'Convert candidates to employees with a single click. Multi-stage leave approvals route autonomously to designated managers.', glow: 'group-hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] group-hover:border-purple-500/30', textHov: 'group-hover:text-purple-400' }
            ].map((f, i) => (
              <motion.div key={i} variants={fadeUp} className={`group bg-[#111] border border-white/5 p-8 rounded-2xl transition-all duration-500 ${f.glow}`}>
                <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-slate-300 mb-6 transition-colors ${f.textHov}`}>
                  {f.icon}
                </div>
                <h3 className={`text-lg font-semibold text-white mb-3 transition-colors ${f.textHov}`}>{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* PREMIUM ONBOARDING / DEMO SECTION */}
      <section id="contact" className="py-32 px-6 relative z-10 bg-[#050505]">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="flex flex-col text-left">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight leading-[1.1]">
              Ready to upgrade your <br/> operational stack?
            </h2>
            <p className="text-slate-400 text-lg font-light mb-10 leading-relaxed max-w-md">
              Schedule a personalized technical walkthrough. See how our ecosystem adapts to your specific organizational topology.
            </p>

            {/* Trust Badges */}
            <div className="space-y-6">
              {[
                { label: 'Enterprise Security', sub: 'SOC2 Type II Compliant & GDPR Ready' },
                { label: 'Seamless Migration', sub: 'Import historical data with zero downtime' },
                { label: 'Custom SLA', sub: 'Dedicated support engineering team' }
              ].map((b, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="mt-1 w-6 h-6 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <Check size={12} />
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-white">{b.label}</h5>
                    <span className="text-xs text-slate-500">{b.sub}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="relative">
            {/* Form Glow Backdrop */}
            <div className="absolute inset-0 bg-cyan-500/5 blur-[80px] rounded-full" />
            
            <div className="relative bg-[#111]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl">
              <form onSubmit={handleDemoSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-cyan-500/50 transition-colors" placeholder="Jane Doe" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Company</label>
                    <input type="text" name="companyName" value={formData.companyName} onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-cyan-500/50 transition-colors" placeholder="Acme Corp" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Work Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-cyan-500/50 transition-colors" placeholder="jane@acme.com" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Deployment Scale</label>
                  <select name="planType" value={formData.planType} onChange={handleInputChange} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-cyan-500/50 transition-colors appearance-none cursor-pointer">
                    <option value="Professional">Up to 150 Employees (Professional)</option>
                    <option value="Enterprise">Unlimited Scale (Enterprise)</option>
                  </select>
                </div>

                <button type="submit" disabled={formSubmitting} className="w-full mt-4 bg-white text-black hover:bg-slate-200 py-3.5 px-6 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer border-none shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                  {formSubmitting ? 'Initializing...' : 'Request Deployment Access'}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </section>

      {/* MINIMAL FOOTER */}
      <footer className="border-t border-white/5 bg-[#050505] pt-12 pb-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white/10 rounded flex items-center justify-center text-white font-bold text-[10px]">HR</div>
            <span className="font-semibold text-sm text-slate-300">RecruiterPro <span className="text-slate-600">OS</span></span>
          </div>
          <div className="flex gap-6 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms</span>
            <span className="hover:text-white cursor-pointer transition-colors">System Status</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
"""

with open(r"c:\hr recruiter\frontend\src\pages\LandingPage.jsx", "w", encoding="utf-8") as f:
    f.write(new_content)

print("LandingPage.jsx updated successfully.")
