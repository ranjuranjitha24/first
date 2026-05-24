import { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { getStats } from '../services/api';
import { StatCard } from '../components/ui/StatCard';
import { motion } from 'framer-motion';
import { Target, Clock, DollarSign, Heart } from 'lucide-react';
import { PageWrapper } from '../components/ui/PageWrapper';

const COLORS = ['#7c3aed', '#2563eb', '#059669', '#d97706', '#dc2626', '#0891b2', '#be185d'];

const funnelData = [
  { name: 'Sourcing', value: 1000, fill: '#7c3aed' },
  { name: 'Screening', value: 600, fill: '#6366f1' },
  { name: 'Interview', value: 300, fill: '#3b82f6' },
  { name: 'Offer', value: 120, fill: '#06b6d4' },
  { name: 'Hired', value: 85, fill: '#10b981' },
];

const timeToHireData = [
  { month: 'Jan', days: 24 },
  { month: 'Feb', days: 22 },
  { month: 'Mar', days: 28 },
  { month: 'Apr', days: 20 },
  { month: 'May', days: 18 },
  { month: 'Jun', days: 21 },
];

const sourceData = [
  { name: 'LinkedIn', value: 45 },
  { name: 'Referrals', value: 25 },
  { name: 'Indeed', value: 15 },
  { name: 'Career Page', value: 10 },
  { name: 'Agencies', value: 5 },
];

const diversityData = [
  { subject: 'Engineering', A: 120, fullMark: 150 },
  { subject: 'Design', A: 98, fullMark: 150 },
  { subject: 'Marketing', A: 86, fullMark: 150 },
  { subject: 'Sales', A: 99, fullMark: 150 },
  { subject: 'HR', A: 85, fullMark: 150 },
];

export default function Analytics() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 800);
  }, []);

  if (loading) return <div className="page-content"><div className="loading-state">⏳ Analyzing recruitment data...</div></div>;

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <PageWrapper>
      <div className="page-header">
        <div>
          <h1 className="page-title">Recruiter Analytics</h1>
          <p className="page-sub">Deep dive into your hiring performance and workforce metrics</p>
        </div>
        <div className="header-actions">
          <button className="btn-outline">📥 Export Report</button>
        </div>
      </div>

      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="stats-grid">
        <motion.div variants={staggerItem}><StatCard icon={<Target size={20} />} value={18.4} label="Hire-to-Offer Ratio (%)" colorClass="primary" /></motion.div>
        <motion.div variants={staggerItem}><StatCard icon={<Clock size={20} />} value={22} label="Avg. Time to Hire (Days)" colorClass="success" /></motion.div>
        <motion.div variants={staggerItem}><StatCard icon={<DollarSign size={20} />} value={4250} label="Cost Per Hire ($)" colorClass="warning" /></motion.div>
        <motion.div variants={staggerItem}><StatCard icon={<Heart size={20} />} value={92} label="Candidate Satisfaction (%)" colorClass="danger" /></motion.div>
      </motion.div>

      <div className="dashboard-grid">
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-header"><h3>Hiring Funnel Efficiency</h3></div>
          <div style={{ padding: '24px', height: 350 }}>
            <ResponsiveContainer>
              <BarChart data={funnelData} layout="vertical" margin={{ left: 40, right: 40 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} width={100} />
                <Tooltip cursor={{fill: 'var(--primary-glow)'}} contentStyle={{borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text)'}} />
                <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={40}>
                  {funnelData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Time to Hire (Days)</h3></div>
          <div style={{ padding: '24px', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={timeToHireData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text)'}} />
                <Line type="monotone" dataKey="days" stroke="var(--primary)" strokeWidth={4} dot={{ r: 6, fill: 'var(--primary)', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Candidate Sources</h3></div>
          <div style={{ padding: '24px', height: 300, display: 'flex', alignItems: 'center' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={sourceData} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {sourceData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', background: 'var(--bg-card)', color: 'var(--text)', boxShadow: 'var(--shadow-lg)'}} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ paddingLeft: 20 }}>
              {sourceData.map((s, i) => (
                <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.name} ({s.value}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Department Performance Index</h3></div>
          <div style={{ padding: '24px', height: 350 }}>
            <ResponsiveContainer>
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={diversityData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                <Radar name="Performance" dataKey="A" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.4} />
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', background: 'var(--bg-card)', color: 'var(--text)', boxShadow: 'var(--shadow-lg)'}} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Monthly Retention Rate</h3></div>
          <div style={{ padding: '24px', height: 350 }}>
            <ResponsiveContainer>
              <AreaChart data={timeToHireData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text)'}} />
                <Area type="monotone" dataKey="days" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
