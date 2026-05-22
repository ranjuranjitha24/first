import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, Calendar, FileText, Briefcase, BarChart3, ShieldCheck, 
  ArrowRight, Menu, X, Check, Phone, Mail, Building, 
  MessageSquare, User, Globe, ExternalLink, Play, ArrowUpRight, Lock, Eye, Sparkles
} from 'lucide-react'
import { useSession } from '../context/SessionContext'
import { submitDemoRequest } from '../services/api'

export default function LandingPage() {
  const { user } = useSession()
  const navigate = useNavigate()
  
  // Mobile Nav State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Demo Form State
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    email: '',
    phone: '',
    planType: 'Starter',
    message: ''
  })
  const [formErrors, setFormErrors] = useState({})
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [formSuccess, setFormSuccess] = useState(false)

  // Demo validation
  const validateForm = () => {
    const errors = {}
    if (!formData.name.trim()) errors.name = 'Name is required'
    if (!formData.companyName.trim()) errors.companyName = 'Company name is required'
    
    // Email regex
    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }
    
    // Phone validation
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required'
    } else if (!/^\+?[0-9\s-]{8,15}$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number'
    }
    
    return errors
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error for that field
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleDemoSubmit = async (e) => {
    e.preventDefault()
    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setFormSubmitting(true)
    try {
      // Map companyName from formData to company_name expected by API
      const apiData = {
        name: formData.name,
        company_name: formData.companyName,
        email: formData.email,
        phone: formData.phone,
        planType: formData.planType,
        message: formData.message
      }
      await submitDemoRequest(apiData)
      setFormSubmitting(false)
      setFormSuccess(true)
      setFormData({ name: '', companyName: '', email: '', phone: '', planType: 'Starter', message: '' })
      // Auto-hide success toast after 4s
      setTimeout(() => setFormSuccess(false), 4000)
    } catch (err) {
      console.error(err)
      setFormSubmitting(false)
      // We could add an error toast here, but for now just clear submitting
      alert("Failed to submit demo request. Please try again later.")
    }
  }

  const getDashboardRedirect = () => {
    if (!user) return '/login'
    if (user.role === 'admin' || user.role === 'hr') return '/admin/dashboard'
    if (user.role === 'employee') return '/employee/dashboard'
    return '/candidate/dashboard'
  }

  const scrollToSection = (id) => {
    setMobileMenuOpen(false)
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  return (
    <div className="min-h-screen text-slate-100 font-poppins relative overflow-x-hidden bg-slate-950">
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[45%] h-[45%] rounded-full bg-purple-900/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-5%] left-[20%] w-[40%] h-[40%] rounded-full bg-blue-900/10 blur-[120px] pointer-events-none" />

      {/* SUCCESS TOAST */}
      <AnimatePresence>
        {formSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-[9999] bg-indigo-650 border border-indigo-500 text-white px-6 py-4 rounded-xl shadow-[0_20px_50px_rgba(99,102,241,0.3)] backdrop-blur-md flex items-center gap-3"
            style={{ backgroundColor: 'rgba(79, 70, 229, 0.9)' }}
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-lg">🎉</div>
            <div>
              <h4 className="font-bold text-sm">Demo Request Received!</h4>
              <p className="text-xs text-indigo-200">We will reach out to you within 24 hours.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 no-underline">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-[0_4px_14px_rgba(99,102,241,0.4)]">
              HR
            </div>
            <span className="font-bold text-xl tracking-tight text-white">
              HR Recruiter<span className="text-indigo-400"> Pro</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {['features', 'portals', 'pricing', 'contact'].map(item => (
              <button 
                key={item}
                onClick={() => scrollToSection(item)}
                className="text-slate-400 hover:text-white transition-colors capitalize font-medium bg-transparent border-none cursor-pointer"
              >
                {item}
              </button>
            ))}
          </div>

          {/* Nav Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <Link 
                to={getDashboardRedirect()} 
                className="btn-primary flex items-center gap-2 no-underline py-2.5 px-5 rounded-xl text-sm"
              >
                Go to Dashboard <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-slate-350 hover:text-white transition-colors no-underline font-semibold text-sm px-4 py-2"
                >
                  Log In
                </Link>
                <button 
                  onClick={() => scrollToSection('contact')}
                  className="btn-primary py-2.5 px-5 rounded-xl text-sm font-semibold border-none cursor-pointer flex items-center gap-1.5"
                >
                  Request Demo
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-slate-400 hover:text-white p-2 bg-transparent border-none cursor-pointer"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-slate-900 bg-slate-950 overflow-hidden"
            >
              <div className="px-6 py-6 flex flex-col gap-5">
                {['features', 'portals', 'pricing', 'contact'].map(item => (
                  <button 
                    key={item}
                    onClick={() => scrollToSection(item)}
                    className="text-left text-slate-400 hover:text-white transition-colors capitalize font-medium text-base bg-transparent border-none cursor-pointer"
                  >
                    {item}
                  </button>
                ))}
                <hr className="border-slate-900 my-1" />
                {user ? (
                  <Link 
                    to={getDashboardRedirect()} 
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-primary text-center py-3 px-5 rounded-xl text-sm font-semibold no-underline flex items-center justify-center gap-2"
                  >
                    Go to Dashboard <ArrowRight size={16} />
                  </Link>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link 
                      to="/login" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-center text-slate-300 hover:text-white transition-colors no-underline font-semibold text-sm py-3 border border-slate-800 rounded-xl"
                    >
                      Log In
                    </Link>
                    <button 
                      onClick={() => scrollToSection('contact')}
                      className="btn-primary py-3 px-5 rounded-xl text-sm font-semibold border-none cursor-pointer"
                    >
                      Request Demo
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* HERO SECTION */}
      <section className="pt-16 pb-24 px-6 max-w-7xl mx-auto grid md:grid-cols-12 gap-12 items-center relative">
        <div className="md:col-span-6 flex flex-col items-start text-left">
          {/* Tag */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-6 shadow-[0_0_15px_rgba(99,102,241,0.15)]"
          >
            <Sparkles size={14} className="text-indigo-400 animate-pulse" />
            Next-Gen Enterprise Recruitment Suite
          </motion.div>

          {/* Heading */}
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1] mb-6"
          >
            Smart HR &amp; <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500">
              Recruitment
            </span> <br />
            Platform
          </motion.h1>

          {/* Subheading */}
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-400 text-base sm:text-lg leading-relaxed mb-8 max-w-xl"
          >
            Streamline recruitment, employee management, attendance, and leave approvals with secure role-based access. Complete SaaS framework built for modern corporations.
          </motion.p>

          {/* Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-4"
          >
            <Link 
              to={user ? getDashboardRedirect() : '/register'}
              className="btn-primary no-underline py-3 px-6 rounded-xl font-bold flex items-center gap-2 shadow-[0_8px_20px_rgba(99,102,241,0.3)] hover:shadow-[0_12px_24px_rgba(99,102,241,0.4)]"
            >
              {user ? 'Open Portal' : 'Get Started'} <ArrowUpRight size={18} />
            </Link>
            <button 
              onClick={() => scrollToSection('features')}
              className="px-6 py-3 rounded-xl border-1.5 border-slate-800 bg-slate-900/30 hover:bg-slate-900/60 transition-all font-bold text-slate-300 hover:text-white cursor-pointer flex items-center gap-2"
              style={{ borderStyle: 'solid' }}
            >
              <Play size={16} fill="currentColor" className="text-indigo-400" />
              Explore Features
            </button>
          </motion.div>
        </div>

        {/* Dashboard Preview Mockup (Code-drawn High Fidelity UI) */}
        <div className="md:col-span-6 relative w-full h-[380px] lg:h-[450px]">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, rotate: 1 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full h-full bg-slate-900/50 rounded-2xl border border-slate-800/80 p-5 backdrop-blur-md shadow-[0_30px_60px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col"
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/60 mb-4 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="text-[11px] text-slate-500 font-mono ml-2">hr-recruiter-pro.net/dashboard</span>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
                Admin Panel
              </span>
            </div>

            {/* Layout Body */}
            <div className="flex-1 grid grid-cols-12 gap-4 overflow-hidden">
              {/* Sidebar Mock */}
              <div className="col-span-3 flex flex-col gap-2 border-r border-slate-800/40 pr-3">
                {['Overview', 'Employees', 'Interviews', 'Leaves', 'Settings'].map((item, idx) => (
                  <div 
                    key={item} 
                    className={`h-7 rounded-lg px-2 flex items-center gap-2 text-[11px] font-semibold transition-colors ${idx === 0 ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/20' : 'text-slate-500 hover:text-slate-350'}`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${idx === 0 ? 'bg-indigo-400' : 'bg-slate-700'}`} />
                    {item}
                  </div>
                ))}
              </div>

              {/* Main Content Mock */}
              <div className="col-span-9 flex flex-col gap-4 overflow-y-auto pr-1">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                    <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider block">Headcount</span>
                    <span className="text-base font-bold text-white block mt-0.5">142</span>
                    <span className="text-[9px] text-green-400 font-semibold mt-0.5 inline-block">↑ 12% MoM</span>
                  </div>
                  <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                    <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider block">Open Roles</span>
                    <span className="text-base font-bold text-white block mt-0.5">18</span>
                    <span className="text-[9px] text-indigo-400 font-semibold mt-0.5 inline-block">6 Active Pipelines</span>
                  </div>
                  <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                    <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider block">Leaves</span>
                    <span className="text-base font-bold text-white block mt-0.5">4 <span className="text-slate-500 text-xs font-normal">Pending</span></span>
                    <span className="text-[9px] text-yellow-500 font-semibold mt-0.5 inline-block">Action Required</span>
                  </div>
                </div>

                {/* Candidate Pipeline Tracker Mock */}
                <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/60 flex-1 flex flex-col min-h-[140px]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold text-white">Active Recruitment Pipeline</span>
                    <span className="text-[9px] text-slate-500">Updated just now</span>
                  </div>
                  <div className="flex-1 grid grid-cols-4 gap-2">
                    {[
                      { name: 'Applied', count: 12, color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
                      { name: 'Screening', count: 6, color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
                      { name: 'Interviews', count: 4, color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
                      { name: 'Offered', count: 2, color: 'bg-green-500/20 text-green-300 border-green-500/30' },
                    ].map(col => (
                      <div key={col.name} className={`rounded-lg p-2 border flex flex-col justify-between ${col.color}`}>
                        <span className="text-[9px] font-bold uppercase tracking-wider">{col.name}</span>
                        <span className="text-lg font-black mt-2">{col.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Latest Hires Mock */}
                <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-white">Pending Employee Accounts</span>
                    <span className="text-[9px] text-indigo-400 font-bold hover:underline cursor-pointer">Generate Credentials</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {[
                      { name: 'Sarah Connor', role: 'Software Engineer', email: 's.connor@gmail.com' },
                      { name: 'John Doe', role: 'HR Recruiter', email: 'john.doe@yahoo.com' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[10px] bg-slate-900/40 p-2 rounded-lg border border-slate-800/20">
                        <div>
                          <span className="font-semibold text-white block">{item.name}</span>
                          <span className="text-[9px] text-slate-500">{item.role}</span>
                        </div>
                        <span className="text-slate-400 font-mono text-[9px]">{item.email}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          {/* Orbiting element decorative */}
          <div className="absolute -bottom-4 -left-4 w-28 h-28 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-600/10 border border-slate-800/80 p-3 shadow-lg backdrop-blur-md hidden lg:flex flex-col justify-between">
            <span className="text-[10px] text-slate-500 font-bold">Attendance rate</span>
            <span className="text-2xl font-bold text-white tracking-tight">96.4%</span>
            <span className="text-[9px] text-green-400 font-bold">✓ Target Met</span>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-24 px-6 border-t border-slate-900 bg-slate-950/50 relative">
        <div className="max-w-7xl mx-auto text-center">
          {/* Header */}
          <div className="max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Comprehensive Suite of Recruitment &amp; HR Tools
            </h2>
            <p className="text-slate-400 text-base sm:text-lg">
              Manage every aspect of the employee and candidate lifecycle in a single unified SaaS platform.
            </p>
          </div>

          {/* Cards Grid */}
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              {
                icon: <Calendar className="text-indigo-400" size={24} />,
                title: 'Attendance Management',
                desc: 'Clock-in/out tracking with IP logs and attendance analytics, enabling smooth daily check-ins for onsite or remote staff.'
              },
              {
                icon: <FileText className="text-purple-400" size={24} />,
                title: 'Leave Approval Workflow',
                desc: 'Multi-level request tracking, automatic balance deductions, and immediate approval statuses for employees and HR.'
              },
              {
                icon: <Briefcase className="text-indigo-400" size={24} />,
                title: 'Candidate Recruitment',
                desc: 'Job publishing, application processing, customizable workflows, dynamic screening, and resume attachment parsing.'
              },
              {
                icon: <Users className="text-purple-400" size={24} />,
                title: 'Employee Management',
                desc: 'Centralized directory storing employee roles, departments, payroll profiles, skills arrays, and audit records.'
              },
              {
                icon: <BarChart3 className="text-indigo-400" size={24} />,
                title: 'Dashboard Analytics',
                desc: 'Visual metrics showing department headcounts, leave trends, interview timelines, and recruiting conversion data.'
              },
              {
                icon: <ShieldCheck className="text-purple-400" size={24} />,
                title: 'Secure RBAC Authentication',
                desc: 'Strict role-based access control safeguarding views and API endpoints for Candidates, Employees, HRs, and Admins.'
              }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                variants={fadeInUp}
                className="bg-slate-900/40 p-6 rounded-2xl border border-slate-850 hover:border-slate-700/80 transition-all duration-300 hover:-translate-y-1.5 text-left group flex flex-col justify-between min-h-[220px]"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="font-bold text-lg text-white mb-2 group-hover:text-indigo-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* PORTALS SECTION */}
      <section id="portals" className="py-24 px-6 border-t border-slate-900 bg-slate-950">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Designed for All Roles in Your Ecosystem
            </h2>
            <p className="text-slate-400 text-base sm:text-lg">
              Unlock distinct dashboards tailored specifically for organizational leaders, staff, and career applicants.
            </p>
          </div>

          {/* Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* HR / Admin */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-b from-purple-950/30 to-slate-950 rounded-2xl border border-purple-900/20 p-8 flex flex-col justify-between shadow-[0_15px_35px_rgba(0,0,0,0.2)]"
            >
              <div>
                <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20 uppercase tracking-wider inline-block mb-6">
                  Organization Control
                </span>
                <h3 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
                  <ShieldCheck className="text-purple-400" /> HR / Admin Portal
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Complete authority to configure, audit, and direct the company workflow. Manage payroll records, create staff logins, schedule interviews, and track operations.
                </p>
                <ul className="text-slate-400 text-xs leading-relaxed space-y-3 pl-0 mb-6">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-purple-400 flex-shrink-0" /> Onboard employees and generate logins
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-purple-400 flex-shrink-0" /> Manage job postings and track candidate resumes
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-purple-400 flex-shrink-0" /> Review and approve leave requests
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-purple-400 flex-shrink-0" /> View system-wide dashboard analytics
                  </li>
                </ul>
              </div>
              <Link 
                to="/login"
                className="mt-4 py-3 border border-purple-500/30 hover:border-purple-500 bg-purple-500/5 hover:bg-purple-500/15 transition-all text-purple-300 hover:text-white rounded-xl text-center font-bold text-sm no-underline flex items-center justify-center gap-2"
              >
                Access Admin Portal <ArrowRight size={14} />
              </Link>
            </motion.div>

            {/* Employee Portal */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="bg-gradient-to-b from-indigo-950/30 to-slate-950 rounded-2xl border border-indigo-900/20 p-8 flex flex-col justify-between shadow-[0_15px_35px_rgba(0,0,0,0.2)]"
            >
              <div>
                <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 uppercase tracking-wider inline-block mb-6">
                  Team Operations
                </span>
                <h3 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
                  <Users className="text-indigo-400" /> Employee Portal
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  A self-service hub allowing your workforce to log and verify attendance, request holidays, join virtual meetings, view payroll payslips, and self-manage.
                </p>
                <ul className="text-slate-400 text-xs leading-relaxed space-y-3 pl-0 mb-6">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-indigo-400 flex-shrink-0" /> Clock-in and record daily work hours
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-indigo-400 flex-shrink-0" /> Request leaves and check holiday balances
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-indigo-400 flex-shrink-0" /> View monthly payroll history
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-indigo-400 flex-shrink-0" /> Sync with reviews and scheduled meetings
                  </li>
                </ul>
              </div>
              <Link 
                to="/login"
                className="mt-4 py-3 border border-indigo-500/30 hover:border-indigo-500 bg-indigo-500/5 hover:bg-indigo-500/15 transition-all text-indigo-300 hover:text-white rounded-xl text-center font-bold text-sm no-underline flex items-center justify-center gap-2"
              >
                Access Employee Portal <ArrowRight size={14} />
              </Link>
            </motion.div>

            {/* Candidate Portal */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-gradient-to-b from-blue-950/30 to-slate-950 rounded-2xl border border-blue-900/20 p-8 flex flex-col justify-between shadow-[0_15px_35px_rgba(0,0,0,0.2)]"
            >
              <div>
                <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 uppercase tracking-wider inline-block mb-6">
                  Talent Acquisition
                </span>
                <h3 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
                  <Briefcase className="text-blue-400" /> Candidate Portal
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Public interface for career seekers to view job openings, sign up, submit applications, check evaluation stages, and directly interface with hiring teams.
                </p>
                <ul className="text-slate-400 text-xs leading-relaxed space-y-3 pl-0 mb-6">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-blue-400 flex-shrink-0" /> Register candidate profiles and upload CVs
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-blue-400 flex-shrink-0" /> Browse active openings and apply instantly
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-blue-400 flex-shrink-0" /> Monitor real-time status of applications
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-blue-400 flex-shrink-0" /> Attend video interviews with panel leads
                  </li>
                </ul>
              </div>
              <Link 
                to="/register"
                className="mt-4 py-3 border border-blue-500/30 hover:border-blue-500 bg-blue-500/5 hover:bg-blue-500/15 transition-all text-blue-300 hover:text-white rounded-xl text-center font-bold text-sm no-underline flex items-center justify-center gap-2"
              >
                Sign Up as Candidate <ArrowRight size={14} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* RBAC WORKFLOW SECTION */}
      <section className="py-24 px-6 border-t border-slate-900 bg-slate-950/50">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Secure Role-Based Provisioning Lifecycle
            </h2>
            <p className="text-slate-400 text-base sm:text-lg">
              Understand our security boundary: candidates register freely, but employee onboarding requires HR authentication.
            </p>
          </div>

          {/* Workflow Stepper */}
          <div className="relative">
            {/* Horizontal Line connector (Desktop) */}
            <div className="hidden lg:block absolute top-1/2 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-blue-500/30 via-indigo-500/30 to-purple-500/30 -translate-y-1/2 z-0" />

            <div className="grid lg:grid-cols-4 gap-8 relative z-10">
              {[
                {
                  step: '01',
                  title: 'Candidate Signup',
                  desc: 'Hiring prospects create accounts via the public portal, upload CV credentials, and request open roles.',
                  color: 'from-blue-650 to-blue-500'
                },
                {
                  step: '02',
                  title: 'HR Evaluation & Screening',
                  desc: 'Hiring managers filter candidates, execute screening calls, record notes, and advance candidates in the pipeline.',
                  color: 'from-indigo-650 to-indigo-500'
                },
                {
                  step: '03',
                  title: 'Credential Generation',
                  desc: 'Upon selection, HR generates official employee logins inside the admin panel. Candidates cannot self-onboard.',
                  color: 'from-purple-650 to-purple-500'
                },
                {
                  step: '04',
                  title: 'Authorized Access',
                  desc: 'The hired candidate logs into the Employee Portal, unlocking geofenced attendance logs and internal metrics.',
                  color: 'from-pink-650 to-pink-500'
                }
              ].map((step, idx) => (
                <div key={idx} className="bg-slate-900/30 border border-slate-850 p-6 rounded-2xl backdrop-blur-md flex flex-col justify-between min-h-[220px]">
                  <div className="flex items-center justify-between mb-4">
                    <span 
                      className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400"
                    >
                      {step.step}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-xs text-indigo-400 font-bold">
                      {idx + 1}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-white mb-2">{step.title}</h4>
                    <p className="text-slate-400 text-xs leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alert Security Notice */}
          <div 
            className="mt-12 p-5 rounded-2xl border border-indigo-900/40 bg-indigo-950/20 max-w-3xl mx-auto flex items-start gap-4"
          >
            <Lock className="text-indigo-400 flex-shrink-0 mt-0.5 animate-pulse" size={20} />
            <div>
              <h4 className="text-sm font-bold text-white mb-1">Strict Isolation Security (RBAC)</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                By default, candidate accounts are isolated from internal team tables. Account credentials for staff must be provisioned and authorized by a logged-in HR Representative or System Administrator. This protocol secures employee records, payroll, and geofenced logs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* DASHBOARD PREVIEW SCREENSHOTS SECTION */}
      <section className="py-24 px-6 border-t border-slate-900 bg-slate-950">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Visual Platform Tour
            </h2>
            <p className="text-slate-400 text-base sm:text-lg">
              Explore actual interface modules built for efficiency and visual ease.
            </p>
          </div>

          {/* Screenshot Cards Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: 'Organization Analytics Hub',
                category: 'Admin Dashboard',
                component: (
                  <div className="flex flex-col h-full justify-between">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[11px] font-bold text-slate-350">Company Performance Metrics</span>
                      <span className="text-[10px] text-green-400 font-semibold flex items-center gap-1">Live <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping inline-block" /></span>
                    </div>
                    {/* Visual Charts simulation */}
                    <div className="flex-1 grid grid-cols-12 gap-3 items-end h-[100px] mb-3">
                      {[30, 45, 60, 35, 70, 85, 60, 95, 80, 110, 90, 120].map((val, idx) => (
                        <div key={idx} className="col-span-1 bg-gradient-to-t from-indigo-650 to-indigo-400 rounded-sm hover:from-purple-500 hover:to-purple-400 transition-all duration-200 cursor-pointer" style={{ height: `${(val / 120) * 100}%` }} title={`Month ${idx + 1}: ${val}`} />
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-[10px] border-t border-slate-800/40 pt-2.5">
                      <div className="flex gap-4">
                        <span className="text-slate-500">🔵 Hiring: <strong className="text-white">Active</strong></span>
                        <span className="text-slate-500">🟣 Resignations: <strong className="text-white">1.2%</strong></span>
                      </div>
                      <span className="text-slate-400 font-bold">120 New Hires Year-To-Date</span>
                    </div>
                  </div>
                )
              },
              {
                title: 'Attendance Tracker Calendar',
                category: 'Attendance Management',
                component: (
                  <div className="flex flex-col h-full justify-between">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[11px] font-bold text-slate-350">Weekly Team Attendance Status</span>
                      <span className="text-[9px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded-full">May 2026</span>
                    </div>
                    <div className="grid grid-cols-7 gap-1.5 my-2">
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                        <div key={idx} className="text-center text-[10px] font-bold text-slate-500">{day}</div>
                      ))}
                      {[
                        { day: 18, s: 'present' }, { day: 19, s: 'present' }, { day: 20, s: 'present' }, 
                        { day: 21, s: 'leave' }, { day: 22, s: 'present' }, { day: 23, s: 'weekend' }, { day: 24, s: 'weekend' }
                      ].map(item => (
                        <div key={item.day} className={`rounded-lg p-1.5 border text-center flex flex-col items-center justify-center gap-1 ${item.s === 'present' ? 'bg-green-500/10 border-green-500/20 text-green-300' : item.s === 'leave' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-300' : 'bg-slate-900/40 border-slate-800/40 text-slate-600'}`}>
                          <span className="text-[10px] font-bold block">{item.day}</span>
                          <span className={`w-1.5 h-1.5 rounded-full ${item.s === 'present' ? 'bg-green-400' : item.s === 'leave' ? 'bg-yellow-400' : 'bg-slate-700'}`} />
                        </div>
                      ))}
                    </div>
                    <div className="text-[9px] text-slate-500 flex justify-between items-center border-t border-slate-800/40 pt-2">
                      <span>🟢 Present: 4 days</span>
                      <span>🟡 Leave: 1 day</span>
                      <span>⚫ Weekend: 2 days</span>
                    </div>
                  </div>
                )
              },
              {
                title: 'Flexible Leave Manager',
                category: 'Leave Management',
                component: (
                  <div className="flex flex-col h-full justify-between">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[11px] font-bold text-slate-350">Leave Allowance Balance</span>
                      <span className="text-[10px] text-slate-400 font-mono">24 Total Days Granted</span>
                    </div>
                    <div className="space-y-2.5 my-1">
                      {[
                        { label: 'Paid Annual Leave', left: 14, total: 18, color: 'bg-indigo-500' },
                        { label: 'Medical Leave', left: 4, total: 6, color: 'bg-emerald-500' }
                      ].map(item => (
                        <div key={item.label}>
                          <div className="flex justify-between text-[10px] mb-1 font-semibold text-slate-400">
                            <span>{item.label}</span>
                            <span className="text-white">{item.left} / {item.total} Days Left</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/40">
                            <div className={`h-full ${item.color}`} style={{ width: `${(item.left / item.total) * 100}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="text-[10px] text-slate-500 text-right mt-2 font-semibold">
                      1 Request Pending Approval
                    </div>
                  </div>
                )
              },
              {
                title: 'Dynamic Kanban Pipeline',
                category: 'Candidate Management',
                component: (
                  <div className="flex flex-col h-full justify-between">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[11px] font-bold text-slate-350">Candidate Stages</span>
                      <span className="text-[10px] text-indigo-400 font-bold hover:underline cursor-pointer">Open Pipelines</span>
                    </div>
                    <div className="flex-1 flex gap-2 overflow-hidden py-1">
                      {[
                        { name: 'Review', count: 12, item: 'Alex Mercer' },
                        { name: 'Interview', count: 4, item: 'Diana Prince' },
                        { name: 'Offer', count: 2, item: 'Tony Stark' }
                      ].map(stage => (
                        <div key={stage.name} className="flex-1 bg-slate-950/50 rounded-lg p-2 border border-slate-850 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-center border-b border-slate-800/50 pb-1 mb-1.5">
                              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">{stage.name}</span>
                              <span className="text-[8px] bg-slate-900 text-slate-300 px-1 py-0.5 rounded-full">{stage.count}</span>
                            </div>
                            <div className="text-[9px] bg-slate-900/45 p-1 rounded border border-slate-800/20 text-white font-medium truncate mb-1">
                              {stage.item}
                            </div>
                          </div>
                          <span className="text-[7px] text-slate-500 font-mono">Updated today</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              }
            ].map((shot, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="bg-slate-900/30 rounded-2xl border border-slate-850 p-6 flex flex-col gap-5 hover:border-slate-700/80 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.15)] group"
              >
                {/* Visual content mockup container */}
                <div className="bg-slate-950 rounded-xl border border-slate-850 p-4 min-h-[160px] flex flex-col justify-between shadow-inner group-hover:border-slate-800 transition-colors">
                  {shot.component}
                </div>
                {/* Information text */}
                <div className="text-left">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1 block">
                    {shot.category}
                  </span>
                  <h4 className="font-bold text-lg text-white mb-1 group-hover:text-indigo-300 transition-colors">
                    {shot.title}
                  </h4>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="py-24 px-6 border-t border-slate-900 bg-slate-950/50">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Flexible, Transparent SaaS Pricing
            </h2>
            <p className="text-slate-400 text-base sm:text-lg">
              Find the right subscription level to optimize your recruiting and employee infrastructure.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
            {/* Starter */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-slate-900/40 rounded-2xl border border-slate-850 p-8 flex flex-col justify-between text-left"
            >
              <div>
                <h4 className="font-bold text-lg text-white mb-2">Starter Plan</h4>
                <p className="text-slate-400 text-xs mb-6">Best for small organizations or early stage startups.</p>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl font-black text-white">$49</span>
                  <span className="text-slate-500 text-sm font-semibold">/ month</span>
                </div>
                <hr className="border-slate-850 mb-6" />
                <ul className="text-slate-400 text-xs leading-relaxed space-y-4 pl-0 mb-8">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-indigo-400" /> Up to 15 Employee accounts
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-indigo-400" /> Candidate recruitment portal
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-indigo-400" /> Basic attendance &amp; check-ins
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-indigo-400" /> Single approval leave workflow
                  </li>
                </ul>
              </div>
              <button 
                onClick={() => scrollToSection('contact')}
                className="w-full py-3 bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-900/60 transition-all text-slate-300 hover:text-white rounded-xl font-bold text-sm cursor-pointer"
              >
                Choose Starter
              </button>
            </motion.div>

            {/* Professional */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-slate-900 border-2 border-indigo-500 rounded-2xl p-8 flex flex-col justify-between text-left relative shadow-[0_15px_40px_rgba(99,102,241,0.2)]"
            >
              <div className="absolute top-0 right-6 -translate-y-1/2 bg-indigo-500 text-white font-bold text-[10px] px-3.5 py-1 rounded-full uppercase tracking-wider shadow-lg">
                Most Popular
              </div>
              <div>
                <h4 className="font-bold text-lg text-white mb-2">Professional Plan</h4>
                <p className="text-indigo-300 text-xs mb-6">Designed for expanding businesses with complete management needs.</p>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-5xl font-black text-white">$99</span>
                  <span className="text-slate-500 text-sm font-semibold">/ month</span>
                </div>
                <hr className="border-indigo-500/25 mb-6" />
                <ul className="text-slate-350 text-xs leading-relaxed space-y-4 pl-0 mb-8">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-indigo-400" /> Up to 100 Employee accounts
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-indigo-400" /> Multi-department structure
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-indigo-400" /> Advanced geofenced attendance
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-indigo-400" /> Multi-tier holiday approval flow
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-indigo-400" /> Full analytics &amp; export reporting
                  </li>
                </ul>
              </div>
              <button 
                onClick={() => scrollToSection('contact')}
                className="w-full py-3 btn-primary border-none text-white rounded-xl font-bold text-sm shadow-[0_4px_14px_rgba(99,102,241,0.3)] cursor-pointer"
              >
                Choose Professional
              </button>
            </motion.div>

            {/* Enterprise */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-slate-900/40 rounded-2xl border border-slate-850 p-8 flex flex-col justify-between text-left"
            >
              <div>
                <h4 className="font-bold text-lg text-white mb-2">Enterprise Plan</h4>
                <p className="text-slate-400 text-xs mb-6">For large multi-national scale needing custom frameworks.</p>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl font-black text-white">Custom</span>
                  <span className="text-slate-500 text-sm font-semibold"> pricing</span>
                </div>
                <hr className="border-slate-850 mb-6" />
                <ul className="text-slate-400 text-xs leading-relaxed space-y-4 pl-0 mb-8">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-indigo-400" /> Unlimited Employees &amp; candidates
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-indigo-400" /> Dedicated database partition
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-indigo-400" /> SSO / Active Directory SAML sync
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-indigo-400" /> Dedicated account manager &amp; SLAs
                  </li>
                </ul>
              </div>
              <button 
                onClick={() => scrollToSection('contact')}
                className="w-full py-3 bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-900/60 transition-all text-slate-300 hover:text-white rounded-xl font-bold text-sm cursor-pointer"
              >
                Contact Sales
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* DEMO REQUEST FORM */}
      <section id="contact" className="py-24 px-6 border-t border-slate-900 bg-slate-950">
        <div className="max-w-7xl mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Schedule a Live Demonstration
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Fill out the form below to speak with an HR specialist and discover how we can transform your workflow.
            </p>
          </div>

          {/* Form Card */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-slate-900/40 border border-slate-850 rounded-3xl p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-md"
          >
            <form onSubmit={handleDemoSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="flex flex-col text-left gap-1.5">
                  <label htmlFor="name" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Full Name *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500">
                      <User size={16} />
                    </span>
                    <input 
                      type="text" 
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Jane Doe"
                      className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500 focus:bg-slate-950 transition-all text-sm font-medium"
                      style={{ boxSizing: 'border-box' }}
                    />
                  </div>
                  {formErrors.name && <span className="text-[11px] text-red-400 font-semibold">{formErrors.name}</span>}
                </div>

                {/* Company Name */}
                <div className="flex flex-col text-left gap-1.5">
                  <label htmlFor="companyName" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Company Name *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500">
                      <Building size={16} />
                    </span>
                    <input 
                      type="text" 
                      id="companyName"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      placeholder="Acme Corp"
                      className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500 focus:bg-slate-950 transition-all text-sm font-medium"
                      style={{ boxSizing: 'border-box' }}
                    />
                  </div>
                  {formErrors.companyName && <span className="text-[11px] text-red-400 font-semibold">{formErrors.companyName}</span>}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Email */}
                <div className="flex flex-col text-left gap-1.5">
                  <label htmlFor="email" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Email Address *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500">
                      <Mail size={16} />
                    </span>
                    <input 
                      type="email" 
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="jane@company.com"
                      className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500 focus:bg-slate-950 transition-all text-sm font-medium"
                      style={{ boxSizing: 'border-box' }}
                    />
                  </div>
                  {formErrors.email && <span className="text-[11px] text-red-400 font-semibold">{formErrors.email}</span>}
                </div>

                {/* Phone */}
                <div className="flex flex-col text-left gap-1.5">
                  <label htmlFor="phone" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500">
                      <Phone size={16} />
                    </span>
                    <input 
                      type="tel" 
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 123-4567"
                      className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500 focus:bg-slate-950 transition-all text-sm font-medium"
                      style={{ boxSizing: 'border-box' }}
                    />
                  </div>
                  {formErrors.phone && <span className="text-[11px] text-red-400 font-semibold">{formErrors.phone}</span>}
                </div>
              </div>

              <div className="flex flex-col text-left gap-1.5">
                <label htmlFor="planType" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Interested Plan
                </label>
                <select 
                  id="planType"
                  name="planType"
                  value={formData.planType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500 focus:bg-slate-950 transition-all text-sm font-medium"
                >
                  <option value="Starter">Starter Plan</option>
                  <option value="Professional">Professional Plan</option>
                  <option value="Enterprise">Enterprise Plan</option>
                </select>
              </div>

              {/* Message */}
              <div className="flex flex-col text-left gap-1.5">
                <label htmlFor="message" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Tell us about your team (Optional)
                </label>
                <div className="relative">
                  <span className="absolute top-3 left-4 text-slate-500">
                    <MessageSquare size={16} />
                  </span>
                  <textarea 
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="We have a team of 40 looking to optimize leave tracking..."
                    className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500 focus:bg-slate-950 transition-all text-sm font-medium resize-none"
                    style={{ boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Submit button */}
              <button 
                type="submit" 
                disabled={formSubmitting}
                className="w-full btn-primary py-3 px-6 rounded-xl font-bold text-sm tracking-wide border-none cursor-pointer flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(99,102,241,0.25)]"
              >
                {formSubmitting ? (
                  <>
                    <span className="spinner" style={{ width: 16, height: 16 }}></span>
                    Scheduling Demo...
                  </>
                ) : (
                  <>
                    Request Free Demo <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 border-t border-slate-900 pt-16 pb-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
          {/* Logo and Tagline */}
          <div className="md:col-span-4 flex flex-col items-start text-left gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-base shadow-[0_2px_8px_rgba(99,102,241,0.4)]">
                HR
              </div>
              <span className="font-bold text-lg text-white">HR Recruiter Pro</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              The professional all-in-one HR Management and Recruitment solution. Built to automate staffing, workflows, leaves, and attendance geofencing.
            </p>
            <div className="flex gap-4 mt-2">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="text-slate-500 hover:text-white transition-colors">
                <Globe size={18} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-slate-500 hover:text-white transition-colors">
                <ExternalLink size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 flex flex-col items-start text-left gap-4">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Product</h5>
            <div className="flex flex-col gap-2.5">
              {['features', 'portals', 'pricing'].map(item => (
                <button 
                  key={item}
                  onClick={() => scrollToSection(item)}
                  className="text-slate-400 hover:text-white transition-colors text-xs font-medium bg-transparent border-none cursor-pointer p-0 text-left capitalize"
                >
                  {item}
                </button>
              ))}
              <Link to="/careers" className="text-slate-400 hover:text-white transition-colors text-xs font-medium no-underline">
                Public Jobs Board
              </Link>
            </div>
          </div>

          {/* Portals Links */}
          <div className="md:col-span-3 flex flex-col items-start text-left gap-4">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Portals Access</h5>
            <div className="flex flex-col gap-2.5">
              <Link to="/login" className="text-slate-400 hover:text-white transition-colors text-xs font-medium no-underline">
                HR / Admin login
              </Link>
              <Link to="/login" className="text-slate-400 hover:text-white transition-colors text-xs font-medium no-underline">
                Employee login
              </Link>
              <Link to="/register" className="text-slate-400 hover:text-white transition-colors text-xs font-medium no-underline">
                Candidate signup
              </Link>
            </div>
          </div>

          {/* Contact Details */}
          <div className="md:col-span-2 flex flex-col items-start text-left gap-4">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Contact Us</h5>
            <div className="flex flex-col gap-2 text-slate-400 text-xs">
              <span className="flex items-center gap-2">
                <Mail size={12} className="text-indigo-400" /> sales@hrpro.net
              </span>
              <span className="flex items-center gap-2">
                <Phone size={12} className="text-indigo-400" /> +1 (800) 555-0199
              </span>
              <span className="mt-2 text-[10px] text-slate-500 leading-normal">
                100 Pine Street, Suite 1200<br />
                San Francisco, CA 94111
              </span>
            </div>
          </div>
        </div>

        <hr className="border-slate-900 my-8" />

        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[10px] font-semibold uppercase tracking-wider gap-4">
          <span>&copy; {new Date().getFullYear()} HR Recruiter Pro. All rights reserved.</span>
          <div className="flex gap-6">
            <a href="#privacy" className="hover:text-white transition-colors no-underline">Privacy Policy</a>
            <a href="#terms" className="hover:text-white transition-colors no-underline">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
