import React, { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { API } from '../../context/AuthContext'
import {
  GraduationCap, Award, Briefcase, BookOpen, Star,
  AlertCircle, CheckCircle, TrendingUp, Calendar,
  BarChart2, Layers, Target, Code2, ChevronRight,
  Activity, Clock, Zap, ArrowUp, ArrowDown, Info
} from 'lucide-react'

const T = {
  bg:       '#f4f3ff',
  surface:  '#ffffff',
  border:   '#e8e4ff',
  elevated: '#f0eeff',
  hover:    '#ebe7ff',
  purple:  '#6d28d9',
  purpleM: '#7c3aed',
  purpleL: '#ede9ff',
  purpleXL:'#f5f3ff',
  indigo:  '#4338ca',
  indigoL: '#e0e7ff',
  green:   '#059669',
  greenL:  '#d1fae5',
  red:     '#dc2626',
  redL:    '#fee2e2',
  amber:   '#d97706',
  amberL:  '#fef3c7',
  blue:    '#2563eb',
  blueL:   '#dbeafe',
  teal:    '#0d9488',
  tealL:   '#ccfbf1',
  pink:    '#db2777',
  pinkL:   '#fce7f3',
  text:    '#1e1b4b',
  sub:     '#4c4891',
  muted:   '#7c7ab8',
  light:   '#a8a6d0',
}

const shadow = {
  sm:  '0 1px 3px rgba(109,40,217,0.07), 0 1px 2px rgba(0,0,0,0.04)',
  md:  '0 4px 16px rgba(109,40,217,0.10), 0 2px 4px rgba(0,0,0,0.04)',
  lg:  '0 12px 40px rgba(109,40,217,0.14), 0 4px 8px rgba(0,0,0,0.06)',
  xl:  '0 20px 60px rgba(109,40,217,0.18)',
}

const card = {
  background: T.surface,
  border: `1px solid ${T.border}`,
  borderRadius: 20,
  padding: 24,
  boxShadow: shadow.sm,
}

function Pill({ children, color = T.purple, bg = T.purpleL }) {
  return (
    <span style={{
      padding: '3px 12px', borderRadius: 99,
      fontSize: 11, fontWeight: 700,
      background: bg, color,
      fontFamily: 'Outfit, sans-serif',
      letterSpacing: '0.03em',
      border: `1px solid ${color}20`,
      display: 'inline-block'
    }}>{children}</span>
  )
}

function StatCard({ icon: Icon, label, value, color, bg, sub, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        ...card,
        display: 'flex', alignItems: 'center', gap: 16,
        cursor: onClick ? 'pointer' : 'default',
        transform: hov ? 'translateY(-3px)' : 'none',
        boxShadow: hov ? shadow.md : shadow.sm,
        transition: 'all 0.2s ease',
        borderTop: `3px solid ${color}`,
      }}
    >
      <div style={{
        width: 52, height: 52, borderRadius: 14,
        background: bg, display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexShrink: 0,
        boxShadow: `0 4px 12px ${color}20`
      }}>
        <Icon size={22} color={color} strokeWidth={2} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 26, fontWeight: 900, color: T.text, lineHeight: 1, fontFamily: 'Outfit, sans-serif' }}>{value}</div>
        <div style={{ fontSize: 12, color: T.muted, marginTop: 3, fontWeight: 500 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color, marginTop: 2, fontWeight: 700 }}>{sub}</div>}
      </div>
    </div>
  )
}

