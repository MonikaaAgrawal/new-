// pages/admin/FacultyManagement.jsx
// Drop into your admin pages folder

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { BookOpen, User, Mail, Hash, ChevronRight, GraduationCap } from 'lucide-react'

const api = axios.create({ baseURL: '/api' })
api.interceptors.request.use(cfg => {
  const t = localStorage.getItem('token')
  if (t) cfg.headers.Authorization = `Bearer ${t}`
  return cfg
})

const SUBJECT_META = {
  'Advanced Computer Networks': { color: '#f5a623', bg: 'rgba(245,166,35,0.08)', code: 'ACN701' },
  'Blockchain Technology':       { color: '#3b82f6', bg: 'rgba(59,130,246,0.08)',  code: 'BCT702' },
  'Information Security':        { color: '#a855f7', bg: 'rgba(168,85,247,0.08)', code: 'ISC703' },
}

function FacultyCard({ faculty, onSelect, selected }) {
  const meta = SUBJECT_META[faculty.subject] || { color: 'var(--accent)', bg: 'rgba(245,166,35,0.08)', code: '—' }

  return (
    <div
      onClick={() => onSelect(faculty)}
      style={{
        background:    selected ? meta.bg : 'var(--bg-surface)',
        border:        `1px solid ${selected ? meta.color + '60' : 'var(--border)'}`,
        borderRadius:  14,
        padding:       24,
        cursor:        'pointer',
        transition:    'all 0.2s',
        position:      'relative',
        overflow:      'hidden'
      }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.borderColor = meta.color + '40' }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.borderColor = 'var(--border)' }}
    >
      {/* Accent stripe */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: meta.color, borderRadius: '14px 0 0 14px' }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', paddingLeft: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: meta.bg, border: `1px solid ${meta.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={18} color={meta.color} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '-0.02em' }}>{faculty.name}</div>
              <div style={{ fontSize: '0.7rem', color: meta.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{faculty.facultyId}</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingLeft: 4 }}>
            <Row icon={<BookOpen size={13} />} label="Subject" value={faculty.subject} color={meta.color} />
            <Row icon={<Hash size={13} />}     label="Code"    value={meta.code} />
            <Row icon={<Mail size={13} />}     label="Email"   value={faculty.email} />
          </div>
        </div>
        <ChevronRight size={16} color={selected ? meta.color : 'var(--text-muted)'} style={{ transition: 'transform 0.2s', transform: selected ? 'rotate(90deg)' : 'none', marginTop: 4 }} />
      </div>
    </div>
  )
}

const Row = ({ icon, label, value, color }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem' }}>
    <span style={{ color: color || 'var(--text-muted)' }}>{icon}</span>
    <span style={{ color: 'var(--text-muted)', minWidth: 52 }}>{label}:</span>
    <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{value}</span>
  </div>
)

function FacultyDetail({ faculty }) {
  const [stats, setStats] = useState({ students: 0, marksCount: 0, attendanceCount: 0 })
  const meta = SUBJECT_META[faculty.subject] || { color: 'var(--accent)', bg: 'rgba(245,166,35,0.08)' }

  // In a real app you'd fetch per-faculty stats. We show static for now.
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <User size={24} color={meta.color} />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.03em' }}>{faculty.name}</div>
          <div style={{ fontSize: '0.8rem', color: meta.color, fontWeight: 700 }}>{faculty.subject}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{faculty.email}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
        <InfoBox label="Faculty ID"   value={faculty.facultyId}  color={meta.color} />
        <InfoBox label="Subject Code" value={SUBJECT_META[faculty.subject]?.code || '—'} color={meta.color} />
        <InfoBox label="Department"   value="IT Dept."           />
        <InfoBox label="Year Assigned" value="4th Year (Sem 7–8)" />
      </div>

      <div style={{ background: meta.bg, border: `1px solid ${meta.color}20`, borderRadius: 10, padding: 16 }}>
        <div style={{ fontSize: '0.75rem', color: meta.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Demo Credentials</div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div>Email: <span style={{ fontFamily: 'monospace', color: 'var(--text-primary)' }}>{faculty.email}</span></div>
          <div>Password: <span style={{ fontFamily: 'monospace', color: 'var(--text-primary)' }}>{
            faculty.facultyId === 'FAC001' ? 'roopam123' :
            faculty.facultyId === 'FAC002' ? 'anjana123' : 'patney123'
          }</span></div>
        </div>
      </div>
    </div>
  )
}

const InfoBox = ({ label, value, color }) => (
  <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px' }}>
    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{label}</div>
    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: color || 'var(--text-primary)' }}>{value}</div>
  </div>
)

export default function FacultyManagement() {
  const [faculty,  setFaculty]  = useState([])
  const [selected, setSelected] = useState(null)
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    api.get('/faculty/all')
      .then(r => { setFaculty(r.data.faculty); if (r.data.faculty.length) setSelected(r.data.faculty[0]) })
      .catch(() => toast.error('Failed to load faculty'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', gap: 8, padding: 48, justifyContent: 'center' }}>
      {[0,1,2].map(i => <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent)', animation: `pulse 1s ${i*0.2}s infinite` }} />)}
    </div>
  )

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.03em' }}>Faculty Management</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>
          IT Department · 4th Year · {faculty.length} faculty members assigned
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 28 }}>
        {faculty.map(f => (
          <FacultyCard key={f.facultyId} faculty={f} selected={selected?.facultyId === f.facultyId} onSelect={setSelected} />
        ))}
      </div>

      {selected && <FacultyDetail faculty={selected} />}
    </div>
  )
}