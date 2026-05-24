import { useState, useEffect } from 'react'
import { getDemoRequests, getDemoRequestStats, updateDemoRequest, deleteDemoRequest } from '../services/api'
import { motion, AnimatePresence } from 'framer-motion'
import { Modal } from '../components/ui/Modal'
import { toast } from 'sonner'
import { PageWrapper } from '../components/ui/PageWrapper'

export default function DemoRequests() {
  const [requests, setRequests] = useState([])
  const [stats, setStats] = useState({ New: 0, Scheduled: 0, Completed: 0, Cancelled: 0, Total: 0 })
  const [filter, setFilter] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  
  // Modal state
  const [selectedReq, setSelectedReq] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [reviewData, setReviewData] = useState({ 
    status: 'Approved', 
    planType: 'Starter', 
    trialDurationDays: 7, 
    admin_notes: '' 
  })

  useEffect(() => {
    fetchData()
  }, [filter])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [reqRes, statRes] = await Promise.all([
        getDemoRequests(filter !== 'All' ? { status: filter } : {}),
        getDemoRequestStats()
      ])
      if (reqRes.data.success) setRequests(reqRes.data.data)
      if (statRes.data.success) setStats(statRes.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateDemoRequest(id, { status: newStatus })
      toast.success(`Request marked as ${newStatus}`)
      fetchData()
    } catch (err) {
      toast.error("Failed to update status")
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this demo request?")) return
    try {
      await deleteDemoRequest(id)
      toast.success("Demo request deleted")
      fetchData()
    } catch (err) {
      toast.error("Failed to delete request")
    }
  }

  const openReviewModal = (req) => {
    setSelectedReq(req)
    setReviewData({ 
      status: 'Approved',
      planType: req.planType || 'Starter',
      trialDurationDays: 7,
      admin_notes: req.admin_notes || '' 
    })
    setShowModal(true)
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    try {
      await updateDemoRequest(selectedReq._id, reviewData)
      toast.success("Review submitted successfully")
      setShowModal(false)
      fetchData()
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to update demo request"
      toast.error(msg)
    }
  }

  return (
    <PageWrapper>
      <div className="page-header">
        <div>
          <h1 className="page-title">Demo Requests</h1>
          <p className="page-sub">Manage incoming demo requests from the landing page</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        {['Pending', 'Approved', 'Rejected', 'Cancelled', 'Expired'].map(status => (
          <div key={status} className="card p-4 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 transition-colors"
               onClick={() => setFilter(status)}
               style={{ borderColor: filter === status ? 'var(--primary)' : '' }}>
            <div className="text-3xl font-black mb-1">{stats[status] || 0}</div>
            <div className="text-xs uppercase tracking-wider text-slate-500 font-bold">{status}</div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="card flex-1">
        {/* Filters and Search */}
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex gap-2 flex-wrap">
            {['All', 'Pending', 'Approved', 'Rejected', 'Cancelled', 'Expired'].map(status => (
              <button 
                key={status}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${filter === status ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                onClick={() => setFilter(status)}
              >
                {status}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <input 
              type="text" 
              placeholder="Search name, email, company..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-3 pr-4 py-1.5 text-sm outline-none focus:border-indigo-500 transition-colors text-white placeholder-slate-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading requests...</div>
          ) : requests.filter(r => 
              r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
              r.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
              r.company_name.toLowerCase().includes(searchTerm.toLowerCase())
            ).length === 0 ? (
            <div className="p-8 text-center text-slate-500">No demo requests found.</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900 text-slate-400">
                <tr>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Company</th>
                  <th className="p-4">Plan & Status</th>
                  <th className="p-4">Submitted</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {requests.filter(r => 
                  r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  r.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  r.company_name.toLowerCase().includes(searchTerm.toLowerCase())
                ).map(req => (
                  <tr key={req._id} className="hover:bg-slate-800/20">
                    <td className="p-4">
                      <div className="font-bold">{req.name}</div>
                      <div className="text-xs text-slate-500">{req.email}</div>
                      <div className="text-xs text-slate-500">{req.phone}</div>
                    </td>
                    <td className="p-4 font-medium">{req.company_name}</td>
                    <td className="p-4">
                      <div className="text-xs font-bold mb-1 text-indigo-400">{req.planType}</div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                        ${req.status === 'Pending' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : ''}
                        ${req.status === 'Approved' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : ''}
                        ${req.status === 'Rejected' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : ''}
                        ${req.status === 'Expired' ? 'bg-slate-500/10 text-slate-400 border border-slate-500/20' : ''}
                        ${req.status === 'Cancelled' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : ''}
                      `}>
                        {req.status}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-slate-400">
                      {new Date(req.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        {req.status === 'Pending' && (
                          <button onClick={() => openReviewModal(req)} className="btn-primary text-xs px-3 py-1">Review</button>
                        )}
                        {req.status === 'Approved' && (
                          <button onClick={() => handleUpdateStatus(req._id, 'Cancelled')} className="bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs px-3 py-1 rounded-lg">Revoke Access</button>
                        )}
                        <button onClick={() => handleDelete(req._id)} className="bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-xs px-3 py-1 rounded-lg ml-2">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Review Modal */}
      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        title="Review Demo Request"
        maxWidth={500}
      >
        <div className="p-4 bg-slate-900/50 text-sm border border-slate-800 rounded-xl mb-6">
          <div className="mb-2"><span className="text-slate-500">Client:</span> {selectedReq?.name} ({selectedReq?.company_name})</div>
          <div className="mb-2"><span className="text-slate-500">Email:</span> {selectedReq?.email}</div>
          <div><span className="text-slate-500">Message:</span> {selectedReq?.message || 'No message provided.'}</div>
        </div>

        <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Decision</label>
            <select value={reviewData.status} onChange={e => setReviewData({...reviewData, status: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm focus:border-indigo-500 outline-none">
              <option value="Approved">Approve (Create Demo Account)</option>
              <option value="Rejected">Reject</option>
            </select>
          </div>

          {reviewData.status === 'Approved' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Trial Plan</label>
                <select value={reviewData.planType} onChange={e => setReviewData({...reviewData, planType: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm focus:border-indigo-500 outline-none">
                  <option value="Starter">Starter</option>
                  <option value="Professional">Professional</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Duration (Days)</label>
                <select value={reviewData.trialDurationDays} onChange={e => setReviewData({...reviewData, trialDurationDays: parseInt(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm focus:border-indigo-500 outline-none">
                  <option value={3}>3 Days</option>
                  <option value={7}>7 Days</option>
                  <option value={14}>14 Days</option>
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">Admin Notes</label>
            <textarea rows="3" value={reviewData.admin_notes} onChange={e => setReviewData({...reviewData, admin_notes: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm focus:border-indigo-500 outline-none resize-none" placeholder="Internal notes..." />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-white transition-colors">Cancel</button>
            <button type="submit" className="btn-primary px-6 py-2 text-sm rounded-lg">Confirm</button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  )
}
