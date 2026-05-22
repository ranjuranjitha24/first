import { useEffect, useState } from 'react'
import { getStats, getEmployees, getUpcomingInterviews, getLeaves, getCurrentUser, getUpcomingMeetings } from '../services/api'
import { useNavigate, useLocation } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, CartesianGrid } from 'recharts'
import { motion } from 'framer-motion'
import { PageWrapper } from '../components/ui/PageWrapper'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { SkeletonGrid } from '../components/ui/SkeletonLoader'
import { Users, Calendar, Clock, Inbox, CheckCircle2 } from 'lucide-react'

const COLORS = ['#6366f1','#2563eb','#059669','#d97706','#dc2626','#0891b2','#be185d','#64748b']
const getColor = n => { let h=0; for(let c of (n||'')) h+=c.charCodeAt(0); return COLORS[h%COLORS.length] }
const getInit  = n => (n||'?').split(' ').map(p=>p[0]).join('').substring(0,2).toUpperCase()

function useCountUp(end, duration = 1500) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTime = null;
    let animationFrame;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeProgress * end));
      if (progress < 1) animationFrame = requestAnimationFrame(step);
    };
    animationFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);
  return count;
}

function StatCard({ icon, value, label, colorClass, trend }) {
  const animatedValue = useCountUp(value || 0);
  return (
    <Card hoverEffect className={`stat-card ${colorClass}`}>
      <div className="stat-card-glow"></div>
      <div className="stat-content">
        <div className="stat-icon-wrapper">
          <div className="stat-icon">{icon}</div>
        </div>
        <div className="stat-info">
          <div className="stat-label">{label}</div>
          <div className="stat-value">{animatedValue}</div>
          {trend && (
            <div className={`stat-trend ${trend.positive ? 'up' : 'down'}`}>
              {trend.positive ? '↑' : '↓'} {trend.value}% <span>vs last month</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

function RoleChart({ data }) {
  if (!data || !data.length) return <EmptyState icon={Users} title="No roles yet" description="Add employees to see the distribution" />
  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
          <XAxis type="number" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis dataKey="label" type="category" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} width={80} />
          <Tooltip cursor={{fill: 'var(--primary-glow)'}} contentStyle={{borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text)', boxShadow: 'var(--shadow-lg)'}} />
          <Bar dataKey="value" fill="var(--primary)" radius={[0, 4, 4, 0]} animationDuration={1500} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function DonutChart({ data }) {
  const CHART_COLORS = ['#3b82f6','#10b981','#ef4444']
  const total = data.reduce((s,d)=>s+(d.value || 0),0) || 1
  return (
    <div style={{ width: 180, height: 180, position: 'relative' }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none" animationDuration={1500}>
            {data.map((entry, index) => <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
          </Pie>
          <Tooltip contentStyle={{borderRadius: '12px', border: 'none', background: 'var(--bg-card)', color: 'var(--text)', boxShadow: 'var(--shadow-lg)', fontWeight: 600}} itemStyle={{color: 'var(--text)'}} />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>{total}</span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Total</span>
      </div>
    </div>
  )
}

function HiringTrendChart() {
  const mockData = [
    { month: 'Jan', hired: 4, applications: 24 },
    { month: 'Feb', hired: 7, applications: 45 },
    { month: 'Mar', hired: 5, applications: 30 },
    { month: 'Apr', hired: 12, applications: 68 },
    { month: 'May', hired: 8, applications: 51 },
    { month: 'Jun', hired: 15, applications: 89 },
  ];
  return (
    <Card hoverEffect style={{ gridColumn: '1 / -1', marginBottom: 24 }}>
      <div className="card-header">
        <div>
          <h3>Hiring & Application Trends</h3>
          <p>Monthly growth over the past 6 months</p>
        </div>
      </div>
      <div style={{ padding: '20px 24px', height: 320, width: '100%' }}>
        <ResponsiveContainer>
          <AreaChart data={mockData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary-light)" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="var(--primary-light)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorHired" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--success)" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="var(--success)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text)', boxShadow: 'var(--shadow-lg)'}} />
            <Area type="monotone" dataKey="applications" name="Applications" stroke="var(--primary-light)" strokeWidth={3} fillOpacity={1} fill="url(#colorApps)" animationDuration={1500} />
            <Area type="monotone" dataKey="hired" name="Hired" stroke="var(--success)" strokeWidth={3} fillOpacity={1} fill="url(#colorHired)" animationDuration={1500} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

export default function Dashboard() {
  const [stats, setStats]           = useState({totalEmployees:0,scheduled:0,completed:0,cancelled:0})
  const [recentEmps, setRecent]     = useState([])
  const [upcomingInts, setUpcoming] = useState([])
  const [upcomingMeets, setMeets]   = useState([])
  const [pendingLeaves, setPending] = useState(0)
  const [empByRole, setEmpByRole]   = useState([])
  const [loading, setLoading]       = useState(true)
  const navigate = useNavigate()
  const location = useLocation()
  
  const showWelcomeTrial = location.state?.showWelcomeTrial
  let trialDaysLeft = null;
  const trialEndStr = location.state?.trialEndDate || getCurrentUser()?.trialEndDate;
  if (trialEndStr) {
    trialDaysLeft = Math.ceil((new Date(trialEndStr) - new Date()) / (1000 * 60 * 60 * 24));
  }

  const user = getCurrentUser() || {}
  const isHR        = user.role === 'admin' || user.role === 'hr'
  const isCandidate = user.role === 'candidate'
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      try {
        const [statsRes, upcomingRes, leavesRes, meetsRes] = await Promise.all([
          isHR ? getStats().catch(()=>({data:{data:{totalEmployees:0,scheduled:0,completed:0,cancelled:0}}})) : Promise.resolve({data:{data:{totalEmployees:0,scheduled:0,completed:0,cancelled:0}}}),
          isCandidate ? Promise.resolve({data:{data:[]}}) : getUpcomingInterviews().catch(()=>({data:{data:[]}})),
          isCandidate ? Promise.resolve({data:{data:[]}}) : getLeaves(isHR ? { status: 'Pending' } : {}).catch(()=>({data:{data:[]}})),
          (isHR || isCandidate) ? Promise.resolve({data:{data:[]}}) : getUpcomingMeetings().catch(()=>({data:{data:[]}}))
        ])
        
        setStats(statsRes.data.data)
        setUpcoming(upcomingRes.data.data)
        setMeets(meetsRes.data.data || [])
        
        const leaves = leavesRes.data.data
        setPending(isHR ? leaves.length : (leaves.filter ? leaves.filter(l => l.status === 'Pending').length : 0))

        if (isHR) {
          const empsRes = await getEmployees().catch(()=>({data:{data:[]}}))
          const emps = empsRes.data.data || []
          setRecent(emps.slice(0, 5))
          const roleCount = {}
          emps.forEach(emp => { roleCount[emp.role] = (roleCount[emp.role] || 0) + 1 })
          setEmpByRole(Object.entries(roleCount).map(([label, value]) => ({ label, value })))
        }
      } catch (e) { 
        console.error('Dashboard Fetch Error:', e) 
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [isHR])

  if (loading) return (
    <PageWrapper>
      <div className="page-header">
        <h1 className="page-title">Loading...</h1>
      </div>
      <SkeletonGrid count={4} />
      <div style={{ marginTop: 24 }}>
        <SkeletonGrid count={2} />
      </div>
    </PageWrapper>
  )

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }
  const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  }

  if (!isHR) {
    // ── EMPLOYEE PORTAL VIEW ──
    return (
      <PageWrapper>
        <div className="page-header">
          <div>
            <h1 className="page-title">Employee Portal</h1>
            <p className="page-sub">Welcome back, {user.username || 'Employee'} 👋</p>
          </div>
          <div className="header-actions">
            <button className="btn-primary" onClick={()=>navigate('/leaves')}>🌴 Request Leave</button>
            <button className="btn-secondary" onClick={()=>navigate('/attendance')}>⏰ Clock In</button>
          </div>
        </div>

        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="stats-grid">
          <motion.div variants={staggerItem}><StatCard icon="📅" value={upcomingMeets.length} label="My Meetings" colorClass="primary" /></motion.div>
          <motion.div variants={staggerItem}><StatCard icon="🌴" value={pendingLeaves}      label="Pending Leaves" colorClass="warning" /></motion.div>
          <motion.div variants={staggerItem}><StatCard icon="⭐" value={4.8}                label="Performance Score" colorClass="success" /></motion.div>
          <motion.div variants={staggerItem}><StatCard icon="🏆" value={12}                label="Tasks Completed" colorClass="info" /></motion.div>
        </motion.div>

        <div className="dashboard-grid" style={{ marginTop: 24 }}>
          <Card hoverEffect style={{ gridColumn: 'span 2' }}>
            <div className="card-header">
              <h3>Company Announcements</h3>
            </div>
            <div className="recent-list" style={{ padding: '12px 0' }}>
              {[
                { id: 1, title: '🚀 Annual Town Hall 2024', date: 'May 15, 10:00 AM', desc: 'Join us for our annual company updates and future roadmap.' },
                { id: 2, title: '🏥 New Health Insurance Policy', date: 'May 12, 2:00 PM', desc: 'Check the new benefits included in our group medical cover.' },
                { id: 3, title: '🍕 Monthly Pizza Friday!', date: 'May 10, 1:00 PM', desc: 'Complimentary lunch for all employees in the cafeteria.' }
              ].map(ann => (
                <div key={ann.id} className="recent-item" style={{ marginBottom: 8 }}>
                  <div className="avatar" style={{ background: 'var(--primary-glow)', color: 'var(--primary)' }}>✨</div>
                  <div className="recent-info">
                    <div className="recent-name">{ann.title}</div>
                    <div className="recent-sub">{ann.date} · {ann.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card hoverEffect>
            <div className="card-header">
              <h3>Upcoming Meetings</h3>
              <button className="link-btn" onClick={()=>navigate('/meetings')}>View All</button>
            </div>
            <div className="recent-list">
              {upcomingMeets.length === 0 
                ? <EmptyState icon={Calendar} title="No meetings today" description="Take a break or focus on deep work." />
                : upcomingMeets.map(m => (
                  <div key={m._id} className="recent-item">
                    <div className="avatar" style={{background:'var(--primary-glow)', color:'var(--primary)'}}>🤝</div>
                    <div className="recent-info" style={{flex:1}}>
                      <div className="recent-name">{m.title}</div>
                      <div className="recent-sub">{m.date} · {m.time}</div>
                    </div>
                    {m.meeting_link && !m.meeting_link.endsWith('/new') && <a href={m.meeting_link} target="_blank" rel="noreferrer" className="btn-join-meet" style={{padding:'4px 8px', fontSize:11}}>Join</a>}
                  </div>
                ))
              }
            </div>
          </Card>
        </div>

        <div className="stats-grid" style={{ marginTop: 24 }}>
          <Card hoverEffect className="glass" style={{ gridColumn: 'span 3', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className="stat-icon-wrapper" style={{ background: 'var(--primary-glow)', fontSize: 24, color: 'var(--primary)' }}><Inbox /></div>
              <div>
                <h4 style={{ margin: 0, fontSize: 16 }}>Pending Notifications</h4>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>You have several unread alerts in your inbox.</p>
              </div>
            </div>
            <button className="btn-primary" onClick={() => navigate('/notifications')}>Open Notifications</button>
          </Card>
        </div>

        <Card hoverEffect style={{ marginTop: 24 }}>
          <div className="card-header">
            <h3>Recent Activity</h3>
          </div>
          <div className="activity-feed">
             {upcomingMeets.length === 0 ? (
               <div className="activity-item">
                 <div className="activity-icon blue"><CheckCircle2 size={16} /></div>
                 <div className="activity-content">
                   <div className="activity-title">All caught up!</div>
                   <div className="activity-desc">No recent activity to show for today.</div>
                 </div>
               </div>
             ) : upcomingMeets.slice(0, 3).map(m => (
              <div key={m._id} className="activity-item">
                <div className={`activity-icon blue`}><Clock size={16} /></div>
                <div className="activity-content">
                  <div className="activity-title">Meeting Scheduled <span className={`activity-badge blue`}>MEETING</span></div>
                  <div className="activity-desc">"{m.title}" is scheduled for {m.date} at {m.time}.</div>
                  <div className="activity-time">{m.time}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </PageWrapper>
    )
  }

  // ── ADMIN / HR DASHBOARD VIEW ──
  const donutData = [
    {label:'Scheduled', value:stats.scheduled || 0},
    {label:'Completed', value:stats.completed || 0},
    {label:'Cancelled', value:stats.cancelled || 0},
  ]

  return (
    <PageWrapper>
      {showWelcomeTrial && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{
          background: 'linear-gradient(90deg, #4f46e5 0%, #7c3aed 100%)',
          color: 'white',
          padding: '16px 24px',
          borderRadius: 16,
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 8px 32px rgba(99, 102, 241, 0.4)'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Welcome to HR Recruiter Pro! 🎉</h2>
            <p style={{ margin: 0, fontSize: 14, opacity: 0.9, marginTop: 4 }}>
              Your account is fully secured and ready. You have {trialDaysLeft} days remaining in your premium trial.
            </p>
          </div>
        </motion.div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-sub">Welcome back, {user.username || 'HR Manager'} 👋</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary"   onClick={()=>navigate('/employees')}>+ Add Employee</button>
          <button className="btn-secondary" onClick={()=>navigate('/interviews')}>Schedule Interview</button>
        </div>
      </div>

      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="stats-grid">
        <motion.div variants={staggerItem}><StatCard icon="👥" value={stats.totalEmployees} label="Total Employees" colorClass="primary" trend={{value: 8, positive: true}}/></motion.div>
        <motion.div variants={staggerItem}><StatCard icon="📅" value={stats.scheduled}      label="Interviews Scheduled" colorClass="success" trend={{value: 12, positive: true}}/></motion.div>
        <motion.div variants={staggerItem}><StatCard icon="⏰" value={upcomingInts.length}  label="Upcoming Interviews"  colorClass="warning" trend={{value: 5, positive: false}}/></motion.div>
        <motion.div variants={staggerItem}><StatCard icon="🌴" value={pendingLeaves}         label="Pending Leaves"       colorClass="danger"/></motion.div>
      </motion.div>

      <HiringTrendChart />
      
      <div className="dashboard-grid" style={{marginBottom:24}}>
        <Card hoverEffect>
          <div className="card-header"><h3>Employees by Role</h3></div>
          <div style={{padding:'20px 24px'}}>
            <RoleChart data={empByRole}/>
          </div>
        </Card>
        <Card hoverEffect>
          <div className="card-header"><h3>Interview Status</h3></div>
          <div style={{padding:'16px 24px',display:'flex',alignItems:'center',gap:28}}>
            <DonutChart data={donutData}/>
            <div style={{display:'flex',flexDirection:'column',gap:14,flex:1}}>
              {[['#6366f1','Scheduled',stats.scheduled],['#10b981','Completed',stats.completed],['#ef4444','Cancelled',stats.cancelled]].map(([c,l,v])=>(
                <div key={l}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                    <span style={{fontSize:13,color:'var(--text-muted)'}}>{l}</span>
                    <strong style={{fontSize:13,color:'var(--text)'}}>{v || 0}</strong>
                  </div>
                  <div style={{height:6,background:'var(--border)',borderRadius:99}}>
                    <div style={{height:'100%',borderRadius:99,background:c,width:`${(((v || 0)/(stats.scheduled+stats.completed+stats.cancelled||1))*100)}%`,transition:'width 0.6s'}}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="dashboard-grid">
        <Card hoverEffect>
          <div className="card-header"><h3>Recent Employees</h3><button className="link-btn" onClick={()=>navigate('/employees')}>View All →</button></div>
          <div className="recent-list">
            {recentEmps.length===0
              ? <EmptyState icon={Users} title="No employees yet" description="Start building your team." />
              : recentEmps.map(e=>(
                <div key={e._id} className="recent-item">
                  <div className="avatar" style={{background:getColor(e.name)}}>{getInit(e.name)}</div>
                  <div className="recent-info"><div className="recent-name">{e.name}</div><div className="recent-sub">{e.role} · {e.experience}</div></div>
                  <span className="role-badge">{e.role.split(' ')[0]}</span>
                </div>
              ))
            }
          </div>
        </Card>
        <Card hoverEffect>
          <div className="card-header"><h3>Upcoming Interviews</h3><button className="link-btn" onClick={()=>navigate('/interviews')}>View All →</button></div>
          <div className="recent-list">
            {upcomingInts.length===0
              ? <EmptyState icon={Calendar} title="No upcoming interviews" description="Schedule an interview to see it here." />
              : upcomingInts.map(i=>{
                const nm=i.employee?.name||'Unknown'
                const d=new Date(i.date+'T00:00:00')
                const ds=d.toLocaleDateString('en-IN',{day:'numeric',month:'short'})
                const [h,m]=i.time.split(':'); const hr=parseInt(h)
                return (
                  <div key={i._id} className="recent-item">
                    <div className="avatar" style={{background:getColor(nm)}}>{getInit(nm)}</div>
                    <div className="recent-info"><div className="recent-name">{nm}</div><div className="recent-sub">{i.type} · {ds} at {hr%12||12}:{m} {hr>=12?'PM':'AM'}</div></div>
                    {i.meeting_link && <a href={i.meeting_link} target="_blank" rel="noreferrer" className="btn-join-meet">Join</a>}
                  </div>
                )
              })
            }
          </div>
        </Card>
      </div>
    </PageWrapper>
  )
}