function ScoreRing({ score }) {
  const r = 56, c = 2 * Math.PI * r
  const dash = (score / 100) * c
  const color = score >= 70 ? T.green : score >= 40 ? T.amber : T.red
  const bg    = score >= 70 ? T.greenL : score >= 40 ? T.amberL : T.redL
  const label = score >= 70 ? '🚀 Placement Ready' : score >= 40 ? '💪 Almost Ready' : '📚 Needs Work'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div style={{ position: 'relative', width: 148, height: 148 }}>
        <svg width="148" height="148" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="74" cy="74" r={r} fill="none" stroke={T.elevated} strokeWidth="12" />
          <circle cx="74" cy="74" r={r} fill="none" stroke={color} strokeWidth="12"
            strokeDasharray={`${dash} ${c}`} strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${color}60)` }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: 34, fontWeight: 900, color: T.text, fontFamily: 'Outfit, sans-serif', lineHeight: 1 }}>{score}</div>
          <div style={{ fontSize: 10, color: T.muted, fontWeight: 600, marginTop: 2 }}>/ 100</div>
        </div>
      </div>
      <div style={{ padding: '6px 18px', borderRadius: 99, background: bg, color, fontSize: 12, fontWeight: 700, boxShadow: `0 2px 8px ${color}20` }}>
        {label}
      </div>
    </div>
  )
}

function SemBar({ sem }) {
  const color = sem.sgpa >= 8 ? T.green : sem.sgpa >= 6 ? T.purple : sem.sgpa >= 5 ? T.amber : T.red
  const pct   = (sem.sgpa / 10) * 100
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 54, fontSize: 12, color: T.muted, flexShrink: 0, fontWeight: 600 }}>Sem {sem.semester}</div>
      <div style={{ flex: 1, height: 10, background: T.elevated, borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${color}bb, ${color})`, borderRadius: 99, transition: 'width 0.8s ease' }} />
      </div>
      <div style={{ width: 40, fontSize: 14, fontWeight: 800, color, textAlign: 'right', fontFamily: 'Outfit, sans-serif' }}>{sem.sgpa}</div>
      {sem.backlogs > 0 && (
        <span style={{ fontSize: 10, color: T.red, fontWeight: 700, background: T.redL, padding: '2px 7px', borderRadius: 8 }}>⚠{sem.backlogs}</span>
      )}
    </div>
  )
}

function AttendanceRow({ item }) {
  const pct   = item.totalClasses > 0 ? parseFloat(((item.attendedClasses / item.totalClasses) * 100).toFixed(1)) : 0
  const color = pct >= 75 ? T.green : pct >= 60 ? T.amber : T.red
  const bg    = pct >= 75 ? T.greenL : pct >= 60 ? T.amberL : T.redL
  const needed = pct < 75 && item.totalClasses > 0
    ? Math.ceil((0.75 * item.totalClasses - item.attendedClasses) / 0.25)
    : 0
  return (
    <div style={{
      padding: '16px 18px',
      background: T.elevated,
      borderRadius: 14,
      border: `1px solid ${T.border}`,
      borderLeft: `4px solid ${color}`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text, fontFamily: 'Outfit, sans-serif' }}>{item.subject}</div>
          {item.subjectCode && <div style={{ fontSize: 11, color: T.muted, marginTop: 1 }}>{item.subjectCode}</div>}
        </div>
        <span style={{ padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 800, background: bg, color, fontFamily: 'Outfit, sans-serif' }}>
          {pct}%
        </span>
      </div>
      <div style={{ height: 8, background: T.border, borderRadius: 99, overflow: 'hidden', marginBottom: 8 }}>
        <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: `linear-gradient(90deg, ${color}80, ${color})`, borderRadius: 99, transition: 'width 0.8s ease' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 11, color: T.muted, fontWeight: 600 }}>
          {item.attendedClasses} / {item.totalClasses} classes attended
        </div>
        {needed > 0 && (
          <div style={{ fontSize: 10, color: T.red, fontWeight: 700, background: T.redL, padding: '2px 8px', borderRadius: 8 }}>
            Need {needed} more classes
          </div>
        )}
        {pct >= 75 && (
          <div style={{ fontSize: 10, color: T.green, fontWeight: 700 }}>✓ Safe</div>
        )}
      </div>
    </div>
  )
}

