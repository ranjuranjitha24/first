import { useState, useEffect } from 'react'
import { addInterview, getCandidates } from '../services/api'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const TYPES  = ['HR Round','Technical','Final Round']
const SLOTS  = ['09:00','09:30','10:00','10:30','11:00','11:30','12:00','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00']

function toDateStr(y,m,d){ return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}` }
function getDays(y,m){ return new Date(y,m+1,0).getDate() }
function getFirst(y,m){ return new Date(y,m,1).getDay() }

export default function InterviewForm({ employees, preselectedEmployee, onSave, onClose }) {
  const today = new Date()
  const [candidates, setCandidates] = useState([])
  const [calY, setCalY] = useState(today.getFullYear())
  const [calM, setCalM] = useState(today.getMonth())
  const [selDate, setSelDate]   = useState('')
  const [selTime, setSelTime]   = useState('')
  const [selType, setSelType]   = useState('')
  const [selCand, setSelCand]   = useState('')
  const [selEmp,  setSelEmp]    = useState(preselectedEmployee?._id || '')
  const [meetLink, setMeetLink] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error,   setError]     = useState('')

  useEffect(() => {
    getCandidates().then(res => setCandidates(res.data.data)).catch(console.error)
    if (preselectedEmployee) setSelEmp(preselectedEmployee._id)
  }, [preselectedEmployee])

  const isPast = (d) => toDateStr(calY, calM, d) < today.toISOString().split('T')[0]

  const prevM = () => calM===0 ? (setCalM(11),setCalY(y=>y-1)) : setCalM(m=>m-1)
  const nextM = () => calM===11? (setCalM(0), setCalY(y=>y+1)) : setCalM(m=>m+1)

  const handleDay = (d) => { if (isPast(d)) return; setSelDate(toDateStr(calY,calM,d)); setSelTime('') }

  const generateMeetLink = () => {
    window.open('https://meet.google.com/new', '_blank')
    setMeetLink('https://meet.google.com/') 
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selEmp||!selDate||!selTime||!selType||!selCand){ setError('Please fill all required fields'); return }
    setLoading(true); setError('')
    
    const empDoc = employees.find(e => e._id === selEmp)
    
    try {
      await addInterview({ 
        candidate_id: selCand,
        employee: selEmp, 
        interviewer: empDoc ? empDoc.name : 'Staff',
        date: selDate, 
        time: selTime, 
        type: selType, 
        meeting_link: meetLink 
      })
      onSave()
    } catch(err) { 
      const detail = err.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Failed to schedule. Check for conflicting slots.')
    } finally { setLoading(false) }
  }

  const daysInMonth = getDays(calY, calM)
  const firstDay    = getFirst(calY, calM)
  const dispDay     = selDate ? parseInt(selDate.split('-')[2]) : null

  return (
    <div className="modal-overlay open" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal interview-modal">
        <div className="modal-header">
          <div><h3>📅 Schedule Interview</h3><p>Book a slot and add a meeting link</p></div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="slot-error">⚠️ {error}</div>}

          <div className="form-group" style={{padding:'0 24px',marginTop:20}}>
            <label>Select Candidate *</label>
            <select value={selCand} onChange={e=>setSelCand(e.target.value)} required>
              <option value="">Choose Candidate</option>
              {candidates.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>

          <div className="form-group" style={{padding:'0 24px',marginTop:12}}>
            <label>Select Interviewer *</label>
            <select value={selEmp} onChange={e=>setSelEmp(e.target.value)} required>
              <option value="">Choose Employee</option>
              {employees.map(e=><option key={e._id} value={e._id}>{e.name} — {e.role}</option>)}
            </select>
          </div>

          <div className="interview-scheduler">
            {/* Calendar */}
            <div className="cal-section">
              <div className="cal-header">
                <button type="button" className="cal-nav" onClick={prevM}>‹</button>
                <span className="cal-month-label">{MONTHS[calM]} {calY}</span>
                <button type="button" className="cal-nav" onClick={nextM}>›</button>
              </div>
              <div className="cal-grid">
                {DAYS.map(d=><div key={d} className="cal-day-name">{d}</div>)}
                {Array(firstDay).fill(null).map((_,i)=><div key={'e'+i}/>)}
                {Array(daysInMonth).fill(null).map((_,i)=>{
                  const d=i+1; const ds=toDateStr(calY,calM,d); const past=isPast(d); const active=selDate===ds
                  return <div key={d} className={`cal-day${past?' past':''}${active?' active':''}`} onClick={()=>handleDay(d)}>{d}</div>
                })}
              </div>
            </div>

            {/* Time */}
            <div className="time-section">
              <div className="time-section-header">
                {selDate
                  ? <><span className="time-date-label">{dispDay} {MONTHS[calM].slice(0,3)}</span><span className="time-hint">Available Slots</span></>
                  : <span className="time-hint">← Select a date first</span>}
              </div>
              <div className="time-slots">
                {selDate && SLOTS.map(slot=>(
                  <button key={slot} type="button" className={`time-slot${selTime===slot?' active':''}`} onClick={()=>setSelTime(slot)}>
                    <span className="time-dot"/>
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Type */}
          <div className="form-group" style={{padding:'0 24px 8px'}}>
            <label>Interview Type *</label>
            <div className="type-selector">
              {TYPES.map(t=>(
                <label key={t} className={`type-option${selType===t?' selected':''}`}>
                  <input type="radio" name="int-type" value={t} checked={selType===t} onChange={()=>setSelType(t)}/>
                  <span>{t==='HR Round'?'🤝':t==='Technical'?'💻':'🏆'} {t}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Meeting Link */}
          <div className="form-group" style={{padding:'0 24px 16px'}}>
            <label>Meeting Link <span className="label-hint">(Google Meet / Zoom)</span></label>
            <div className="meet-row">
              <input
                type="url"
                placeholder="Paste meeting link or generate one →"
                value={meetLink}
                onChange={e=>setMeetLink(e.target.value)}
              />
              <button type="button" className="btn-meet-google" onClick={generateMeetLink} title="Open Google Meet">
                🎥 Google Meet
              </button>
              <button type="button" className="btn-meet-zoom"
                onClick={()=>window.open('https://zoom.us/start/videomeeting','_blank')}
                title="Open Zoom">
                📹 Zoom
              </button>
            </div>
            <span className="label-hint">Click Google Meet / Zoom → copy the link → paste above</span>
          </div>

          <div className="modal-actions" style={{padding:'16px 24px 24px'}}>
            <button type="button" className="btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading||!selDate||!selTime||!selType||!selEmp}>
              {loading ? '⏳ Booking...' : '✅ Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
