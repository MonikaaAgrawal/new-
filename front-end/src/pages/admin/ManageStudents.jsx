import React from 'react'
import { useEffect, useState } from 'react'
import { API } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { Search, Plus, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react'

const statusOpts = [
  { value:'', label:'All Status' },
  { value:'not_started',    label:'Not Started'    },
  { value:'in_process',     label:'In Process'     },
  { value:'placed',         label:'Placed'         },
  { value:'opted_out',      label:'Opted Out'      },
  { value:'higher_studies', label:'Higher Studies' },
]
const statusBadge = { placed:'badge-green', in_process:'badge-amber', not_started:'badge-muted', opted_out:'badge-red', higher_studies:'badge-blue' }
const emptyForm = { enrollmentNumber:'', name:'', email:'', phone:'', division:'A', batch:'2021-2025', cgpa:'', technicalSkills:'', programmingLanguages:'', placementStatus:'not_started' }

export default function ManageStudents() {
  const [students,   setStudents]  = useState([])
  const [total,      setTotal]     = useState(0)
  const [page,       setPage]      = useState(1)
  const [loading,    setLoading]   = useState(false)
  const [search,     setSearch]    = useState('')
  const [status,     setStatus]    = useState('')
  const [cgpaMin,    setCgpaMin]   = useState('')
  const [showModal,  setShowModal] = useState(false)
  const [form,       setForm]      = useState(emptyForm)
  const [saving,     setSaving]    = useState(false)
  const limit = 15

  const fetchStudents = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit })
      if (search)  params.set('search', search)
      if (status)  params.set('status', status)
      if (cgpaMin) params.set('cgpa', cgpaMin)
      const { data } = await API.get(`/students?${params}`)
      setStudents(data.data)
      setTotal(data.total)
    } catch { toast.error('Failed to load students') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchStudents() }, [page, status])

  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchStudents() }

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form, cgpa: parseFloat(form.cgpa), technicalSkills: form.technicalSkills.split(',').map(s => s.trim()).filter(Boolean), programmingLanguages: form.programmingLanguages.split(',').map(s => s.trim()).filter(Boolean) }
      await API.post('/students', payload)
      toast.success('Student created!')
      setShowModal(false); setForm(emptyForm); fetchStudents()
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  const handleDelete = async (enroll) => {
    if (!confirm(`Deactivate student ${enroll}?`)) return
    try { await API.delete(`/students/${enroll}`); toast.success('Student deactivated'); fetchStudents() }
    catch { toast.error('Failed') }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="page-enter">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:'1.5rem', fontWeight:800, letterSpacing:'-0.03em' }}>Manage Students</h1>
          <p style={{ color:'var(--text-muted)', fontSize:'0.875rem', marginTop:4 }}>{total} total students</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={15} /> Add Student</button>
      </div>

      <div className="card" style={{ marginBottom:20, padding:'16px 20px' }}>
        <form onSubmit={handleSearch} style={{ display:'flex', gap:12, flexWrap:'wrap', alignItems:'flex-end' }}>
          <div className="form-group" style={{ flex:2, minWidth:200 }}>
            <label className="form-label">Search</label>
            <div style={{ position:'relative' }}>
              <Search size={14} style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
              <input className="form-input" placeholder="Name or Enrollment No." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft:32 }} />
            </div>
          </div>
          <div className="form-group" style={{ minWidth:160 }}>
            <label className="form-label">Status</label>
            <select className="form-input" value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}>
              {statusOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ minWidth:120 }}>
            <label className="form-label">Min CGPA</label>
            <input type="number" className="form-input" placeholder="e.g. 7.0" value={cgpaMin} onChange={e => setCgpaMin(e.target.value)} min="0" max="10" step="0.1" />
          </div>
          <button type="submit" className="btn btn-primary"><Search size={14} /> Search</button>
        </form>
      </div>

      <div className="card" style={{ padding:0 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Enrollment</th><th>Name</th><th>CGPA</th><th>Division</th><th>Status</th><th>Score</th><th>Skills</th><th>Action</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ textAlign:'center', padding:40, color:'var(--text-muted)' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}><div className="spinner" /> Loading…</div>
                </td></tr>
              ) : students.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign:'center', padding:40, color:'var(--text-muted)' }}>No students found</td></tr>
              ) : students.map(s => (
                <tr key={s._id}>
                  <td style={{ color:'var(--accent)', fontFamily:'var(--font-display)', fontWeight:700, fontSize:'0.8rem' }}>{s.enrollmentNumber}</td>
                  <td style={{ color:'var(--text-primary)', fontWeight:500 }}>{s.name}</td>
                  <td style={{ fontFamily:'var(--font-display)', fontWeight:700 }}>{s.cgpa?.toFixed(1)}</td>
                  <td>{s.division}</td>
                  <td><span className={`badge ${statusBadge[s.placementStatus] || 'badge-muted'}`}>{s.placementStatus?.replace(/_/g,' ')}</span></td>
                  <td><span className={s.placementReadinessScore >= 70 ? 'score-high' : s.placementReadinessScore >= 40 ? 'score-medium' : 'score-low'} style={{ fontFamily:'var(--font-display)', fontWeight:700 }}>{s.placementReadinessScore || 0}</span></td>
                  <td><div style={{ display:'flex', gap:4 }}>{s.technicalSkills?.slice(0,2).map(sk => <span key={sk} className="chip">{sk}</span>)}{s.technicalSkills?.length > 2 && <span className="chip">+{s.technicalSkills.length-2}</span>}</div></td>
                  <td><button onClick={() => handleDelete(s.enrollmentNumber)} className="btn btn-danger" style={{ padding:'5px 10px', fontSize:'0.75rem' }}><Trash2 size={12} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div style={{ padding:'16px 20px', borderTop:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <span style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>Page {page} of {totalPages} — {total} students</span>
            <div style={{ display:'flex', gap:8 }}>
              <button className="btn btn-ghost" onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} style={{ padding:'6px 12px' }}><ChevronLeft size={14} /></button>
              <button className="btn btn-ghost" onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages} style={{ padding:'6px 12px' }}><ChevronRight size={14} /></button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position:'fixed', inset:0, zIndex:100, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
          <div className="card" style={{ width:'100%', maxWidth:560, maxHeight:'90vh', overflow:'auto' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
              <h3 style={{ fontFamily:'var(--font-display)', fontWeight:800 }}>Add New Student</h3>
              <button onClick={() => setShowModal(false)} style={{ color:'var(--text-muted)', cursor:'pointer' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate} style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                <div className="form-group"><label className="form-label">Enrollment No. *</label><input required className="form-input" placeholder="e.g. IT21001" value={form.enrollmentNumber} onChange={e => setForm({...form, enrollmentNumber:e.target.value})} /></div>
                <div className="form-group"><label className="form-label">Full Name *</label><input required className="form-input" placeholder="Student Name" value={form.name} onChange={e => setForm({...form, name:e.target.value})} /></div>
                <div className="form-group"><label className="form-label">Email *</label><input required type="email" className="form-input" placeholder="student@email.com" value={form.email} onChange={e => setForm({...form, email:e.target.value})} /></div>
                <div className="form-group"><label className="form-label">Phone</label><input className="form-input" placeholder="10-digit" value={form.phone} onChange={e => setForm({...form, phone:e.target.value})} /></div>
                <div className="form-group"><label className="form-label">Division</label><select className="form-input" value={form.division} onChange={e => setForm({...form, division:e.target.value})}>{['A','B','C','D'].map(d => <option key={d}>{d}</option>)}</select></div>
                <div className="form-group"><label className="form-label">CGPA *</label><input required type="number" step="0.01" min="0" max="10" className="form-input" placeholder="e.g. 7.85" value={form.cgpa} onChange={e => setForm({...form, cgpa:e.target.value})} /></div>
                <div className="form-group"><label className="form-label">Batch</label><input className="form-input" placeholder="2021-2025" value={form.batch} onChange={e => setForm({...form, batch:e.target.value})} /></div>
                <div className="form-group"><label className="form-label">Placement Status</label><select className="form-input" value={form.placementStatus} onChange={e => setForm({...form, placementStatus:e.target.value})}>{statusOpts.slice(1).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
              </div>
              <div className="form-group"><label className="form-label">Technical Skills (comma separated)</label><input className="form-input" placeholder="React, Node.js, MongoDB" value={form.technicalSkills} onChange={e => setForm({...form, technicalSkills:e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Programming Languages (comma separated)</label><input className="form-input" placeholder="JavaScript, Python, Java" value={form.programmingLanguages} onChange={e => setForm({...form, programmingLanguages:e.target.value})} /></div>
              <div style={{ display:'flex', gap:10, marginTop:8 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)} style={{ flex:1, justifyContent:'center' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex:1, justifyContent:'center' }}>
                  {saving ? <><div className="spinner" style={{ width:14, height:14 }} /> Saving…</> : 'Create Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}