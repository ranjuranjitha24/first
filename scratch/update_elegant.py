import os

content = """import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Shield, Activity, Users, Clock, CreditCard, ChevronRight, Check } from 'lucide-react'
import { useSession } from '../context/SessionContext'
import { submitDemoRequest } from '../services/api'

// Sub-component for an elegant animated path
const ElegantConnection = ({ startX, startY, endX, endY, delay = 0 }) => {
  const path = `M ${startX} ${startY} C ${startX + 40} ${startY}, ${endX - 40} ${endY}, ${endX} ${endY}`
  return (
    <svg className="absolute inset-0 pointer-events-none z-0 w-full h-full overflow-visible">
      <path d={path} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" />
      <motion.path
        d={path}
        fill="none"
        stroke="rgba(148, 163, 184, 0.4)" // subtle slate
        strokeWidth="1.5"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: [0, 1, 1], opacity: [0, 1, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay }}
      />
    </svg>
  )
}

export default function LandingPage() {
  const { user } = useSession()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({ name: '', company: '', email: '' })
  const [formStatus, setFormStatus] = useState('idle') // idle, submitting, success

  const handleDemoSubmit = async (e) => {
    e.preventDefault()
    setFormStatus('submitting')
    try {
      await submitDemoRequest({
        name: formData.name,
        email: formData.email,
        company_name: formData.company,
        planType: 'Enterprise',
        message: 'Walkthrough Requested'
      })
      setTimeout(() => setFormStatus('success'), 1200)
    } catch (err) {
      console.error(err)
      setFormStatus('idle')
    }
  }

  const getDashboardRedirect = () => {
    if (!user) return '/login'
    if (['admin', 'hr'].includes(user.role)) return '/admin/dashboard'
    if (user.role === 'employee') return '/employee/dashboard'
    return '/candidate/dashboard'
  }

  // Animation variants for elegant stagger
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  }
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30 overflow-x-hidden relative">
      
      {/* Refined Ambient Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[50%] h-[50%] bg-indigo-900/10 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute top-[40%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] opacity-40" />
      </div>

      {/* Elegant Nav */}
      <nav className="relative z-50 max-w-7xl mx-auto px-8 h-20 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-slate-800 to-slate-700 flex items-center justify-center border border-white/10 shadow-sm">
            <span className="font-bold text-xs text-white">HR</span>
          </div>
          <span className="font-semibold text-sm tracking-wide text-white">RecruiterPro</span>
        </div>
        
        <div className="flex items-center gap-6 text-sm font-medium">
          <Link to="/login" className="text-slate-400 hover:text-white transition-colors">Sign In</Link>
          {user ? (
            <Link to={getDashboardRedirect()} className="px-4 py-2 rounded-md bg-white/10 text-white hover:bg-white/15 transition-colors border border-white/5">
              Dashboard
            </Link>
          ) : (
            <button onClick={() => document.getElementById('demo').scrollIntoView({ behavior: 'smooth' })} className="px-5 py-2 rounded-lg bg-white text-slate-950 hover:bg-slate-200 transition-all font-semibold shadow-md cursor-pointer border-none">
              Book Walkthrough
            </button>
          )}
        </div>
      </nav>

      {/* HERO: Elegant Operational Minimalism */}
      <section className="relative z-10 pt-32 pb-40 px-6">
        <div className="max-w-5xl mx-auto text-center flex flex-col items-center">
          
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: "easeOut" }} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            Enterprise Workforce Platform
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }} className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-[1.1] mb-8">
            The operational core <br/> for modern enterprise.
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }} className="text-lg md:text-xl text-slate-400 font-light max-w-2xl leading-relaxed mb-10">
            Unify your entire talent lifecycle—from initial sourcing to secure RBAC provisioning, attendance tracking, and automated payroll.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }} className="flex gap-4">
            <button onClick={() => document.getElementById('demo').scrollIntoView({ behavior: 'smooth' })} className="px-8 py-3.5 rounded-xl bg-white text-slate-950 hover:bg-slate-200 transition-all font-semibold shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center gap-2 border-none cursor-pointer">
              Schedule Walkthrough <ChevronRight size={16} />
            </button>
          </motion.div>

          {/* Elegant Product Workflow Representation */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-5xl mt-24 relative h-[300px] md:h-[400px]"
          >
            {/* Soft Glass Base */}
            <div className="absolute inset-0 bg-slate-900/30 border border-white/5 rounded-3xl backdrop-blur-xl shadow-2xl overflow-hidden" />
            
            {/* Elegant Connections */}
            <div className="absolute inset-0">
              <ElegantConnection startX={200} startY={200} endX={500} endY={150} delay={0} />
              <ElegantConnection startX={500} startY={150} endX={800} endY={250} delay={1.5} />
            </div>

            {/* Clean UI Nodes */}
            <div className="absolute top-[40%] left-[10%] md:left-[15%] -translate-y-1/2 w-64 bg-slate-950/80 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center"><Users size={16} /></div>
                <span className="text-xs font-semibold text-slate-200">Talent Acquisition</span>
              </div>
              <div className="space-y-3">
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-indigo-400 w-3/4 rounded-full" /></div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-slate-600 w-1/2 rounded-full" /></div>
              </div>
            </div>

            <div className="absolute top-[25%] left-1/2 -translate-x-1/2 w-72 bg-slate-900 border border-slate-700/50 rounded-2xl p-6 shadow-2xl backdrop-blur-lg z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center"><Shield size={20} /></div>
                <div>
                  <span className="text-sm font-semibold text-white block">Provisioning Core</span>
                  <span className="text-xs text-slate-400">RBAC Secured</span>
                </div>
              </div>
              <div className="bg-slate-950 rounded-lg p-3 border border-white/5 flex justify-between items-center text-xs">
                <span className="text-slate-400">System Health</span>
                <span className="text-emerald-400 font-medium">99.99%</span>
              </div>
            </div>

            <div className="absolute bottom-[20%] right-[10%] md:right-[15%] w-64 bg-slate-950/80 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center"><Clock size={16} /></div>
                <span className="text-xs font-semibold text-slate-200">Workforce Activity</span>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 h-12 rounded bg-slate-800 border border-white/5 flex flex-col justify-center px-3">
                  <span className="text-[9px] text-slate-500 uppercase">Active</span>
                  <span className="text-sm font-semibold text-white">1,240</span>
                </div>
                <div className="flex-1 h-12 rounded bg-slate-800 border border-white/5 flex flex-col justify-center px-3">
                  <span className="text-[9px] text-slate-500 uppercase">On Leave</span>
                  <span className="text-sm font-semibold text-white">42</span>
                </div>
              </div>
            </div>

          </motion.div>
        </div>
      </section>

      {/* CORE CAPABILITIES (Breathable Grid) */}
      <section className="py-32 px-6 relative z-10 bg-slate-950 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} className="mb-20 max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-6">Designed for scale.</h2>
            <p className="text-lg text-slate-400 font-light leading-relaxed">
              Replace fragmented HR tools with a unified platform. Our architecture ensures that from recruitment to payroll, data flows securely and instantly.
            </p>
          </motion.div>

          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: <Shield size={22} className="text-indigo-400" />, title: "Enterprise Identity", desc: "Granular Role-Based Access Control separates candidate portals from internal administration safely." },
              { icon: <Activity size={22} className="text-blue-400" />, title: "Live Orchestration", desc: "Websocket-driven analytics ensure headcount and attendance metrics reflect true reality instantly." },
              { icon: <CreditCard size={22} className="text-emerald-400" />, title: "Automated Payroll", desc: "Time logs and approved leave dynamically inform payroll cycles, eliminating manual calculation errors." },
            ].map((f, i) => (
              <motion.div key={i} variants={fadeUp} className="group p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:bg-slate-800/50 hover:border-slate-700 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* REFINED REQUEST DEMO */}
      <section id="demo" className="py-32 px-6 relative z-10 bg-[#020617]">
        <div className="max-w-5xl mx-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-16 flex flex-col md:flex-row gap-16 relative overflow-hidden">
            {/* Subtle light leak */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="flex-1 z-10">
              <h2 className="text-3xl font-bold text-white tracking-tight mb-6">Schedule a Walkthrough</h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                See how our platform can unify your workforce operations. Our team will tailor the demonstration to your specific organizational structure.
              </p>
              <div className="space-y-4">
                {[
                  "SOC2 Type II Compliant",
                  "Seamless historical data migration",
                  "Dedicated enterprise support"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Check size={16} className="text-indigo-400" />
                    <span className="text-sm font-medium text-slate-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 z-10 w-full max-w-sm">
              {formStatus === 'success' ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col justify-center py-8">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                    <Check size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Request Received</h3>
                  <p className="text-sm text-slate-400">Our enterprise team will contact you shortly to schedule your personalized walkthrough.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleDemoSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Full Name</label>
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 transition-colors" placeholder="Jane Doe" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Work Email</label>
                    <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 transition-colors" placeholder="jane@company.com" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Company</label>
                    <input required type="text" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 transition-colors" placeholder="Acme Corp" />
                  </div>
                  <button type="submit" disabled={formStatus === 'submitting'} className="w-full mt-2 px-6 py-3.5 rounded-xl bg-white text-slate-950 font-semibold hover:bg-slate-200 transition-all border-none cursor-pointer flex justify-center">
                    {formStatus === 'submitting' ? 'Submitting...' : 'Request Walkthrough'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Refined Footer */}
      <footer className="py-8 px-6 border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">© {new Date().getFullYear()} RecruiterPro. All rights reserved.</span>
          <div className="flex gap-6 text-xs text-slate-500 font-medium">
            <span className="hover:text-slate-300 cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-slate-300 cursor-pointer transition-colors">Terms</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
"""

with open(r"c:\hr recruiter\frontend\src\pages\LandingPage.jsx", "w", encoding="utf-8") as f:
    f.write(content)
print("LandingPage updated to elegant design.")
