import { useState, useEffect } from 'react'
import { addEmployee, updateEmployee } from '../services/api'

const ROLES = ['Frontend Developer', 'Backend Developer', 'UI/UX Designer', 'Product Manager', 'Data Analyst', 'DevOps Engineer', 'QA Engineer', 'HR Manager']
const DEPTS = ['Engineering', 'Design', 'Product', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations']
const EXPERIENCES = ['Fresher (0-1 yr)', 'Junior (1-3 yrs)', 'Mid-Level (3-5 yrs)', 'Senior (5-8 yrs)', 'Lead (8+ yrs)']
const STATUSES = ['Active', 'Inactive', 'On Leave', 'Deactivated']

export default function EmployeeForm({ employee, onSave, onCancel }) {
  const isEdit = !!employee
  const [form, setForm] = useState({ 
    name: '', email: '', role: '', department: 'Engineering', 
    experience: '', skills: '', status: 'Active', image_url: '',
    username: '', password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (employee) setForm({ 
      name: employee.name, 
      email: employee.email, 
      role: employee.role, 
      department: employee.department || 'Engineering',
      experience: employee.experience, 
      skills: employee.skills,
      status: employee.status || 'Active',
      image_url: employee.image_url || ''
    })
  }, [employee])

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      if (isEdit) await updateEmployee(employee._id, form)
      else await addEmployee(form)
      onSave()
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally { setLoading(false) }
  }

  return (
    <form className="emp-form" onSubmit={handleSubmit}>
      {error && <div className="form-error">⚠️ {error}</div>}
      <div className="form-grid">
        <div className="form-group">
          <label>Full Name *</label>
          <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Priya Sharma" required />
        </div>
        <div className="form-group">
          <label>Email Address *</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="e.g. priya@company.com" required />
        </div>
        <div className="form-group">
          <label>Department *</label>
          <select name="department" value={form.department} onChange={handleChange} required>
            {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Role *</label>
          <select name="role" value={form.role} onChange={handleChange} required>
            <option value="">Select Role</option>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Experience *</label>
          <select name="experience" value={form.experience} onChange={handleChange} required>
            <option value="">Select Experience</option>
            {EXPERIENCES.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Status</label>
          <select name="status" value={form.status} onChange={handleChange}>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="form-group full-width">
          <label>Profile Image URL</label>
          <input name="image_url" value={form.image_url} onChange={handleChange} placeholder="https://example.com/photo.jpg" />
        </div>
        <div className="form-group full-width">
          <label>Skills * <span className="label-hint">(comma separated)</span></label>
          <input name="skills" value={form.skills} onChange={handleChange} placeholder="e.g. React, Node.js, Python" required />
        </div>

        {!isEdit && (
          <>
            <div className="form-divider" style={{ gridColumn: 'span 2', margin: '12px 0', borderTop: '1px solid var(--border)', paddingTop: 12 }}>
              <h4 style={{ margin: 0, fontSize: 14 }}>Portal Access Credentials</h4>
            </div>
            <div className="form-group">
              <label>Username *</label>
              <input name="username" value={form.username} onChange={handleChange} placeholder="e.g. priya123" required={!isEdit} />
            </div>
            <div className="form-group">
              <label>Password *</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••" required={!isEdit} />
            </div>
          </>
        )}
      </div>
      <div className="form-actions">
        <button type="button" className="btn-outline" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? '⏳ Saving...' : `💾 ${isEdit ? 'Update' : 'Save'} Employee`}
        </button>
      </div>
    </form>
  )
}
