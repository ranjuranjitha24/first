import { useState } from 'react'
import { analyzeResume } from '../services/api'

export default function AIAnalyzer() {
  const [isOpen, setIsOpen] = useState(false)
  const [file, setFile] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [results, setResults] = useState(null)

  const handleUpload = async (e) => {
    const selectedFile = e.target.files[0]
    if (!selectedFile) return
    
    setFile(selectedFile)
    setAnalyzing(true)
    setResults(null)
    
    const formData = new FormData()
    formData.append('file', selectedFile)
    
    try {
      const res = await analyzeResume(formData)
      setResults(res.data.data)
    } catch (err) {
      alert('Error analyzing resume')
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <>
      {/* FAB Button */}
      <button className={`ai-fab ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(!isOpen)}>
        <span className="ai-icon">✨</span>
      </button>

      {/* AI Assistant Window */}
      {isOpen && (
        <div className="ai-window">
          <div className="ai-header">
            <div className="ai-header-info">
              <div className="ai-header-icon">🤖</div>
              <div>
                <h4>Resume AI Analyzer</h4>
                <p>Powered by SmartParse</p>
              </div>
            </div>
            <button className="ai-close" onClick={() => setIsOpen(false)}>✕</button>
          </div>

          <div className="ai-body">
            {!results && !analyzing && (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>📄</div>
                <h3 style={{ marginBottom: 8 }}>Upload Candidate Resume</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
                  Our AI will extract skills, experience, and calculate an ATS match score.
                </p>
                <label className="btn-primary" style={{ cursor: 'pointer', display: 'inline-block' }}>
                  Choose File
                  <input type="file" hidden onChange={handleUpload} accept=".pdf,.doc,.docx" />
                </label>
              </div>
            )}

            {analyzing && (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div className="pulse-animation" style={{ fontSize: 48, marginBottom: 20 }}>🧠</div>
                <h3>Analyzing Profile...</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>
                  Scanning skills, checking job compatibility, and generating ATS score.
                </p>
                <div className="progress-bar-container" style={{ marginTop: 32, height: 6, background: 'var(--bg)', borderRadius: 10, overflow: 'hidden' }}>
                  <div className="progress-bar-fill" style={{ height: '100%', background: 'var(--primary)', width: '60%', transition: 'width 2s' }}></div>
                </div>
              </div>
            )}

            {results && (
              <div className="ai-results page-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div className="card" style={{ flex: 1, padding: 16, textAlign: 'center', background: 'var(--primary-glow)' }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary)' }}>{results.ats_score}%</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>ATS Score</div>
                  </div>
                  <div className="card" style={{ flex: 1, padding: 16, textAlign: 'center', background: 'var(--success-light)' }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--success)' }}>{results.match_percentage}%</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>Job Match</div>
                  </div>
                </div>

                <div className="ai-section">
                  <h5 style={{ fontSize: 12, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>AI Summary</h5>
                  <p style={{ fontSize: 13, lineHeight: 1.5, background: 'var(--bg)', padding: 12, borderRadius: 12 }}>{results.summary}</p>
                </div>

                <div className="ai-section">
                  <h5 style={{ fontSize: 12, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>Top Skills</h5>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {results.extracted_data.skills.map(s => <span key={s} className="skill-tag">{s}</span>)}
                  </div>
                </div>

                <div className="ai-section">
                  <h5 style={{ fontSize: 12, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>Recommendation</h5>
                  <div style={{ padding: '8px 12px', borderRadius: 10, background: results.recommendation === 'Shortlist' ? 'var(--success-light)' : 'var(--warning-light)', color: results.recommendation === 'Shortlist' ? 'var(--success)' : 'var(--warning)', fontWeight: 700, fontSize: 13, textAlign: 'center' }}>
                    {results.recommendation}
                  </div>
                </div>

                <button className="btn-outline" style={{ marginTop: 10 }} onClick={() => setResults(null)}>Analyze Another</button>
              </div>
            )}
          </div>

          <div className="ai-footer" style={{ padding: 16, borderTop: '1px solid var(--border)', fontSize: 11, textAlign: 'center', color: 'var(--text-muted)' }}>
            AI Assistant is here to help you hire faster.
          </div>
        </div>
      )}
    </>
  )
}
