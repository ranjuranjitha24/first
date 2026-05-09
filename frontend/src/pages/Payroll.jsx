import { useState, useEffect, useCallback } from 'react'
import { getPayroll, getPayrollStats, addPayroll, updatePayroll, getCurrentUser, getEmployees } from '../services/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export default function Payroll() {
  const [payroll, setPayroll] = useState([])
  const [stats, setStats] = useState(null)
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [payslipModal, setPayslipModal] = useState(null)
  const [form, setForm] = useState({ employee_id: '', month: 'May 2024', base_salary: 0, bonuses: 0, deductions: 0, tax: 0 })
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' })

  const user = getCurrentUser() || {}
  const isHR = user.role !== 'employee'

  const showToast = (msg, type = 'success') => {
    setToast({ show: true, msg, type })
    setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 3000)
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [payRes, statsRes, empRes] = await Promise.all([
        getPayroll(),
        isHR ? getPayrollStats() : Promise.resolve({ data: { data: null } }),
        isHR ? getEmployees() : Promise.resolve({ data: { data: [] } })
      ])
      setPayroll(payRes.data?.data || [])
      if (statsRes.data?.data) setStats(statsRes.data.data)
      if (empRes.data?.data) setEmployees(empRes.data.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [isHR])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await addPayroll(form)
      showToast('✅ Payroll record generated!')
      setShowModal(false)
      fetchData()
    } catch (err) { showToast('❌ Failed to save payroll', 'danger') }
  }

  const handleUpdateStatus = async (id, status) => {
    try {
      await updatePayroll(id, { status })
      showToast(`✅ Payment marked as ${status.toLowerCase()}`)
      fetchData()
    } catch (e) { showToast('❌ Update failed', 'danger') }
  }

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val)

  const handleDownload = (p) => {
    showToast('📄 Generating payslip PDF...')
    setTimeout(() => {
      window.print()
    }, 1000)
  }

  return (
    <div className="page-content page-fade-in">
      {toast.show && <div className={`toast show ${toast.type}`} style={{ position: 'fixed', top: 24, right: 24, zIndex: 10001 }}>{toast.msg}</div>}

      <div className="page-header">
        <div>
          <h1 className="page-title">💰 Payroll Management</h1>
          <p className="page-sub">{isHR ? 'Manage salaries, bonuses, and tax compliance' : 'View and download your monthly payslips'}</p>
        </div>
        {isHR && <button className="btn-primary" onClick={() => setShowModal(true)}>➕ Process New Payroll</button>}
      </div>

      {isHR && stats && (
        <div className="stats-grid">
          <div className="stat-card primary">
            <div className="stat-card-glow"></div>
            <div className="stat-info">
              <div className="stat-value">{formatCurrency(stats.totalExpense)}</div>
              <div className="stat-label">Total Monthly Expense</div>
            </div>
          </div>
          <div className="stat-card success">
            <div className="stat-card-glow"></div>
            <div className="stat-info">
              <div className="stat-value">{formatCurrency(stats.averageSalary)}</div>
              <div className="stat-label">Average Net Salary</div>
            </div>
          </div>
          <div className="stat-card warning">
            <div className="stat-card-glow"></div>
            <div className="stat-info">
              <div className="stat-value">{stats.pendingPayments}</div>
              <div className="stat-label">Pending Payments</div>
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-grid">
        <div className="card" style={{ gridColumn: isHR ? 'span 2' : '1 / -1' }}>
          <div className="card-header">
            <h3>{isHR ? 'Recent Payroll Records' : 'My Payslips'}</h3>
          </div>
          <div className="table-wrapper">
            <table className="emp-table">
              <thead>
                <tr>
                  {isHR && <th>Employee</th>}
                  <th>Month</th>
                  <th>Net Salary</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payroll.length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No records found</td></tr>
                ) : (
                  payroll.map(p => (
                    <tr key={p._id}>
                      {isHR && <td><div className="emp-name-text">{p.employee_name}</div><div className="emp-email-text">{p.employee_role}</div></td>}
                      <td><div style={{ fontWeight: 600 }}>{p.month}</div></td>
                      <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{formatCurrency(p.net_salary)}</td>
                      <td>
                        <span className={`status-badge ${p.status === 'Paid' ? 'success' : 'warning'}`}>
                          <span className="status-dot"></span>{p.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-icon" title="View Payslip" onClick={() => setPayslipModal(p)}>📄</button>
                          {isHR && p.status === 'Pending' && (
                            <button className="btn-icon" title="Mark as Paid" onClick={() => handleUpdateStatus(p._id, 'Paid')}>💰</button>
                          )}
                          <button className="btn-icon" title="Download PDF" onClick={() => handleDownload(p)}>⬇️</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {isHR && stats && (
          <div className="card">
            <div className="card-header"><h3>Monthly Expense Trend</h3></div>
            <div style={{ padding: 20, height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.byMonth || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="_id" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                  <Tooltip 
                    cursor={{fill: 'var(--primary-glow)'}}
                    contentStyle={{ borderRadius: 12, border: 'none', background: 'var(--bg-card)', boxShadow: 'var(--shadow-lg)' }}
                  />
                  <Bar dataKey="total" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Process Payroll Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>➕ Process New Payroll</h3><button className="modal-close" onClick={() => setShowModal(false)}>✕</button></div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Select Employee</label>
                  <select value={form.employee_id} onChange={e => setForm({ ...form, employee_id: e.target.value })} required>
                    <option value="">Select...</option>
                    {employees.map(e => <option key={e._id} value={e._id}>{e.name} ({e.role})</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Month</label><input value={form.month} onChange={e => setForm({ ...form, month: e.target.value })} placeholder="e.g. June 2024" required /></div>
                <div className="form-group"><label>Base Salary (₹)</label><input type="number" value={form.base_salary} onChange={e => setForm({ ...form, base_salary: parseFloat(e.target.value) })} required /></div>
                <div className="form-group"><label>Bonuses (₹)</label><input type="number" value={form.bonuses} onChange={e => setForm({ ...form, bonuses: parseFloat(e.target.value) })} /></div>
                <div className="form-group"><label>Deductions (₹)</label><input type="number" value={form.deductions} onChange={e => setForm({ ...form, deductions: parseFloat(e.target.value) })} /></div>
                <div className="form-group full-width"><label>Tax Calculation (₹)</label><input type="number" value={form.tax} onChange={e => setForm({ ...form, tax: parseFloat(e.target.value) })} /></div>
              </div>
              <div className="form-actions" style={{ marginTop: 24 }}>
                <button type="button" className="btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Generate Payroll</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payslip View Modal */}
      {payslipModal && (
        <div className="modal-overlay" onClick={() => setPayslipModal(null)}>
          <div className="modal-content" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>📄 Employee Payslip</h3><button className="modal-close" onClick={() => setPayslipModal(null)}>✕</button></div>
            <div className="modal-body">
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <h2 style={{ fontSize: 24, color: 'var(--primary)', marginBottom: 4 }}>HR RECRUITER PRO</h2>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Salary Statement for {payslipModal.month}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Employee Name</span><span style={{ fontWeight: 700 }}>{payslipModal.employee_name}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Designation</span><span style={{ fontWeight: 600 }}>{payslipModal.employee_role}</span></div>
                <div className="dropdown-divider"></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Base Salary</span><span>{formatCurrency(payslipModal.base_salary)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Bonuses</span><span style={{ color: 'var(--success)' }}>+ {formatCurrency(payslipModal.bonuses)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Deductions</span><span style={{ color: 'var(--danger)' }}>- {formatCurrency(payslipModal.deductions)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Tax (TDS)</span><span style={{ color: 'var(--danger)' }}>- {formatCurrency(payslipModal.tax)}</span></div>
                <div className="dropdown-divider" style={{ background: 'var(--primary)', height: 2 }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 800 }}><span>Net Salary</span><span style={{ color: 'var(--primary)' }}>{formatCurrency(payslipModal.net_salary)}</span></div>
              </div>
              <button className="btn-primary" style={{ width: '100%', marginTop: 32 }} onClick={() => handleDownload(payslipModal)}>⬇️ Download PDF Statement</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
