import { useState } from 'react'
import { getCurrentUser } from '../services/api'

export default function Profile() {
  const user = getCurrentUser() || {}
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    name: user.username || 'John Doe',
    email: 'john.doe@company.com',
    phone: '+91 98765 43210',
    department: 'Engineering',
    role: user.role || 'employee',
    joinDate: 'Jan 15, 2024',
    address: '123 Tech Park, Bangalore',
    emergencyContact: 'Jane Doe (+91 99887 76655)'
  })

  const initial = profile.name[0].toUpperCase()

  return (
    <div className="page-content page-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-sub">View and manage your personal information</p>
        </div>
        <button className="btn-primary" onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? '💾 Save Changes' : '✏️ Edit Profile'}
        </button>
      </div>

      <div className="dashboard-grid">
        {/* Profile Card */}
        <div className="card" style={{ gridColumn: 'span 1' }}>
          <div style={{ padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div className="avatar" style={{ width: 100, height: 100, fontSize: 36, marginBottom: 20 }}>{initial}</div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>{profile.name}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, textTransform: 'capitalize', fontWeight: 600 }}>{profile.role} · {profile.department}</p>
            <div className="dropdown-divider" style={{ width: '100%', margin: '24px 0' }}></div>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text-muted)' }}>Status</span>
                <span className="status-badge success"><span className="status-dot"></span> Active</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text-muted)' }}>ID</span>
                <span style={{ fontWeight: 600 }}>EMP-2024-089</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text-muted)' }}>Member Since</span>
                <span style={{ fontWeight: 600 }}>{profile.joinDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Tabs */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-header">
            <h3>Personal Information</h3>
          </div>
          <div style={{ padding: '24px' }}>
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name</label>
                <input value={profile.name} disabled={!isEditing} onChange={e => setProfile({...profile, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input value={profile.email} disabled={!isEditing} onChange={e => setProfile({...profile, email: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input value={profile.phone} disabled={!isEditing} onChange={e => setProfile({...profile, phone: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Department</label>
                <input value={profile.department} disabled />
              </div>
              <div className="form-group full-width">
                <label>Office Address</label>
                <textarea value={profile.address} disabled={!isEditing} rows={2} onChange={e => setProfile({...profile, address: e.target.value})} />
              </div>
              <div className="form-group full-width">
                <label>Emergency Contact</label>
                <input value={profile.emergencyContact} disabled={!isEditing} onChange={e => setProfile({...profile, emergencyContact: e.target.value})} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <div className="card-header">
          <h3>Security Settings</h3>
        </div>
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontWeight: 600, fontSize: 14 }}>Change Password</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>It's a good idea to use a strong password that you don't use elsewhere.</p>
            </div>
            <button className="btn-secondary">Update Password</button>
          </div>
          <div className="dropdown-divider" style={{ margin: '20px 0' }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontWeight: 600, fontSize: 14 }}>Two-Factor Authentication</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Add an extra layer of security to your account.</p>
            </div>
            <button className="btn-outline">Enable 2FA</button>
          </div>
        </div>
      </div>
    </div>
  )
}
