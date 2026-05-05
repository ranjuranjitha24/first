import { useEffect, useState } from 'react'
import { getStats, getEmployees, getUpcomingInterviews, getLeaves, getPipelineStats, getCurrentUser } from '../services/api'
import { useNavigate } from 'react-router-dom'

const COLORS = ['#7c3aed','#2563eb','#059669','#d97706','#dc2626','#0891b2','#be185d','#64748b']
const getColor = n => { let h=0; for(let c of (n||'')) h+=c.charCodeAt(0); return COLORS[h%COLORS.length] }
const getInit  = n => (n||'?').split(' ').map(p=>p[0]).join('').substring(0,2).toUpperCase()

// Clean role list with progress bars — no canvas box issues
function RoleChart({ data }) {
  const max = Math.max(...data.map(d => d.value), 1)
  if (!data.length) return <div className="empty-state" style={{padding:30}}><p>No data yet</p></div>
  return (
    <div style={{display:'flex',flexDirection:'column',gap:12,padding:'4px 0'}}>
      {data.sort((a,b)=>b.value-a.value).map((d,i)=>(
        <div key={d.label}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
            <span style={{fontSize:13,fontWeight:500,color:'var(--text)'}}>{d.label}</span>
            <span style={{fontSize:13,fontWeight:700,color:COLORS[i%COLORS.length]}}>{d.value}</span>
          </div>
          <div style={{height:8,background:'var(--border)',borderRadius:99,overflow:'hidden'}}>
            <div style={{
              height:'100%', borderRadius:99,
              width:`${(d.value/max)*100}%`,
              background:COLORS[i%COLORS.length],
              transition:'width 0.6s ease'
            }}/>
          </div>
        </div>
      ))}
    </div>
  )
}

// Donut chart using pure SVG — no canvas issues
function DonutChart({ data }) {
  const CHART_COLORS = ['#3b82f6','#10b981','#ef4444']
  const total = data.reduce((s,d)=>s+d.value,0) || 1
  const r=60, cx=80, cy=80, stroke=22
  const circ = 2*Math.PI*r
  let offset = 0
  const slices = data.map((d,i) => {
    const pct = d.value / total
    const dash = pct * circ
    const gap  = circ - dash
    const s = { offset, dash, gap, color: CHART_COLORS[i] }
    offset += dash
    return s
  })
  return (
    <svg width={160} height={160} viewBox="0 0 160 160">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke}/>
      {slices.map((s,i)=>(
        <circle key={i} cx={cx} cy={cy} r={r} fill="none"
          stroke={s.color} strokeWidth={stroke}
          strokeDasharray={`${s.dash} ${s.gap}`}
          strokeDashoffset={-s.offset + circ*0.25}
          style={{transform:'rotate(-90deg)',transformOrigin:'80px 80px'}}
        />
      ))}
      <text x={cx} y={cy+2}  textAnchor="middle" fontSize={20} fontWeight={700} fill="var(--text)">{total}</text>
      <text x={cx} y={cy+16} textAnchor="middle" fontSize={11} fill="var(--text-muted)">Total</text>
    </svg>
  )
}