function SectionTitle({ icon: Icon, color, bg, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
      <div style={{ width: 30, height: 30, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={14} color={color} strokeWidth={2.5} />
      </div>
      <div style={{ fontSize: 14, fontWeight: 800, color: T.text, fontFamily: 'Outfit, sans-serif' }}>{children}</div>
    </div>
  )
}

const TABS = [
  { id: 'overview',   label: 'Overview',   color: T.purple, bg: T.purpleL },
  { id: 'academics',  label: 'Academics',  color: T.blue,   bg: T.blueL  },
  { id: 'attendance', label: 'Attendance', color: T.teal,   bg: T.tealL  },
  { id: 'projects',   label: 'Projects',   color: T.indigo, bg: T.indigoL},
  { id: 'placement',  label: 'Placement',  color: T.green,  bg: T.greenL },
  { id: 'skills',     label: 'Skills',     color: T.pink,   bg: T.pinkL  },
  { id: 'experience', label: 'Experience', color: T.amber,  bg: T.amberL },
]

export default function StudentDashboard() {
  const { user } = useAuth()
  const [student,    setStudent]    = useState(null)
  const [attendance, setAttendance] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [attLoading, setAttLoading] = useState(false)
  const [error,      setError]      = useState(null)
  const [tab,        setTab]        = useState('overview')

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await API.get(`/students/${user?.enrollmentNumber}`)
        setStudent(data.data)
      } catch {
        setError('Could not load your profile.')
      } finally {
        setLoading(false)
      }
    }
    if (user?.enrollmentNumber) load()
    else setLoading(false)
  }, [user])

  useEffect(() => {
    if (tab === 'attendance' && user?.enrollmentNumber && attendance.length === 0) {
      setAttLoading(true)
      API.get(`/students/${user.enrollmentNumber}/attendance`)
        .then(({ data }) => setAttendance(data.data || []))
        .catch(() => setAttendance([]))
        .finally(() => setAttLoading(false))
    }
  }, [tab])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '70vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, border: `4px solid ${T.elevated}`, borderTop: `4px solid ${T.purple}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{ color: T.muted, fontSize: 14, fontWeight: 500 }}>Loading dashboard…</div>
      </div>
    </div>
  )

  if (error || !student) return (
    <div style={{ padding: 40 }}>
      <div style={{ ...card, color: T.red, display: 'flex', gap: 12, alignItems: 'center' }}>
        <AlertCircle size={22} /> {error || 'Profile not found.'}
      </div>
    </div>
  )

  const placementMeta = {
    placed:         { color: T.green, bg: T.greenL,  label: '✅ Placed'         },
    in_process:     { color: T.amber, bg: T.amberL,  label: '🔄 In Process'     },
    not_started:    { color: T.muted, bg: '#f3f4f6', label: '⏳ Not Started'    },
    higher_studies: { color: T.blue,  bg: T.blueL,   label: '📚 Higher Studies' },
  }[student.placementStatus] || { color: T.muted, bg: '#f3f4f6', label: student.placementStatus }

  const avgAtt = attendance.length > 0
    ? Math.round(attendance.reduce((s, a) => s + (a.totalClasses > 0 ? (a.attendedClasses / a.totalClasses) * 100 : 0), 0) / attendance.length)
    : null
  const lowAtt = attendance.filter(a => a.totalClasses > 0 && (a.attendedClasses / a.totalClasses) * 100 < 75)

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", paddingBottom: 48 }}>

      {/* HERO */}
      <div style={{
        background: `linear-gradient(135deg, ${T.purple} 0%, #8b5cf6 50%, #a78bfa 100%)`,
        borderRadius: 24, padding: '28px 32px', marginBottom: 24,
        position: 'relative', overflow: 'hidden', boxShadow: shadow.xl,
      }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 260, height: 260, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, right: 140, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 22, position: 'relative', flexWrap: 'wrap' }}>
          <div style={{
            width: 80, height: 80, borderRadius: 22,
            background: 'rgba(255,255,255,0.18)',
            border: '2px solid rgba(255,255,255,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, fontWeight: 900, color: '#fff',
            fontFamily: 'Outfit, sans-serif', flexShrink: 0,
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
          }}>
            {student.name?.charAt(0)}
          </div>

          <div style={{ flex: 1, color: '#fff' }}>
            <div style={{ fontSize: 26, fontWeight: 900, fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.02em', marginBottom: 4 }}>{student.name}</div>
            <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 12, fontWeight: 500 }}>
              {student.enrollmentNumber} • {student.branch} • Batch {student.batch}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ padding: '4px 14px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)' }}>Div {student.division}</span>
              <span style={{ padding: '4px 14px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)' }}>Semester {student.semester}</span>
              <span style={{ padding: '4px 14px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: placementMeta.bg, color: placementMeta.color }}>{placementMeta.label}</span>
              {student.placedCompany && (
                <span style={{ padding: '4px 14px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: T.greenL, color: T.green }}>🎉 {student.placedCompany} • ₹{student.placedPackage} LPA</span>
              )}
            </div>
          </div>

          <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', borderRadius: 20, padding: '18px 32px', border: '1px solid rgba(255,255,255,0.3)' }}>
            <div style={{ fontSize: 48, fontWeight: 900, lineHeight: 1, fontFamily: 'Outfit, sans-serif', color: '#fff' }}>{student.cgpa}</div>
            <div style={{ fontSize: 11, opacity: 0.8, marginTop: 4, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#fff' }}>CGPA / 10.0</div>
          </div>
        </div>
      </div>

      {/* STAT CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(172px, 1fr))', gap: 14, marginBottom: 24 }}>
        <StatCard icon={GraduationCap} label="CGPA"           value={student.cgpa}                        color={T.purple} bg={T.purpleL} sub="Out of 10.0"  onClick={() => setTab('academics')}  />
        <StatCard icon={Calendar}      label="Attendance"     value={avgAtt !== null ? `${avgAtt}%` : '—'} color={avgAtt === null ? T.muted : avgAtt >= 75 ? T.teal : T.amber} bg={avgAtt === null ? T.elevated : avgAtt >= 75 ? T.tealL : T.amberL} sub={avgAtt === null ? 'Not updated yet' : avgAtt >= 75 ? 'Good Standing' : 'Low — Improve!'} onClick={() => setTab('attendance')} />
        <StatCard icon={Layers}        label="Projects"       value={student.projects?.length || 0}        color={T.indigo} bg={T.indigoL} sub="Total"         onClick={() => setTab('projects')}   />
        <StatCard icon={Award}         label="Certifications" value={student.certifications?.length || 0}  color={T.teal}   bg={T.tealL}   sub="Earned"        onClick={() => setTab('experience')} />
        <StatCard icon={Briefcase}     label="Internships"    value={student.internships?.length || 0}     color={T.amber}  bg={T.amberL}  sub="Experience"    onClick={() => setTab('experience')} />
        <StatCard icon={AlertCircle}   label="Backlogs"       value={student.totalBacklogs || 0}
          color={student.totalBacklogs > 0 ? T.red : T.green}
          bg={student.totalBacklogs > 0 ? T.redL : T.greenL}
          sub={student.totalBacklogs > 0 ? 'Needs Attention' : 'Clean Record'}
          onClick={() => setTab('academics')} />
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 22, background: T.surface, padding: 6, borderRadius: 18, border: `1px solid ${T.border}`, width: 'fit-content', flexWrap: 'wrap', boxShadow: shadow.sm }}>
        {TABS.map(t => {
          const active = tab === t.id
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '8px 18px', borderRadius: 12, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 700, fontFamily: 'Outfit, sans-serif',
              transition: 'all 0.18s ease',
              background: active ? t.color : 'transparent',
              color: active ? '#fff' : T.muted,
              boxShadow: active ? `0 4px 12px ${t.color}40` : 'none',
              transform: active ? 'scale(1.03)' : 'scale(1)',
            }}>{t.label}</button>
          )
        })}
      </div>

      {/* OVERVIEW */}
      {tab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div style={card}>
            <SectionTitle icon={Target} color={T.purple} bg={T.purpleL}>Placement Readiness</SectionTitle>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <ScoreRing score={student.placementReadinessScore || 0} />
            </div>
            {student.suggestedSkills?.length > 0 && (
              <>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.muted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Suggested Skills</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                  {student.suggestedSkills.map(s => <Pill key={s}>+ {s}</Pill>)}
                </div>
              </>
            )}
          </div>

          <div style={card}>
            <SectionTitle icon={BarChart2} color={T.blue} bg={T.blueL}>Semester Performance</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              {student.semesterResults?.map(sem => <SemBar key={sem.semester} sem={sem} />)}
            </div>
          </div>

          <div style={card}>
            <SectionTitle icon={Calendar} color={T.teal} bg={T.tealL}>Attendance Summary</SectionTitle>
            {attendance.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: T.muted }}>
                <Calendar size={32} color={T.border} style={{ margin: '0 auto 10px' }} />
                <div style={{ fontSize: 13, fontWeight: 600 }}>No attendance data yet</div>
                <div style={{ fontSize: 11, marginTop: 4 }}>Admin/TPO will update your attendance</div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                  <div style={{ flex: 1, padding: '12px 16px', background: avgAtt >= 75 ? T.tealL : T.amberL, borderRadius: 12, textAlign: 'center' }}>
                    <div style={{ fontSize: 28, fontWeight: 900, color: avgAtt >= 75 ? T.teal : T.amber, fontFamily: 'Outfit, sans-serif' }}>{avgAtt}%</div>
                    <div style={{ fontSize: 11, color: T.muted, fontWeight: 600 }}>Average</div>
                  </div>
                  <div style={{ flex: 1, padding: '12px 16px', background: lowAtt.length === 0 ? T.greenL : T.redL, borderRadius: 12, textAlign: 'center' }}>
                    <div style={{ fontSize: 28, fontWeight: 900, color: lowAtt.length === 0 ? T.green : T.red, fontFamily: 'Outfit, sans-serif' }}>{lowAtt.length}</div>
                    <div style={{ fontSize: 11, color: T.muted, fontWeight: 600 }}>Below 75%</div>
                  </div>
                </div>
                {attendance.slice(0, 3).map((a, i) => {
                  const pct = a.totalClasses > 0 ? Math.round((a.attendedClasses / a.totalClasses) * 100) : 0
                  const color = pct >= 75 ? T.teal : pct >= 60 ? T.amber : T.red
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <div style={{ fontSize: 11, color: T.sub, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>{a.subject}</div>
                      <div style={{ width: 70, height: 7, background: T.elevated, borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99 }} />
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 800, color, width: 36, textAlign: 'right', fontFamily: 'Outfit, sans-serif' }}>{pct}%</div>
                    </div>
                  )
                })}
                <button onClick={() => setTab('attendance')} style={{ marginTop: 8, fontSize: 12, color: T.teal, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                  View all <ChevronRight size={13} />
                </button>
              </>
            )}
          </div>

          <div style={card}>
            <SectionTitle icon={Star} color={T.amber} bg={T.amberL}>Achievements</SectionTitle>
            {!student.achievements?.length ? (
              <div style={{ color: T.muted, fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No achievements added yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {student.achievements.map((a, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', background: T.amberL, border: `1px solid ${T.amber}20`, borderRadius: 12 }}>
                    <Star size={14} color={T.amber} fill={T.amber} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: T.amber }}>{a}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ACADEMICS */}
      {tab === 'academics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ ...card, display: 'flex', gap: 0, flexWrap: 'wrap' }}>
            {[
              { label: 'Overall CGPA',    value: student.cgpa,                color: T.purple },
              { label: 'Total Backlogs',  value: student.totalBacklogs || 0,  color: student.totalBacklogs  > 0 ? T.red : T.green },
              { label: 'Active Backlogs', value: student.activeBacklogs || 0, color: student.activeBacklogs > 0 ? T.red : T.green },
              { label: 'Semesters Done',  value: student.semesterResults?.length || 0, color: T.blue },
            ].map((item, i) => (
              <div key={i} style={{ flex: 1, minWidth: 120, padding: '8px 24px', borderRight: i < 3 ? `1px solid ${T.border}` : 'none' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>{item.label}</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: item.color, fontFamily: 'Outfit, sans-serif', lineHeight: 1 }}>{item.value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 14 }}>
            {student.semesterResults?.map(sem => {
              const color = sem.sgpa >= 8 ? T.green : sem.sgpa >= 6 ? T.purple : sem.sgpa >= 5 ? T.amber : T.red
              return (
                <div key={sem.semester} style={{ padding: 18, background: T.surface, borderRadius: 16, border: `1px solid ${T.border}`, textAlign: 'center', borderTop: `4px solid ${color}`, boxShadow: shadow.sm }}>
                  <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Sem {sem.semester}</div>
                  <div style={{ fontSize: 38, fontWeight: 900, color, fontFamily: 'Outfit, sans-serif', lineHeight: 1 }}>{sem.sgpa}</div>
                  <div style={{ fontSize: 10, color: T.muted, marginTop: 2, fontWeight: 600 }}>SGPA</div>
                  <div style={{ marginTop: 10 }}>
                    {sem.backlogs > 0
                      ? <span style={{ padding: '3px 10px', background: T.redL, color: T.red, borderRadius: 99, fontSize: 10, fontWeight: 700 }}>⚠ {sem.backlogs}</span>
                      : <span style={{ padding: '3px 10px', background: T.greenL, color: T.green, borderRadius: 99, fontSize: 10, fontWeight: 700 }}>✅ Clean</span>
                    }
                  </div>
                </div>
              )
            })}
          </div>

          <div style={card}>
            <SectionTitle icon={BarChart2} color={T.blue} bg={T.blueL}>SGPA Trend</SectionTitle>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 130, paddingTop: 16 }}>
              {student.semesterResults?.map(sem => {
                const color = sem.sgpa >= 8 ? T.green : sem.sgpa >= 6 ? T.purple : sem.sgpa >= 5 ? T.amber : T.red
                const h = Math.max((sem.sgpa / 10) * 120, 8)
                return (
                  <div key={sem.semester} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color, fontFamily: 'Outfit, sans-serif' }}>{sem.sgpa}</div>
                    <div style={{ width: '100%', height: h, background: `linear-gradient(180deg, ${color}99, ${color})`, borderRadius: '8px 8px 0 0', transition: 'height 0.8s ease', minHeight: 6, boxShadow: `0 4px 12px ${color}30` }} />
                    <div style={{ fontSize: 10, color: T.muted, fontWeight: 700 }}>S{sem.semester}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ATTENDANCE */}
      {tab === 'attendance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {attLoading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ width: 36, height: 36, border: `3px solid ${T.elevated}`, borderTop: `3px solid ${T.teal}`, borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 12px' }} />
              <div style={{ color: T.muted, fontSize: 13 }}>Loading attendance…</div>
            </div>
          ) : attendance.length === 0 ? (
            <div style={{ ...card, textAlign: 'center', padding: 52 }}>
              <Calendar size={48} color={T.border} style={{ margin: '0 auto 16px' }} />
              <div style={{ fontSize: 16, fontWeight: 700, color: T.sub, marginBottom: 8 }}>No Attendance Data</div>
              <div style={{ fontSize: 13, color: T.muted, maxWidth: 320, margin: '0 auto' }}>
                Your attendance will be updated by Admin or TPO. Check back later.
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))', gap: 14 }}>
                {[
                  { label: 'Avg Attendance', value: `${avgAtt}%`, color: avgAtt >= 75 ? T.teal : T.amber, bg: avgAtt >= 75 ? T.tealL : T.amberL },
                  { label: 'Total Subjects', value: attendance.length, color: T.purple, bg: T.purpleL },
                  { label: 'Above 75%', value: attendance.filter(a => a.totalClasses > 0 && (a.attendedClasses/a.totalClasses)*100 >= 75).length, color: T.green, bg: T.greenL },
                  { label: 'Below 75%', value: lowAtt.length, color: lowAtt.length > 0 ? T.red : T.green, bg: lowAtt.length > 0 ? T.redL : T.greenL },
                ].map(item => (
                  <div key={item.label} style={{ ...card, textAlign: 'center', borderTop: `3px solid ${item.color}` }}>
                    <div style={{ fontSize: 30, fontWeight: 900, color: item.color, fontFamily: 'Outfit, sans-serif' }}>{item.value}</div>
                    <div style={{ fontSize: 11, color: T.muted, marginTop: 4, fontWeight: 600 }}>{item.label}</div>
                  </div>
                ))}
              </div>

              <div style={card}>
                <SectionTitle icon={Calendar} color={T.teal} bg={T.tealL}>Subject-wise Attendance</SectionTitle>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {attendance.map((a, i) => <AttendanceRow key={i} item={a} />)}
                </div>
              </div>

              <div style={{ padding: '14px 18px', background: T.amberL, border: `1px solid ${T.amber}30`, borderRadius: 14, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <Info size={18} color={T.amber} style={{ flexShrink: 0, marginTop: 1 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.amber, marginBottom: 3 }}>Attendance Policy</div>
                  <div style={{ fontSize: 12, color: T.sub, lineHeight: 1.5 }}>
                    Minimum <strong>75% attendance</strong> required for exams. Below <strong>60%</strong> may result in detention.
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* PROJECTS */}
      {tab === 'projects' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', gap: 14 }}>
            {[
              { label: 'Total',  value: student.projects?.length || 0,                               color: T.indigo, bg: T.indigoL },
              { label: 'Major',  value: student.projects?.filter(p=>p.type==='major').length || 0,   color: T.purple, bg: T.purpleL },
              { label: 'Minor',  value: student.projects?.filter(p=>p.type==='minor').length || 0,   color: T.blue,   bg: T.blueL   },
            ].map(item => (
              <div key={item.label} style={{ ...card, textAlign: 'center', flex: 1, borderTop: `3px solid ${item.color}` }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: item.color, fontFamily: 'Outfit, sans-serif' }}>{item.value}</div>
                <div style={{ fontSize: 11, color: T.muted, fontWeight: 600, marginTop: 4 }}>{item.label} Projects</div>
              </div>
            ))}
          </div>
          {!student.projects?.length ? (
            <div style={{ ...card, textAlign: 'center', padding: 48 }}>
              <BookOpen size={44} color={T.border} style={{ margin: '0 auto 12px' }} />
              <div style={{ fontSize: 15, fontWeight: 700, color: T.sub }}>No projects yet</div>
              <div style={{ fontSize: 12, color: T.muted, marginTop: 4 }}>Go to Update Profile to add projects</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16 }}>
              {student.projects.map((p, i) => {
                const color = p.type === 'major' ? T.purple : T.indigo
                const bg    = p.type === 'major' ? T.purpleL : T.indigoL
                return (
                  <div key={i} style={{ ...card, borderTop: `4px solid ${color}`, transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow=shadow.md }}
                    onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow=shadow.sm }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: T.text, fontFamily: 'Outfit, sans-serif', flex: 1, marginRight: 8 }}>{p.title}</div>
                      <Pill color={color} bg={bg}>{p.type?.toUpperCase()}</Pill>
                    </div>
                    {p.description && <div style={{ fontSize: 12, color: T.muted, marginBottom: 12, lineHeight: 1.6 }}>{p.description}</div>}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                      {p.techStack?.map(t => <span key={t} style={{ fontSize: 11, color, background: bg, padding: '2px 9px', borderRadius: 7, fontWeight: 700 }}>{t}</span>)}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: T.light, fontWeight: 600 }}>📅 {p.year}</span>
                      {p.githubLink && <a href={p.githubLink} target="_blank" rel="noreferrer" style={{ fontSize: 11, color, fontWeight: 700 }}>GitHub →</a>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* PLACEMENT */}
      {tab === 'placement' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div style={card}>
            <SectionTitle icon={Briefcase} color={T.green} bg={T.greenL}>Placement Status</SectionTitle>
            <div style={{ padding: 24, background: placementMeta.bg, borderRadius: 16, border: `1px solid ${placementMeta.color}25`, textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>
                {student.placementStatus === 'placed' ? '🎉' : student.placementStatus === 'in_process' ? '🔄' : student.placementStatus === 'higher_studies' ? '📚' : '⏳'}
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: placementMeta.color, fontFamily: 'Outfit, sans-serif' }}>{placementMeta.label}</div>
            </div>
            {student.placedCompany && (
              <div style={{ padding: '16px 18px', background: T.greenL, borderRadius: 14 }}>
                <div style={{ fontSize: 11, color: T.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Placed At</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: T.green, fontFamily: 'Outfit, sans-serif' }}>{student.placedCompany}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: T.green, marginTop: 4 }}>₹{student.placedPackage} LPA</div>
              </div>
            )}
          </div>
          <div style={card}>
            <SectionTitle icon={Target} color={T.purple} bg={T.purpleL}>Readiness Score</SectionTitle>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <ScoreRing score={student.placementReadinessScore || 0} />
            </div>
          </div>
          {student.skillGaps?.length > 0 && (
            <div style={card}>
              <SectionTitle icon={AlertCircle} color={T.red} bg={T.redL}>Skill Gaps</SectionTitle>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {student.skillGaps.map(s => <Pill key={s} color={T.red} bg={T.redL}>{s}</Pill>)}
              </div>
            </div>
          )}
          {student.suggestedSkills?.length > 0 && (
            <div style={card}>
              <SectionTitle icon={Zap} color={T.purple} bg={T.purpleL}>Recommended Skills</SectionTitle>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {student.suggestedSkills.map(s => <Pill key={s}>+ {s}</Pill>)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SKILLS */}
      {tab === 'skills' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div style={card}>
            <SectionTitle icon={Code2} color={T.pink} bg={T.pinkL}>Technical Skills</SectionTitle>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
              {student.technicalSkills?.map(s => <Pill key={s} color={T.purple} bg={T.purpleL}>{s}</Pill>)}
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Languages</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {student.programmingLanguages?.map(l => <Pill key={l} color={T.blue} bg={T.blueL}>{l}</Pill>)}
            </div>
          </div>
          <div style={card}>
            <SectionTitle icon={CheckCircle} color={T.green} bg={T.greenL}>Soft Skills</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {student.softSkills?.map(s => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', background: T.elevated, borderRadius: 12, border: `1px solid ${T.border}` }}>
                  <CheckCircle size={15} color={T.green} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* EXPERIENCE */}
      {tab === 'experience' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div style={card}>
            <SectionTitle icon={Award} color={T.teal} bg={T.tealL}>Certifications</SectionTitle>
            {!student.certifications?.length
              ? <div style={{ color: T.muted, fontSize: 13 }}>No certifications yet.</div>
              : student.certifications.map((c, i) => (
                <div key={i} style={{ display: 'flex', gap: 14, padding: 14, background: T.elevated, borderRadius: 14, marginBottom: 10, border: `1px solid ${T.border}` }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: T.tealL, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Award size={18} color={T.teal} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{c.title}</div>
                    <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{c.issuedBy}</div>
                    <div style={{ fontSize: 11, color: T.light, marginTop: 2 }}>
                      {c.issueDate ? new Date(c.issueDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : ''}
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
          <div style={card}>
            <SectionTitle icon={Briefcase} color={T.amber} bg={T.amberL}>Internships</SectionTitle>
            {!student.internships?.length
              ? <div style={{ color: T.muted, fontSize: 13 }}>No internships yet.</div>
              : student.internships.map((intern, i) => (
                <div key={i} style={{ padding: 14, background: T.elevated, borderRadius: 14, marginBottom: 10, border: `1px solid ${T.border}`, borderLeft: `4px solid ${T.amber}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: T.text, fontFamily: 'Outfit, sans-serif' }}>{intern.company}</div>
                    <Pill color={intern.isCompleted ? T.green : T.amber} bg={intern.isCompleted ? T.greenL : T.amberL}>
                      {intern.isCompleted ? 'Completed' : 'Ongoing'}
                    </Pill>
                  </div>
                  <div style={{ fontSize: 12, color: T.muted, marginBottom: 4 }}>{intern.role}</div>
                  {intern.stipend > 0 && <div style={{ fontSize: 13, color: T.amber, fontWeight: 700 }}>₹{intern.stipend?.toLocaleString()}/month</div>}
                  <div style={{ fontSize: 11, color: T.light, marginTop: 4 }}>
                    {intern.startDate ? new Date(intern.startDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : ''} →{' '}
                    {intern.endDate ? new Date(intern.endDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'Present'}
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      )}
    </div>
  )
}