import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import {
  Users, CalendarCheck, Upload, PenLine,
  Search, BookOpen, LogOut, ChevronDown,
  CheckCircle, XCircle, FileSpreadsheet, AlertCircle
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom'

// ─── helpers ────────────────────────────────────────────────────────────────
const api = axios.create({ baseURL: '/api/faculty' })
api.interceptors.request.use(cfg => {
  const t = localStorage.getItem('token')
  if (t) cfg.headers.Authorization = `Bearer ${t}`
  return cfg
})

const TABS = [
  { id: 'students',   label: 'Students',   icon: Users },
  { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
  { id: 'marks',      label: 'Marks',      icon: PenLine },
  { id: 'upload',     label: 'Upload Marks', icon: Upload },
]

// ─── STUDENTS TAB ────────────────────────────────────────────────────────────
function StudentsTab() {
  const [students, setStudents] = useState([])
  const [search,   setSearch]   = useState('')
  const [loading,  setLoading]  = useState(false)

  const fetchStudents = async (q = '') => {
    setLoading(true)
    try {
      const { data } = await api.get('/students', { params: { search: q } })
      setStudents(data.students)
    } catch { toast.error('Failed to load students') }
    finally  { setLoading(false) }
  }

  useEffect(() => { fetchStudents() }, [])

  const handleSearch = (e) => {
    setSearch(e.target.value)
    fetchStudents(e.target.value)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h3 style={{ fontWeight: 700, fontSize: '1.1rem' }}>4th Year IT Students</h3>
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input value={search} onChange={handleSearch} placeholder="Search by name or enrollment…"
            style={{ padding: '8px 12px 8px 32px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: '0.85rem', width: 280 }} />
        </div>
      </div>

      {loading ? <LoadingDots /> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Enrollment No.', 'Name', 'Semester', 'CGPA'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.length === 0
                ? <tr><td colSpan={4} style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>No students found</td></tr>
                : students.map((s, i) => (
                  <tr key={s.enrollmentNumber} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                    <td style={{ padding: '10px 14px', fontFamily: 'monospace', color: 'var(--accent)', fontWeight: 700 }}>{s.enrollmentNumber}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 500 }}>{s.name}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>Sem {s.semester}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ padding: '2px 10px', borderRadius: 99, background: s.cgpa >= 7.5 ? 'rgba(34,197,94,0.1)' : 'rgba(245,166,35,0.1)', color: s.cgpa >= 7.5 ? '#22c55e' : '#f5a623', fontWeight: 700, fontSize: '0.8rem' }}>
                        {s.cgpa ?? '—'}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── ATTENDANCE TAB ──────────────────────────────────────────────────────────
function AttendanceTab({ subject }) {
  const [students,  setStudents]  = useState([])
  const [date,      setDate]      = useState(new Date().toISOString().split('T')[0])
  const [statuses,  setStatuses]  = useState({})
  const [saving,    setSaving]    = useState(false)
  const [pastRecs,  setPastRecs]  = useState([])
  const [viewDate,  setViewDate]  = useState('')

  useEffect(() => {
    api.get('/students').then(r => {
      setStudents(r.data.students)
      const init = {}
      r.data.students.forEach(s => { init[s.enrollmentNumber] = 'Present' })
      setStatuses(init)
    }).catch(() => toast.error('Failed to load students'))
  }, [])

  const markAll = (status) => {
    const next = {}
    students.forEach(s => { next[s.enrollmentNumber] = status })
    setStatuses(next)
  }

  const save = async () => {
    setSaving(true)
    try {
      const records = students.map(s => ({ enrollmentNumber: s.enrollmentNumber, date, status: statuses[s.enrollmentNumber] || 'Absent' }))
      const { data } = await api.post('/attendance', { records })
      toast.success(data.message)
    } catch (e) { toast.error(e?.response?.data?.message || 'Save failed') }
    finally { setSaving(false) }
  }

  const loadPast = async () => {
    if (!viewDate) return
    try {
      const { data } = await api.get('/attendance', { params: { date: viewDate } })
      setPastRecs(data.records)
    } catch { toast.error('Failed to load records') }
  }

  const presentCount = Object.values(statuses).filter(v => v === 'Present').length

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', marginBottom: 20, flexWrap: 'wrap' }}>
        <div>
          <div style={labelStyle}>Date</div>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            style={inputStyle} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => markAll('Present')} style={{ ...chipBtn, background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}>✓ All Present</button>
          <button onClick={() => markAll('Absent')}  style={{ ...chipBtn, background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>✗ All Absent</button>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{presentCount}/{students.length} Present</span>
          <button onClick={save} disabled={saving} className="btn btn-primary" style={{ padding: '8px 20px' }}>
            {saving ? 'Saving…' : 'Save Attendance'}
          </button>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Enrollment No.', 'Name', 'Status'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s.enrollmentNumber} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '10px 14px', fontFamily: 'monospace', color: 'var(--accent)', fontWeight: 700 }}>{s.enrollmentNumber}</td>
                <td style={{ padding: '10px 14px', fontWeight: 500 }}>{s.name}</td>
                <td style={{ padding: '10px 14px' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {['Present', 'Absent'].map(st => (
                      <button key={st} onClick={() => setStatuses(p => ({ ...p, [s.enrollmentNumber]: st }))}
                        style={{
                          padding: '4px 14px', borderRadius: 99, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.75rem', transition: 'all 0.15s',
                          background: statuses[s.enrollmentNumber] === st
                            ? st === 'Present' ? '#22c55e' : '#ef4444'
                            : 'var(--bg-elevated)',
                          color: statuses[s.enrollmentNumber] === st ? '#fff' : 'var(--text-muted)'
                        }}>
                        {st}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View past records */}
      <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
        <h4 style={{ fontWeight: 700, marginBottom: 12 }}>View Past Attendance</h4>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input type="date" value={viewDate} onChange={e => setViewDate(e.target.value)} style={inputStyle} />
          <button onClick={loadPast} style={{ ...chipBtn, background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>Load</button>
        </div>
        {pastRecs.length > 0 && (
          <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {pastRecs.map(r => (
              <span key={r._id} style={{ padding: '4px 12px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 700, background: r.status === 'Present' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: r.status === 'Present' ? '#22c55e' : '#ef4444' }}>
                {r.enrollmentNumber}: {r.status}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── MANUAL MARKS TAB ────────────────────────────────────────────────────────
function MarksTab({ subject }) {
  const [students,  setStudents]  = useState([])
  const [marksList, setMarksList] = useState([])
  const [form,      setForm]      = useState({ enrollmentNumber: '', theoryMarks: '', practicalMarks: '' })
  const [saving,    setSaving]    = useState(false)

  useEffect(() => {
    api.get('/students').then(r => setStudents(r.data.students))
    fetchMarks()
  }, [])

  const fetchMarks = () => api.get('/marks').then(r => setMarksList(r.data.marks))

  const save = async () => {
    if (!form.enrollmentNumber) return toast.error('Select a student')
    setSaving(true)
    try {
      await api.post('/manual-marks', {
        enrollmentNumber: form.enrollmentNumber,
        theoryMarks:    Number(form.theoryMarks),
        practicalMarks: Number(form.practicalMarks)
      })
      toast.success('Marks saved!')
      setForm({ enrollmentNumber: '', theoryMarks: '', practicalMarks: '' })
      fetchMarks()
    } catch (e) { toast.error(e?.response?.data?.message || 'Save failed') }
    finally { setSaving(false) }
  }

  return (
    <div>
      {/* Entry Form */}
      <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 28 }}>
        <h4 style={{ fontWeight: 700, marginBottom: 16 }}>Enter Marks Manually</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 12, alignItems: 'flex-end' }}>
          <div>
            <div style={labelStyle}>Student</div>
            <select value={form.enrollmentNumber} onChange={e => setForm(p => ({ ...p, enrollmentNumber: e.target.value }))} style={inputStyle}>
              <option value="">— Select student —</option>
              {students.map(s => <option key={s.enrollmentNumber} value={s.enrollmentNumber}>{s.enrollmentNumber} — {s.name}</option>)}
            </select>
          </div>
          <div>
            <div style={labelStyle}>Theory Marks (0–100)</div>
            <input type="number" min={0} max={100} value={form.theoryMarks} onChange={e => setForm(p => ({ ...p, theoryMarks: e.target.value }))} style={inputStyle} placeholder="e.g. 78" />
          </div>
          <div>
            <div style={labelStyle}>Practical Marks (0–100)</div>
            <input type="number" min={0} max={100} value={form.practicalMarks} onChange={e => setForm(p => ({ ...p, practicalMarks: e.target.value }))} style={inputStyle} placeholder="e.g. 45" />
          </div>
          <button onClick={save} disabled={saving} className="btn btn-primary" style={{ padding: '10px 22px', whiteSpace: 'nowrap' }}>
            {saving ? 'Saving…' : 'Save Marks'}
          </button>
        </div>
      </div>

      {/* Existing Marks */}
      <h4 style={{ fontWeight: 700, marginBottom: 12 }}>Saved Marks — {subject}</h4>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Enrollment No.', 'Name', 'Theory', 'Practical', 'Total', 'Source'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {marksList.length === 0
              ? <tr><td colSpan={6} style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>No marks entered yet</td></tr>
              : marksList.map((m, i) => (
                <tr key={m._id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                  <td style={{ padding: '10px 14px', fontFamily: 'monospace', color: 'var(--accent)', fontWeight: 700 }}>{m.enrollmentNumber}</td>
                  <td style={{ padding: '10px 14px' }}>{m.studentName || '—'}</td>
                  <td style={{ padding: '10px 14px', fontWeight: 600 }}>{m.theoryMarks ?? '—'}</td>
                  <td style={{ padding: '10px 14px', fontWeight: 600 }}>{m.practicalMarks ?? '—'}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ fontWeight: 700, color: (m.theoryMarks + m.practicalMarks) >= 120 ? '#22c55e' : 'var(--text-primary)' }}>
                      {(m.theoryMarks ?? 0) + (m.practicalMarks ?? 0)}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 700, background: m.uploadedVia === 'excel' ? 'rgba(59,130,246,0.1)' : 'rgba(168,85,247,0.1)', color: m.uploadedVia === 'excel' ? '#3b82f6' : '#a855f7' }}>
                      {m.uploadedVia}
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── UPLOAD TAB ──────────────────────────────────────────────────────────────
function UploadTab() {
  const fileRef = useRef()
  const [file,     setFile]     = useState(null)
  const [result,   setResult]   = useState(null)
  const [uploading,setUploading]= useState(false)

  const upload = async () => {
    if (!file) return toast.error('Select an Excel file first')
    const fd = new FormData()
    fd.append('marksFile', file)
    setUploading(true)
    try {
      const { data } = await api.post('/upload-marks', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setResult(data)
      toast.success(data.message)
    } catch (e) { toast.error(e?.response?.data?.message || 'Upload failed') }
    finally { setUploading(false) }
  }

  return (
    <div>
      {/* Format Guide */}
      <div style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 12, padding: 20, marginBottom: 28 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
          <AlertCircle size={16} color="#3b82f6" />
          <span style={{ fontWeight: 700, color: '#3b82f6', fontSize: '0.875rem' }}>Required Excel Format</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ fontSize: '0.8rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['EnrollmentNumber', 'StudentName', 'TheoryMarks', 'PracticalMarks'].map(h => (
                <th key={h} style={{ padding: '6px 16px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#3b82f6', fontWeight: 700 }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              <tr>{['0827IT211040', 'Muskan Dhakariya', '82', '47'].map((v, i) => (
                <td key={i} style={{ padding: '6px 16px', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>{v}</td>
              ))}</tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        onClick={() => fileRef.current.click()}
        style={{ border: `2px dashed ${file ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 12, padding: 40, textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', background: file ? 'rgba(245,166,35,0.03)' : 'transparent' }}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) setFile(f) }}
      >
        <FileSpreadsheet size={36} style={{ color: file ? 'var(--accent)' : 'var(--text-muted)', marginBottom: 12 }} />
        {file
          ? <><div style={{ fontWeight: 700, marginBottom: 4 }}>{file.name}</div><div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{(file.size / 1024).toFixed(1)} KB</div></>
          : <><div style={{ fontWeight: 600, marginBottom: 4 }}>Drop Excel file here or click to browse</div><div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Supports .xlsx and .xls files up to 5 MB</div></>}
        <input ref={fileRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={e => setFile(e.target.files[0])} />
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <button onClick={upload} disabled={!file || uploading} className="btn btn-primary" style={{ padding: '10px 28px' }}>
          {uploading ? 'Uploading…' : 'Upload & Process'}
        </button>
        {file && <button onClick={() => { setFile(null); setResult(null) }} style={{ ...chipBtn, background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>Clear</button>}
      </div>

      {/* Result Summary */}
      {result && (
        <div style={{ marginTop: 24, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
          <div style={{ fontWeight: 700, marginBottom: 14 }}>Upload Result</div>
          <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            <Stat label="Total Rows"   value={result.total}            color="var(--text-primary)" />
            <Stat label="Imported"     value={result.success?.length}  color="#22c55e" />
            <Stat label="Failed"       value={result.failed?.length}   color="#ef4444" />
          </div>
          {result.failed?.length > 0 && (
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ef4444', marginBottom: 8 }}>Failed Records:</div>
              {result.failed.map((f, i) => (
                <div key={i} style={{ fontSize: '0.78rem', color: 'var(--text-muted)', padding: '3px 0' }}>
                  • {f.enrollmentNumber || 'Unknown'} — {f.reason}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── SMALL HELPERS ───────────────────────────────────────────────────────────
const Stat = ({ label, value, color }) => (
  <div style={{ textAlign: 'center', padding: '8px 20px', background: 'var(--bg-base)', borderRadius: 8, border: '1px solid var(--border)' }}>
    <div style={{ fontSize: '1.4rem', fontWeight: 800, color }}>{value ?? 0}</div>
    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
  </div>
)

const LoadingDots = () => (
  <div style={{ display: 'flex', gap: 6, justifyContent: 'center', padding: 40 }}>
    {[0, 1, 2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', animation: `pulse 1s ${i * 0.2}s infinite` }} />)}
  </div>
)

const labelStyle = { fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }
const inputStyle = { padding: '9px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: '0.875rem', width: '100%', outline: 'none' }
const chipBtn    = { padding: '7px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', transition: 'all 0.15s', border: 'none' }

// ─── MAIN DASHBOARD ──────────────────────────────────────────────────────────
export default function FacultyDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('students')

  const handleLogout = () => { logout(); navigate('/') }

  const subjectColor = {
    'Advanced Computer Networks': '#f5a623',
    'Blockchain Technology':       '#3b82f6',
    'Information Security':        '#a855f7',
  }
  const accent = subjectColor[user?.subject] || 'var(--accent)'

  const renderTab = () => {
    switch (activeTab) {
      case 'students':   return <StudentsTab />
      case 'attendance': return <AttendanceTab subject={user?.subject} />
      case 'marks':      return <MarksTab subject={user?.subject} />
      case 'upload':     return <UploadTab />
      default:           return null
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>

      {/* Top Nav */}
      <header style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={18} color="#0a0a0b" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '-0.02em' }}>{user?.name}</div>
            <div style={{ fontSize: '0.7rem', color: accent, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{user?.subject}</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '4px 10px', background: 'var(--bg-elevated)', borderRadius: 99, border: '1px solid var(--border)' }}>
            {user?.facultyId}
          </span>
          <button onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, background: 'transparent', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
            <LogOut size={14} /> Logout
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1 }}>

        {/* Sidebar */}
        <aside style={{ width: 220, background: 'var(--bg-surface)', borderRight: '1px solid var(--border)', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {TABS.map(tab => {
            const Icon    = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8,
                  background: isActive ? `${accent}18` : 'transparent',
                  border: isActive ? `1px solid ${accent}40` : '1px solid transparent',
                  color: isActive ? accent : 'var(--text-secondary)',
                  cursor: 'pointer', fontWeight: isActive ? 700 : 500, fontSize: '0.875rem', textAlign: 'left',
                  transition: 'all 0.15s'
                }}>
                <Icon size={16} />
                {tab.label}
              </button>
            )
          })}
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, padding: '32px 36px', overflowY: 'auto' }}>
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
              {TABS.find(t => t.id === activeTab)?.label}
            </h2>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
              Subject: <span style={{ color: accent, fontWeight: 700 }}>{user?.subject}</span>
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 28 }}>
            {renderTab()}
          </div>
        </main>

      </div>
    </div>
  )
}