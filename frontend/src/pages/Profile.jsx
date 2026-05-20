import { useState, useEffect } from 'react'
import { getCurrentUser, getCandidateProfile, updateCandidateProfile } from '../services/api'

export default function Profile() {
  const user = getCurrentUser() || {}
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    username: user.username || '',
    phone: '',
    location: '',
    bio: '',
    skills: [],
    experience: [],
    education: [],
    resume: ''
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (user.role === 'candidate') {
          const res = await getCandidateProfile()
          setProfile(res.data.data)
        } else {
          // Default profile for employees/admins (kept simple for this task)
          setProfile(p => ({ ...p, username: user.username }))
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [user.role, user.username])

  const handleSave = async () => {
    try {
      setLoading(true)
      await updateCandidateProfile(profile)
      alert('✅ Profile updated successfully!')
      setIsEditing(false)
    } catch (e) {
      alert('Failed to update profile.')
    } finally {
      setLoading(false)
    }
  }

  const addItem = (field) => {
    setProfile({ ...profile, [field]: [...profile[field], ''] })
  }

  const updateItem = (field, index, value) => {
    const newList = [...profile[field]]
    newList[index] = value
    setProfile({ ...profile, [field]: newList })
  }

  if (loading && !profile.username) return <div className="page-content">Loading profile...</div>

  return (
    <div className="page-content page-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-sub">Manage your professional identity and resume</p>
        </div>
        <button className="btn-primary" onClick={() => isEditing ? handleSave() : setIsEditing(true)}>
          {isEditing ? '💾 Save Changes' : '✏️ Edit Profile'}
        </button>
      </div>

      <div className="dashboard-grid">
        <div className="card glass" style={{ gridColumn: 'span 1' }}>
          <div style={{ padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div className="avatar" style={{ width: 100, height: 100, fontSize: 36, marginBottom: 20 }}>
              {profile.username[0]?.toUpperCase()}
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>{profile.username}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, textTransform: 'capitalize', fontWeight: 600 }}>
              {user.role} {profile.location && `· ${profile.location}`}
            </p>
            <div className="dropdown-divider" style={{ width: '100%', margin: '24px 0' }}></div>
            
            {isEditing ? (
              <div style={{ width: '100%', textAlign: 'left' }}>
                <label style={{ fontSize: 12, fontWeight: 700 }}>Bio</label>
                <textarea 
                  className="filter-input" 
                  style={{ width: '100%', marginTop: 8 }} 
                  value={profile.bio} 
                  onChange={e => setProfile({...profile, bio: e.target.value})}
                />
              </div>
            ) : (
              <p style={{ fontSize: 14, opacity: 0.8 }}>{profile.bio || 'No bio provided yet.'}</p>
            )}
          </div>
        </div>

        <div className="card glass" style={{ gridColumn: 'span 2' }}>
          <div className="card-header">
            <h3>Contact & Details</h3>
          </div>
          <div style={{ padding: '24px' }}>
            <div className="form-grid">
              <div className="form-group">
                <label>Phone Number</label>
                <input value={profile.phone} disabled={!isEditing} onChange={e => setProfile({...profile, phone: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input value={profile.location} disabled={!isEditing} onChange={e => setProfile({...profile, location: e.target.value})} />
              </div>
              <div className="form-group full-width">
                <label>Resume Link</label>
                <input 
                  type="text"
                  value={profile.resume} 
                  disabled={!isEditing} 
                  onChange={e => setProfile({...profile, resume: e.target.value})} 
                  placeholder="e.g., https://drive.google.com/..." 
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {user.role === 'candidate' && (
        <div className="dashboard-grid" style={{ marginTop: 24 }}>
          <div className="card glass">
            <div className="card-header">
              <h3>Skills</h3>
              {isEditing && <button className="btn-icon" onClick={() => addItem('skills')}>➕</button>}
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {profile.skills.map((s, i) => (
                  isEditing ? (
                    <input key={i} value={s} onChange={e => updateItem('skills', i, e.target.value)} style={{ width: 'auto', display: 'inline-block' }} />
                  ) : (
                    <span key={i} className="skill-tag">{s}</span>
                  )
                ))}
              </div>
            </div>
          </div>

          <div className="card glass">
            <div className="card-header">
              <h3>Experience</h3>
              {isEditing && <button className="btn-icon" onClick={() => addItem('experience')}>➕</button>}
            </div>
            <div style={{ padding: 24 }}>
              {profile.experience.map((exp, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  {isEditing ? (
                    <input value={exp} onChange={e => updateItem('experience', i, e.target.value)} />
                  ) : (
                    <p style={{ fontSize: 14 }}>• {exp}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="card glass">
            <div className="card-header">
              <h3>Education</h3>
              {isEditing && <button className="btn-icon" onClick={() => addItem('education')}>➕</button>}
            </div>
            <div style={{ padding: 24 }}>
              {profile.education.map((edu, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  {isEditing ? (
                    <input value={edu} onChange={e => updateItem('education', i, e.target.value)} />
                  ) : (
                    <p style={{ fontSize: 14 }}>• {edu}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
