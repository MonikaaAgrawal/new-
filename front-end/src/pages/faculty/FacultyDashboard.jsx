import React, { useEffect, useState, useRef } from 'react'
import { API } from '../../context/AuthContext'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import {
  Users, ClipboardList, Upload, PenLine,
  Search, ChevronDown, CheckCircle, XCircle,
  FileSpreadsheet, RefreshCw, BookOpen
} from 'lucide-react'

// ─── Helpers ────────────────────────────────────────────────────────────────
const today = () => new Date().toISOString().slice(0, 10)

function cgpaClass(v) {
  if (v >= 8) return { bg: '#dcfce7', color: '#16a34a' }
  if (v >= 6) return { bg: '#fef9c3', color: '#ca8a04' }
  return { bg: '#fee2e2', color: '#dc2626' }
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function StatBox({ icon: Icon, label, value, color }) {
  return (
    <div style={{
      flex: 1, minWidth: 130,
      background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14,
      padding: '18px 20px', borderTop: `4px solid ${color}`,
      boxShadow: '0 1px 4px rgba(0,0,0,.06)'
    }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
        <Icon size={18} color={color} />
      </div>
      <div style={{ fontSize: 26, fontWeight: 900, color: '#1e293b', fontFamily: 'Outfit, sans-serif', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function FacultyDashboard() {
  const { user } = useAuth()

  // Profile
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)

  // Students
  const [students, setStudents] = useState([])
  const [studentsLoading, setStudentsLoading] = useState(false)
  const [searchEnroll, setSearchEnroll] = useState('')
  const [searchName, setSearchName] = useState('')

  // Active tab
  const [tab, setTab] = useState('overview') // overview | attendance | marks

  // Attendance
  const [attDate, setAttDate] = useState(today())
  const [attendance, setAttendance] = useState({}) // { enrollmentNumber: 'Present'|'Absent' }
  const [submittingAtt, setSubmittingAtt] = useState(false)
  const [existingAtt, setExistingAtt] = useState([])
  const [attLoading, setAttLoading] = useState(false)

  // Marks – manual
  const [marksForm, setMarksForm] = useState({ enrollmentNumber: '', theoryMarks: '', practicalMarks: '' })
  const [savingMarks, setSavingMarks] = useState(false)

  // Marks – excel
  const [excelFile, setExcelFile] = useState(null)
  const [uploadingExcel, setUploadingExcel] = useState(false)
  const [uploadResult, setUploadResult] = useState(null)
  const fileRef = useRef()

  // Marks – existing list
  const [marksList, setMarksList] = useState([])
  const [marksLoading, setMarksLoading] = useState(false)

  // ── Fetch profile ──────────────────────────────────────────────────────────
  useEffect(() => {
    API.get('/faculty/profile')
      .then(r => setProfile(r.data.data))
      .catch(() => toast.error('Could not load faculty profile'))
      .finally(() => setProfileLoading(false))
  }, [])

  // ── Fetch students ─────────────────────────────────────────────────────────
  const fetchStudents = (enroll = '', name = '') => {
    setStudentsLoading(true)
    const params = {}
    if (enroll) params.enrollmentNumber = enroll
    if (name) params.name = name
    API.get('/faculty/students', { params })
      .then(r => {
        const list = r.data.data || []
        setStudents(list)
        // default all Present
        const map = {}
        list.forEach(s => { map[s.enrollmentNumber] = 'Present' })
        setAttendance(map)
      })
      .catch(() => toast.error('Failed to load students'))
      .finally(() => setStudentsLoading(false))
  }

  useEffect(() => { fetchStudents() }, [])

  // ── Fetch existing attendance for selected date ────────────────────────────
  const fetchAttendance = (date) => {
    setAttLoading(true)
    API.get('/faculty/attendance', { params: { date } })
      .then(r => {
        const records = r.data.data || []
        setExistingAtt(records)
        // Pre-fill toggles
        const map = {}
        students.forEach(s => { map[s.enrollmentNumber] = 'Present' })
        records.forEach(rec => { map[rec.enrollmentNumber] = rec.status })
        setAttendance(map)
      })
      .catch(() => {})
      .finally(() => setAttLoading(false))
  }

  useEffect(() => {
    if (tab === 'attendance' && students.length > 0) fetchAttendance(attDate)
  }, [tab, attDate, students.length])

  // ── Fetch marks list ───────────────────────────────────────────────────────
  const fetchMarks = () => {
    setMarksLoading(true)
    API.get('/faculty/marks')
      .then(r => setMarksList(r.data.data || []))
      .catch(() => {})
      .finally(() => setMarksLoading(false))
  }

  useEffect(() => {
    if (tab === 'marks') fetchMarks()
  }, [tab])

  // ── Submit attendance ──────────────────────────────────────────────────────
  const submitAttendance = async () => {
    if (!students.length) return toast.error('No students loaded')
    setSubmittingAtt(true)
    try {
      const records = students.map(s => ({
        enrollmentNumber: s.enrollmentNumber,
        date: attDate,
        status: attendance[s.enrollmentNumber] || 'Present'
      }))
      await API.post('/faculty/attendance', { records })
      toast.success(`Attendance saved for ${records.length} students!`)
      fetchAttendance(attDate)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save attendance')
    } finally {
      setSubmittingAtt(false)
    }
  }

  // ── Submit manual marks ────────────────────────────────────────────────────
  const submitManualMarks = async (e) => {
    e.preventDefault()
    if (!marksForm.enrollmentNumber) return toast.error('Enrollment number required')
    setSavingMarks(true)
    try {
      await API.post('/faculty/manual-marks', {
        enrollmentNumber: marksForm.enrollmentNumber.toUpperCase(),
        theoryMarks: parseFloat(marksForm.theoryMarks) || 0,
        practicalMarks: parseFloat(marksForm.practicalMarks) || 0
      })
      toast.success('Marks saved!')
      setMarksForm({ enrollmentNumber: '', theoryMarks: '', practicalMarks: '' })
      fetchMarks()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save marks')
    } finally {
      setSavingMarks(false)
    }
  }

  // ── Upload Excel marks ─────────────────────────────────────────────────────
  const uploadExcel = async () => {
    if (!excelFile) return toast.error('Select a file first')
    setUploadingExcel(true)
    setUploadResult(null)
    try {
      const fd = new FormData()
      fd.append('file', excelFile)
      const { data } = await API.post('/faculty/upload-marks', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setUploadResult(data)
      toast.success(`Saved: ${data.data?.saved?.length || 0} records`)
      setExcelFile(null)
      fetchMarks()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Upload failed')
    } finally {
      setUploadingExcel(false)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  if (profileLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 12 }}>
      <div className="spinner" /><span style={{ color: 'var(--text-muted)' }}>Loading faculty data…</span>
    </div>
  )

  if (!profile) return (
    <div className="card" style={{ textAlign: 'center', padding: 64, color: 'var(--text-muted)' }}>
      Faculty profile not found. Contact the administrator.
    </div>
  )

  const present = students.filter(s => attendance[s.enrollmentNumber] === 'Present').length
  const absent = students.length - present

  const tabs = [
    { id: 'overview',   label: 'Overview',   icon: BookOpen },
    { id: 'attendance', label: 'Attendance', icon: ClipboardList },
    { id: 'marks',      label: 'Marks',      icon: PenLine },
  ]

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="page-enter" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ── Header ── */}
      <div style={{
        background: 'linear-gradient(135deg, #7c3aed 0%, #9d5cf5 100%)',
        borderRadius: 20, padding: '24px 28px', marginBottom: 24,
        boxShadow: '0 8px 32px rgba(124,58,237,0.25)', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: 'rgba(255,255,255,0.18)', border: '2px solid rgba(255,255,255,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, fontWeight: 900, color: '#fff', fontFamily: 'Outfit, sans-serif', flexShrink: 0
          }}>
            {profile.name?.charAt(0)}
          </div>
          <div style={{ flex: 1, color: '#fff' }}>
            <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.02em' }}>{profile.name}</div>
            <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>Faculty ID: {profile.facultyId}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
              <span style={{ padding: '3px 12px', borderRadius: 99, fontSize: 12, fontWeight: 700, background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)' }}>
                📚 {profile.subject}
              </span>
              {profile.subjectCode && (
                <span style={{ padding: '3px 12px', borderRadius: 99, fontSize: 12, fontWeight: 700, background: 'rgba(255,255,255,0.15)', fontFamily: 'monospace' }}>
                  {profile.subjectCode}
                </span>
              )}
              <span style={{ padding: '3px 12px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: 'rgba(255,255,255,0.12)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Faculty
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.15)', borderRadius: 14, padding: '12px 20px', border: '1px solid rgba(255,255,255,0.25)' }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', fontFamily: 'Outfit, sans-serif', lineHeight: 1 }}>{students.length}</div>
              <div style={{ fontSize: 10, opacity: 0.8, marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#fff' }}>Students</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat Row ── */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
        <StatBox icon={Users}         label="Total Students"  value={students.length} color="#7c3aed" />
        <StatBox icon={CheckCircle}   label="Present Today"   value={present}         color="#059669" />
        <StatBox icon={XCircle}       label="Absent Today"    value={absent}          color="#dc2626" />
        <StatBox icon={PenLine}       label="Marks Entered"   value={marksList.length} color="#2563eb" />
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 22, background: '#fff', padding: 6, borderRadius: 16, border: '1px solid #e2e8f0', width: 'fit-content', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
        {tabs.map(t => {
          const active = tab === t.id
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '9px 18px', borderRadius: 12, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 700, fontFamily: 'Outfit, sans-serif',
              transition: 'all 0.18s',
              background: active ? '#7c3aed' : 'transparent',
              color: active ? '#fff' : '#64748b',
              boxShadow: active ? '0 4px 14px rgba(124,58,237,0.35)' : 'none',
            }}>
              <t.icon size={14} />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* ══════════════════ OVERVIEW TAB ══════════════════ */}
      {tab === 'overview' && (
        <div>
          {/* Search bar */}
          <div className="card" style={{ marginBottom: 16, padding: '14px 18px' }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div className="form-group" style={{ flex: 2, minWidth: 180 }}>
                <label className="form-label">Search by Enrollment No.</label>
                <div style={{ position: 'relative' }}>
                  <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input className="form-input" placeholder="e.g. 0101IT221001" value={searchEnroll}
                    onChange={e => setSearchEnroll(e.target.value)}
                    style={{ paddingLeft: 32 }}
                    onKeyDown={e => { if (e.key === 'Enter') fetchStudents(searchEnroll, searchName) }}
                  />
                </div>
              </div>
              <div className="form-group" style={{ flex: 2, minWidth: 180 }}>
                <label className="form-label">Search by Name</label>
                <input className="form-input" placeholder="Student name…" value={searchName}
                  onChange={e => setSearchName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') fetchStudents(searchEnroll, searchName) }}
                />
              </div>
              <button className="btn btn-primary" onClick={() => fetchStudents(searchEnroll, searchName)} style={{ marginBottom: 1 }}>
                <Search size={14} /> Search
              </button>
              <button className="btn btn-ghost" onClick={() => { setSearchEnroll(''); setSearchName(''); fetchStudents() }} style={{ marginBottom: 1 }}>
                <RefreshCw size={14} /> Reset
              </button>
            </div>
          </div>

          {/* Students table */}
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={15} color="var(--accent)" />
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>4th Year IT Students — {profile.subject}</span>
              <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'var(--text-muted)' }}>{students.length} students</span>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Enrollment No.</th>
                    <th>Name</th>
                    <th>Division</th>
                    <th>CGPA</th>
                    <th>Technical Skills</th>
                    <th>Placement Status</th>
                  </tr>
                </thead>
                <tbody>
                  {studentsLoading ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                        <div className="spinner" /><span style={{ color: 'var(--text-muted)' }}>Loading…</span>
                      </div>
                    </td></tr>
                  ) : students.length === 0 ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No students found</td></tr>
                  ) : students.map((s, i) => {
                    const cgpa = cgpaClass(s.cgpa)
                    return (
                      <tr key={s._id}>
                        <td style={{ color: 'var(--text-muted)', fontWeight: 700 }}>{i + 1}</td>
                        <td>
                          <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', fontWeight: 700, background: '#1e293b', color: '#7dd3fc', padding: '2px 7px', borderRadius: 6 }}>
                            {s.enrollmentNumber}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{s.name}</td>
                        <td>{s.division}</td>
                        <td>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, padding: '2px 8px', borderRadius: 7, background: cgpa.bg, color: cgpa.color }}>
                            {s.cgpa?.toFixed(2)}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                            {s.technicalSkills?.slice(0, 3).map(sk => (
                              <span key={sk} className="chip" style={{ fontSize: '0.7rem' }}>{sk}</span>
                            ))}
                            {(s.technicalSkills?.length || 0) > 3 && (
                              <span className="chip" style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>+{s.technicalSkills.length - 3}</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${s.placementStatus === 'placed' ? 'badge-green' : s.placementStatus === 'in_process' ? 'badge-amber' : 'badge-muted'}`}>
                            {s.placementStatus?.replace(/_/g, ' ')}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ ATTENDANCE TAB ══════════════════ */}
      {tab === 'attendance' && (
        <div>
          <div className="card" style={{ marginBottom: 16, padding: '14px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Date</label>
                <input type="date" className="form-input" value={attDate}
                  onChange={e => setAttDate(e.target.value)}
                  style={{ width: 170 }}
                />
              </div>
              <div style={{ display: 'flex', gap: 8, marginLeft: 'auto', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 700, background: '#dcfce7', color: '#16a34a' }}>✓ Present: {present}</span>
                <span style={{ padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 700, background: '#fee2e2', color: '#dc2626' }}>✗ Absent: {absent}</span>
                <button className="btn btn-ghost" style={{ fontSize: '0.8rem' }}
                  onClick={() => {
                    const all = {}
                    students.forEach(s => { all[s.enrollmentNumber] = 'Present' })
                    setAttendance(all)
                  }}>All Present</button>
                <button className="btn btn-ghost" style={{ fontSize: '0.8rem' }}
                  onClick={() => {
                    const all = {}
                    students.forEach(s => { all[s.enrollmentNumber] = 'Absent' })
                    setAttendance(all)
                  }}>All Absent</button>
                <button className="btn btn-primary" onClick={submitAttendance} disabled={submittingAtt}>
                  {submittingAtt ? <><div className="spinner" style={{ width: 14, height: 14 }} /> Saving…</> : <><CheckCircle size={14} /> Save Attendance</>}
                </button>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--border)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Subject: <strong style={{ color: 'var(--text-primary)' }}>{profile.subject}</strong> {profile.subjectCode && `(${profile.subjectCode})`} — Click row to toggle
            </div>
            {attLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, gap: 10 }}>
                <div className="spinner" /><span style={{ color: 'var(--text-muted)' }}>Loading…</span>
              </div>
            ) : (
              <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {students.map(s => {
                  const status = attendance[s.enrollmentNumber] || 'Present'
                  const isPresent = status === 'Present'
                  return (
                    <div key={s.enrollmentNumber}
                      onClick={() => setAttendance(prev => ({ ...prev, [s.enrollmentNumber]: isPresent ? 'Absent' : 'Present' }))}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 14,
                        padding: '12px 16px', borderRadius: 12, cursor: 'pointer',
                        background: isPresent ? '#f0fdf4' : '#fff1f2',
                        border: `1.5px solid ${isPresent ? '#bbf7d0' : '#fecdd3'}`,
                        transition: 'all 0.15s'
                      }}>
                      <div style={{ width: 38, height: 38, borderRadius: 10, background: isPresent ? '#dcfce7' : '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15, color: isPresent ? '#16a34a' : '#dc2626', fontFamily: 'Outfit, sans-serif', flexShrink: 0 }}>
                        {s.name?.charAt(0)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>{s.name}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace', marginTop: 1 }}>{s.enrollmentNumber}</div>
                      </div>
                      <div style={{
                        width: 44, height: 24, borderRadius: 99, position: 'relative',
                        background: isPresent ? '#16a34a' : '#cbd5e1',
                        transition: 'background 0.2s', flexShrink: 0
                      }}>
                        <div style={{
                          position: 'absolute', top: 3, width: 18, height: 18, borderRadius: '50%', background: '#fff',
                          left: isPresent ? 23 : 3, transition: 'left 0.2s',
                          boxShadow: '0 1px 3px rgba(0,0,0,.2)'
                        }} />
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 700, minWidth: 52, textAlign: 'right', color: isPresent ? '#16a34a' : '#dc2626' }}>
                        {status}
                      </div>
                    </div>
                  )
                })}
                {students.length === 0 && (
                  <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No students loaded. Go to Overview tab first.</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════ MARKS TAB ══════════════════ */}
      {tab === 'marks' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

          {/* Manual Entry */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
              <PenLine size={15} color="var(--accent)" />
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Manual Marks Entry</span>
            </div>
            <form onSubmit={submitManualMarks} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Enrollment Number *</label>
                <input required className="form-input" placeholder="e.g. 0101IT221001"
                  value={marksForm.enrollmentNumber}
                  onChange={e => setMarksForm({ ...marksForm, enrollmentNumber: e.target.value })}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Theory Marks (0–100)</label>
                  <input type="number" min="0" max="100" className="form-input" placeholder="e.g. 75"
                    value={marksForm.theoryMarks}
                    onChange={e => setMarksForm({ ...marksForm, theoryMarks: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Practical Marks (0–100)</label>
                  <input type="number" min="0" max="100" className="form-input" placeholder="e.g. 48"
                    value={marksForm.practicalMarks}
                    onChange={e => setMarksForm({ ...marksForm, practicalMarks: e.target.value })}
                  />
                </div>
              </div>
              <div style={{ padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: 10, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Subject: <strong style={{ color: 'var(--text-primary)' }}>{profile.subject}</strong>
              </div>
              <button type="submit" className="btn btn-primary" disabled={savingMarks} style={{ justifyContent: 'center' }}>
                {savingMarks ? <><div className="spinner" style={{ width: 14, height: 14 }} /> Saving…</> : <><PenLine size={14} /> Save Marks</>}
              </button>
            </form>
          </div>

          {/* Excel Upload */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
              <FileSpreadsheet size={15} color="var(--blue)" />
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Upload Marks via Excel</span>
            </div>

            {/* Format hint */}
            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: '0.78rem' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Required Excel columns:</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {['EnrollmentNumber', 'TheoryMarks', 'PracticalMarks'].map(col => (
                  <span key={col} style={{ fontFamily: 'monospace', fontSize: '0.72rem', background: '#1e293b', color: '#7dd3fc', padding: '2px 7px', borderRadius: 5 }}>{col}</span>
                ))}
              </div>
            </div>

            {/* Drop zone */}
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                border: `2px dashed ${excelFile ? '#16a34a' : 'var(--border-light)'}`,
                borderRadius: 12, padding: '28px 16px', textAlign: 'center',
                cursor: 'pointer', marginBottom: 14,
                background: excelFile ? '#f0fdf4' : 'var(--bg-elevated)',
                transition: 'all 0.2s'
              }}>
              <input ref={fileRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }}
                onChange={e => { setExcelFile(e.target.files[0]); setUploadResult(null) }} />
              <FileSpreadsheet size={32} color={excelFile ? '#16a34a' : 'var(--text-muted)'} style={{ marginBottom: 8 }} />
              {excelFile ? (
                <>
                  <div style={{ fontWeight: 700, color: '#16a34a', marginBottom: 4 }}>{excelFile.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{(excelFile.size / 1024).toFixed(1)} KB — click to change</div>
                </>
              ) : (
                <>
                  <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Click to select Excel file</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>.xlsx or .xls only</div>
                </>
              )}
            </div>

            <button className="btn btn-primary" onClick={uploadExcel} disabled={!excelFile || uploadingExcel} style={{ width: '100%', justifyContent: 'center' }}>
              {uploadingExcel ? <><div className="spinner" style={{ width: 14, height: 14 }} /> Uploading…</> : <><Upload size={14} /> Upload & Process</>}
            </button>

            {uploadResult && (
              <div style={{ marginTop: 12, padding: '12px 14px', background: 'var(--bg-elevated)', borderRadius: 10, fontSize: '0.8rem' }}>
                <div style={{ fontWeight: 700, color: 'var(--green)', marginBottom: 4 }}>✓ Saved: {uploadResult.data?.saved?.length || 0}</div>
                {uploadResult.data?.notFound?.length > 0 && (
                  <div style={{ color: 'var(--red)', marginBottom: 2 }}>✗ Not found: {uploadResult.data.notFound.join(', ')}</div>
                )}
                {uploadResult.data?.errors?.length > 0 && (
                  <div style={{ color: 'var(--amber)' }}>⚠ Errors: {uploadResult.data.errors.length}</div>
                )}
              </div>
            )}
          </div>

          {/* Marks Table — full width */}
          <div className="card" style={{ gridColumn: '1 / -1', padding: 0 }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <PenLine size={15} color="var(--blue)" />
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Entered Marks — {profile.subject}</span>
              <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'var(--text-muted)' }}>{marksList.length} records</span>
              <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={fetchMarks}>
                <RefreshCw size={12} /> Refresh
              </button>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Enrollment No.</th><th>Theory</th><th>Practical</th><th>Total</th><th>Via</th><th>Updated</th></tr>
                </thead>
                <tbody>
                  {marksLoading ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32 }}><div className="spinner" style={{ margin: '0 auto' }} /></td></tr>
                  ) : marksList.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No marks entered yet</td></tr>
                  ) : marksList.map(m => (
                    <tr key={m._id}>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', fontWeight: 700, background: '#1e293b', color: '#7dd3fc', padding: '2px 7px', borderRadius: 6 }}>
                          {m.enrollmentNumber}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{m.theoryMarks ?? '—'}</td>
                      <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{m.practicalMarks ?? '—'}</td>
                      <td>
                        <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, color: 'var(--accent)' }}>
                          {(m.theoryMarks || 0) + (m.practicalMarks || 0)}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 99,
                          background: m.uploadedVia === 'excel' ? '#dcfce7' : '#dbeafe',
                          color: m.uploadedVia === 'excel' ? '#16a34a' : '#1d4ed8'
                        }}>
                          {m.uploadedVia}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                        {m.updatedAt ? new Date(m.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}