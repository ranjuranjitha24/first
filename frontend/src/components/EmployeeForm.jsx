import { useState, useEffect } from 'react'
import { addEmployee, updateEmployee } from '../services/api'

const ROLES = ['Frontend Developer', 'Backend Developer', 'UI/UX Designer', 'Product Manager', 'Data Analyst', 'DevOps Engineer', 'QA Engineer', 'HR Manager']
const EXPERIENCES = ['Fresher (0-1 yr)', 'Junior (1-3 yrs)', 'Mid-Level (3-5 yrs)', 'Senior (5-8 yrs)', 'Lead (8+ yrs)']

export default function EmployeeForm({ employee, onSave, onCancel }) {
  const isEdit = !!employee
  const [form, setForm] = useState({ name: '', email: '', role: '', experience: '', skills: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (employee) setForm({ name: employee.name, email: employee.email, role: employee.role, experience: employee.experience, skills: employee.skills })
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
          <label>Role *</label>
          <select name="role" value={form.role} onChange={handleChange} required>
            <option value="">Select Role</option>
            {ROLES.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Experience *</label>
          <select name="experience" value={form.experience} onChange={handleChange} required>
            <option value="">Select Experience</option>
            {EXPERIENCES.map(e => <option key={e}>{e}</option>)}
          </select>
        </div>
        <div className="form-group full-width">
          <label>Skills * <span className="label-hint">(comma separated)</span></label>
          <input name="skills" value={form.skills} onChange={handleChange} placeholder="e.g. React, Node.js, Python" required />
        </div>
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
