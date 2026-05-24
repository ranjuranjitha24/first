import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Shield, Activity, Users, Clock, CreditCard, ChevronRight, Check, BarChart2 } from 'lucide-react'
import { useSession } from '../context/SessionContext'
import { submitDemoRequest } from '../services/api'
import { toast } from 'sonner'

export default function LandingPage() {
  const { user } = useSession()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({ name: '', company: '', email: '' })
  const [formStatus, setFormStatus] = useState('idle')

  const handleWalkthrough = () => {
    const section = document.getElementById("walkthrough");
    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const handleDemoSubmit = async (e) => {
    e.preventDefault()
    setFormStatus('submitting')
    try {
      await submitDemoRequest({
        name: formData.name,
        email: formData.email,
        company_name: formData.company,
        phone: 'Not provided', // Required by backend Pydantic model
        planType: 'Enterprise',
        message: 'Walkthrough Requested'
      })
      toast.success('Demo request submitted successfully!')
      setTimeout(() => setFormStatus('success'), 1200)
    } catch (err) {
      console.error(err)
      toast.error('Failed to submit request. Please try again.')
      setFormStatus('idle')
    }
  }

  const getDashboardRedirect = () => {
    if (!user) return '/login'
    if (['admin', 'hr'].includes(user.role)) return '/admin/dashboard'
    if (user.role === 'employee') return '/employee/dashboard'
    return '/candidate/dashboard'
  }

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  return (
    <div className="min-h-screen bg-[#0B1020] text-slate-200 font-sans selection:bg-cyan-500/30 overflow-x-hidden relative">
      
      {/* Clean Ambient Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[50%] -translate-x-1/2 w-[80%] h-[50%] bg-cyan-900/5 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:64px_64px] opacity-20" />
      </div>

      {/* Elegant Nav */}
      <nav className="relative z-50 max-w-7xl mx-auto px-8 h-20 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center border border-white/10 shadow-sm">
            <span className="font-bold text-xs text-white">HR</span>
          </div>
          <span className="font-semibold text-sm tracking-wide text-white">RecruiterPro</span>
        </div>
        
        <div className="flex items-center gap-6 text-sm font-medium">
          <Link to="/login" className="text-slate-400 hover:text-white transition-colors">Sign In</Link>
          {user ? (
            <Link to={getDashboardRedirect()} className="px-4 py-2 rounded-md bg-white/10 text-white hover:bg-white/15 transition-colors border border-white/5 relative z-50">
              Dashboard
            </Link>
          ) : (
            <button onClick={handleWalkthrough} className="px-5 py-2 rounded-lg bg-white text-slate-950 hover:bg-slate-200 transition-all font-semibold shadow-sm cursor-pointer border-none relative z-50 pointer-events-auto">
              Book Walkthrough
            </button>
          )}
        </div>
      </nav>

      {/* HERO: Operational Minimalism */}
      <section className="relative z-10 pt-24 pb-32 px-6">
        <div className="max-w-6xl mx-auto text-center flex flex-col items-center">
          
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            Intelligent Workforce Infrastructure
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-[1.15] mb-6">
            The operational core <br/> for modern enterprise.
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="text-lg md:text-xl text-slate-400 font-light max-w-2xl leading-relaxed mb-10">
            Unify your entire talent lifecycle—from secure RBAC provisioning to attendance tracking and automated payroll—in one cinematic platform.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="flex gap-4 relative z-50">
            <button onClick={handleWalkthrough} className="px-8 py-3.5 rounded-xl bg-white text-slate-950 hover:bg-slate-200 transition-all font-semibold flex items-center gap-2 border-none cursor-pointer pointer-events-auto">
              Schedule Walkthrough <ChevronRight size={16} />
            </button>
          </motion.div>

          {/* Realistic Dashboard Mockup */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }}
            className="w-full max-w-5xl mt-20 relative"
          >
            <div className="bg-[#111827] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
              {/* Mock Header */}
              <div className="h-14 border-b border-slate-800 flex items-center px-6 gap-4 bg-[#0B1020]">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-700" />
                  <div className="w-3 h-3 rounded-full bg-slate-700" />
                  <div className="w-3 h-3 rounded-full bg-slate-700" />
                </div>
                <div className="flex-1" />
                <div className="h-6 w-48 bg-slate-800 rounded flex items-center px-3"><span className="text-xs text-slate-500">Search employees...</span></div>
              </div>
              
              {/* Mock Body */}
              <div className="p-8 grid grid-cols-3 gap-6 text-left">
                {/* Stats Row */}
                <div className="col-span-3 grid grid-cols-4 gap-4 mb-2">
                  {[
                    { label: 'Total Headcount', value: '1,248', trend: '+12' },
                    { label: 'Active Pipeline', value: '84', trend: '+5' },
                    { label: 'On Leave Today', value: '32', trend: '-2' },
                    { label: 'Payroll Variance', value: '1.2%', trend: 'Stable' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-[#0B1020] border border-slate-800 p-4 rounded-xl">
                      <div className="text-xs text-slate-400 font-medium mb-1 uppercase tracking-wider">{stat.label}</div>
                      <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                      <div className="text-xs text-cyan-400">{stat.trend} this month</div>
                    </div>
                  ))}
                </div>

                {/* Table Mock */}
                <div className="col-span-2 bg-[#0B1020] border border-slate-800 rounded-xl p-5">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-semibold text-white">Recent Hires</h3>
                    <span className="text-xs text-cyan-400">View All</span>
                  </div>
                  <div className="space-y-3">
                    {[
                      { name: 'Sarah Jenkins', role: 'Senior Engineer', dept: 'Engineering', status: 'Active' },
                      { name: 'Marcus Cole', role: 'Product Manager', dept: 'Product', status: 'Active' },
                      { name: 'Elena Rodriguez', role: 'UX Designer', dept: 'Design', status: 'Onboarding' }
                    ].map((row, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-slate-800/50 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-800" />
                          <div>
                            <div className="text-sm font-medium text-slate-200">{row.name}</div>
                            <div className="text-xs text-slate-500">{row.role}</div>
                          </div>
                        </div>
                        <div className="text-xs text-slate-400">{row.dept}</div>
                        <div className={`text-[10px] px-2 py-1 rounded-md font-semibold ${row.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-cyan-500/10 text-cyan-400'}`}>
                          {row.status}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Activity Mock */}
                <div className="col-span-1 bg-[#0B1020] border border-slate-800 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-white mb-4">System Activity</h3>
                  <div className="space-y-4">
                    {[
                      { text: 'Payroll cycle approved by Finance', time: '10m ago' },
                      { text: 'Access provisioned for 4 new hires', time: '1h ago' },
                      { text: 'Q3 Review cycle initiated', time: '2h ago' }
                    ].map((act, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="w-2 h-2 rounded-full bg-cyan-500 mt-1.5" />
                        <div>
                          <div className="text-xs text-slate-300">{act.text}</div>
                          <div className="text-[10px] text-slate-500">{act.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* Subtle base shadow */}
            <div className="absolute -inset-1 bg-gradient-to-b from-cyan-500/10 to-transparent blur-2xl -z-10 opacity-50" />
          </motion.div>
        </div>
      </section>

      {/* CORE CAPABILITIES (Clean Grid) */}
      <section className="py-24 px-6 relative z-10 bg-[#0B1020] border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} className="mb-16 max-w-2xl">
            <h2 className="text-3xl font-bold text-white tracking-tight mb-4">Engineered for scale.</h2>
            <p className="text-base text-slate-400 font-light leading-relaxed">
              Replace fragmented HR tools with a unified platform. Our architecture ensures that from recruitment to payroll, data flows securely and instantly.
            </p>
          </motion.div>

          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Shield size={20} className="text-cyan-400" />, title: "Enterprise Identity", desc: "Granular Role-Based Access Control separates candidate portals from internal administration safely." },
              { icon: <Activity size={20} className="text-cyan-400" />, title: "Live Orchestration", desc: "Real-time analytics ensure headcount and attendance metrics reflect true reality instantly." },
              { icon: <CreditCard size={20} className="text-cyan-400" />, title: "Automated Payroll", desc: "Time logs and approved leave dynamically inform payroll cycles, eliminating manual calculation errors." },
            ].map((f, i) => (
              <motion.div key={i} variants={fadeUp} className="p-6 rounded-2xl bg-[#111827] border border-slate-800 hover:border-slate-700 transition-colors duration-300">
                <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center mb-5">
                  {f.icon}
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* REFINED REQUEST DEMO */}
      <section id="walkthrough" className="py-24 px-6 relative z-10 bg-[#0F172A] scroll-mt-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row gap-12 relative overflow-hidden shadow-soft">
            <div className="flex-1 z-10">
              <h2 className="text-2xl font-bold text-white tracking-tight mb-4">Schedule a Walkthrough</h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                See how our platform can unify your workforce operations. Our team will tailor the demonstration to your specific organizational structure.
              </p>
              <div className="space-y-3">
                {[
                  "SOC2 Type II Compliant",
                  "Seamless historical data migration",
                  "Dedicated enterprise support"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Check size={14} className="text-cyan-400" />
                    <span className="text-sm font-medium text-slate-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 z-10 w-full max-w-sm">
              {formStatus === 'success' ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col justify-center py-6">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                    <Check size={20} />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">Request Received</h3>
                  <p className="text-sm text-slate-400">Our enterprise team will contact you shortly to schedule your personalized walkthrough.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleDemoSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Full Name</label>
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#0B1020] border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500 transition-colors" placeholder="Jane Doe" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Work Email</label>
                    <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-[#0B1020] border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500 transition-colors" placeholder="jane@company.com" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Company</label>
                    <input required type="text" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full bg-[#0B1020] border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500 transition-colors" placeholder="Acme Corp" />
                  </div>
                  <button type="submit" disabled={formStatus === 'submitting'} className="w-full mt-2 px-6 py-3 rounded-lg bg-white text-slate-950 font-semibold hover:bg-slate-200 transition-colors border-none cursor-pointer flex justify-center text-sm">
                    {formStatus === 'submitting' ? 'Submitting...' : 'Request Walkthrough'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Refined Footer */}
      <footer className="py-8 px-6 border-t border-slate-800 relative z-10 bg-[#0B1020]">
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