function StatCard({ icon, value, label, colorClass }) {
  return (
    <div className={`stat-card ${colorClass}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-info"><div className="stat-value">{value}</div><div className="stat-label">{label}</div></div>
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats]           = useState({totalEmployees:0,scheduled:0,completed:0,cancelled:0})
  const [recentEmps, setRecent]     = useState([])
  const [upcomingInts, setUpcoming] = useState([])
  const [pendingLeaves, setPending] = useState(0)
  const [empByRole, setEmpByRole]   = useState([])
  const navigate = useNavigate()
  
  const user = getCurrentUser() || {}
  const isHR = user.role !== 'employee'

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await getStats()
        setStats(res.data.data)
      } catch (e) { console.error('Failed to fetch stats:', e) }

      try {
        const res = await getUpcomingInterviews()
        setUpcoming(res.data.data)
      } catch (e) { console.error('Failed to fetch upcoming interviews:', e) }

      try {
        const res = await getLeaves(isHR ? { status: 'Pending' } : {})
        const leaves = res.data.data
        setPending(isHR ? leaves.length : leaves.filter(l => l.status === 'Pending').length)
      } catch (e) { console.error('Failed to fetch leaves:', e) }

      if (isHR) {
        try {
          const res = await getEmployees()
          const emps = res.data.data
          setRecent(emps.slice(0, 5))
          const roleCount = {}
          emps.forEach(emp => { roleCount[emp.role] = (roleCount[emp.role] || 0) + 1 })
          setEmpByRole(Object.entries(roleCount).map(([label, value]) => ({ label, value })))
        } catch (e) { console.error('Failed to fetch employees:', e) }
      }
    }
    fetchDashboardData()
  }, [isHR])

  const donutData = [
    {label:'Scheduled', value:stats.scheduled},
    {label:'Completed', value:stats.completed},
    {label:'Cancelled', value:stats.cancelled},
  ]

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">Welcome back, {user.username || 'HR Manager'} 👋</p>
        </div>
        {isHR && (
          <div className="header-actions">
            <button className="btn-primary"   onClick={()=>navigate('/employees')}>+ Add Employee</button>
            <button className="btn-secondary" onClick={()=>navigate('/interviews')}>Schedule Interview</button>
          </div>
        )}
      </div>

      <div className="stats-grid">
        {isHR && <StatCard icon="👥" value={stats.totalEmployees} label="Total Employees" colorClass="primary"/>}
        <StatCard icon="📅" value={stats.scheduled}      label={isHR ? "Interviews Scheduled" : "My Interviews"} colorClass="success"/>
        <StatCard icon="⏰" value={upcomingInts.length}  label="Upcoming Interviews"  colorClass="warning"/>
        <StatCard icon="🌴" value={pendingLeaves}         label="Pending Leaves"       colorClass="danger"/>
      </div>

      {/* Charts Row - HR Only */}
      {isHR && (
        <div className="dashboard-grid" style={{marginBottom:24}}>
          <div className="card">
            <div className="card-header"><h3>Employees by Role</h3></div>
            <div style={{padding:'20px 24px'}}>
              <RoleChart data={empByRole}/>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><h3>Interview Status</h3></div>
            <div style={{padding:'16px 24px',display:'flex',alignItems:'center',gap:28}}>
              <DonutChart data={donutData}/>
              <div style={{display:'flex',flexDirection:'column',gap:14,flex:1}}>
                {[['#3b82f6','Scheduled',stats.scheduled],['#10b981','Completed',stats.completed],['#ef4444','Cancelled',stats.cancelled]].map(([c,l,v])=>(
                  <div key={l}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                      <span style={{fontSize:13,color:'var(--text-muted)'}}>{l}</span>
                      <strong style={{fontSize:13,color:'var(--text)'}}>{v}</strong>
                    </div>
                    <div style={{height:6,background:'var(--border)',borderRadius:99}}>
                      <div style={{height:'100%',borderRadius:99,background:c,width:`${((v/(stats.scheduled+stats.completed+stats.cancelled||1))*100)}%`,transition:'width 0.6s'}}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent */}
      <div className="dashboard-grid">
        {isHR && (
          <div className="card">
            <div className="card-header"><h3>Recent Employees</h3><button className="link-btn" onClick={()=>navigate('/employees')}>View All →</button></div>
            <div className="recent-list">
              {recentEmps.length===0
                ? <div className="empty-state" style={{padding:30}}><div className="empty-icon">👥</div><p>No employees yet</p></div>
                : recentEmps.map(e=>(
                  <div key={e._id} className="recent-item">
                    <div className="avatar" style={{background:getColor(e.name)}}>{getInit(e.name)}</div>
                    <div className="recent-info"><div className="recent-name">{e.name}</div><div className="recent-sub">{e.role} · {e.experience}</div></div>
                    <span className="role-badge">{e.role.split(' ')[0]}</span>
                  </div>
                ))
              }
            </div>
          </div>
        )}
        <div className="card" style={{ gridColumn: isHR ? 'auto' : '1 / -1' }}>
          <div className="card-header"><h3>Upcoming Interviews</h3><button className="link-btn" onClick={()=>navigate('/interviews')}>View All →</button></div>
          <div className="recent-list">
            {upcomingInts.length===0
              ? <div className="empty-state" style={{padding:30}}><div className="empty-icon">📅</div><p>No upcoming</p></div>
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
        </div>
      </div>
    </div>
  )
}
