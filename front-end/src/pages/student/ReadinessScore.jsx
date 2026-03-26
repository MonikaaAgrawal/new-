import React from 'react'
import { useEffect, useState } from 'react'
import { useAuth, API } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { RefreshCw, TrendingUp, AlertTriangle, CheckCircle, Info } from 'lucide-react'

const ScoreGauge = ({ score }) => {
  const color = score >= 70 ? 'var(--green)' : score >= 40 ? 'var(--accent)' : 'var(--red)'
  const label = score >= 70 ? 'Placement Ready' : score >= 40 ? 'Needs Improvement' : 'Not Ready'
  const pct   = score / 100
  const r = 70
  const circ = 2 * Math.PI * r
  const dash  = circ * pct
  const gap   = circ - dash

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <svg width={180} height={180} viewBox="0 0 180 180">
        {/* Track */}
        <circle cx={90} cy={90} r={r} fill="none" stroke="var(--bg-hover)" strokeWidth={14} />
        {/* Progress */}
        <circle
          cx={90} cy={90} r={r} fill="none"
          stroke={color} strokeWidth={14}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${gap}`}
          strokeDashoffset={circ * 0.25}
          style={{ transition: 'stroke-dasharray 1s cubic-bezier(0.16,1,0.3,1)' }}
        />
        {/* Score text */}
        <text x={90} y={85} textAnchor="middle" fill="var(--text-primary)"
          style={{ fontFamily: 'Syne, sans-serif', fontSize: 32, fontWeight: 800 }}>
          {score}
        </text>
        <text x={90} y={108} textAnchor="middle" fill="var(--text-muted)"
          style={{ fontFamily: 'Syne, sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: 2 }}>
          / 100
        </text>
      </svg>
      <span style={{
        padding: '6px 18px', borderRadius: 99,
        background: `${color}18`, border: `1px solid ${color}40`,
        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.85rem', color
      }}>
        {label}
      </span>
    </div>
  )
}

const ScoreBar = ({ label, value, max, color }) => (
  <div style={{ marginBottom: 14 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
      <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-display)', fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: '0.82rem', color, fontFamily: 'var(--font-display)', fontWeight: 700 }}>{value}/{max}</span>
    </div>
    <div className="progress-bar">
      <div className="progress-fill" style={{ width: `${(value / max) * 100}%`, background: `linear-gradient(90deg, ${color}88, ${color})` }} />
    </div>
  </div>
)

export default function ReadinessScore() {
  const { user } = useAuth()
  const [profile,     setProfile]     = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [recalcLoading, setRecalcLoading] = useState(false)

  const fetchProfile = async () => {
    try {
      if (!user?.enrollmentNumber) return
      const { data } = await API.get(`/students/${user.enrollmentNumber}`)
      setProfile(data.data)
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchProfile() }, [user])

  const recalculate = async () => {
    setRecalcLoading(true)
    try {
      const { data } = await API.post(`/analytics/score/${user.enrollmentNumber}`)
      setProfile(prev => ({
        ...prev,
        placementReadinessScore: data.score,
        skillGaps: data.skillGaps
      }))
      toast.success(`Score updated: ${data.score}/100`)
    } catch { toast.error('Recalculation failed') }
    finally { setRecalcLoading(false) }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 12 }}>
      <div className="spinner" /><span style={{ color: 'var(--text-muted)' }}>Loading…</span>
    </div>
  )

  if (!profile) return (
    <div className="card" style={{ textAlign: 'center', padding: 64 }}>
      <p style={{ color: 'var(--text-muted)' }}>Profile not found. Contact your administrator.</p>
    </div>
  )

  const score = profile.placementReadinessScore || 0

  // Estimate sub-scores from profile data (mirrors backend algorithm)
  const cgpaScore   = profile.cgpa >= 9 ? 30 : profile.cgpa >= 8 ? 25 : profile.cgpa >= 7 ? 20 : profile.cgpa >= 6 ? 13 : 8
  const skillsCount = (profile.technicalSkills?.length || 0) + (profile.programmingLanguages?.length || 0)
  const skillsScore = Math.min(25, skillsCount * 2.5)
  const projScore   = Math.min(20, (profile.projects?.filter(p => p.type === 'major').length || 0) * 8 + (profile.projects?.filter(p => p.type === 'minor').length || 0) * 3)
  const internScore = Math.min(15, (profile.internships?.filter(i => i.isCompleted).length || 0) * 8)
  const certScore   = Math.min(10, (profile.certifications?.length || 0) * 3)

  const tips = [
    !profile.internships?.length       && { type: 'warn',  text: 'Add at least 1 completed internship (+8 pts)' },
    (profile.projects?.length || 0) < 2 && { type: 'warn',  text: 'Add a major project to boost your score (+8 pts)' },
    (profile.certifications?.length || 0) < 2 && { type: 'info',  text: 'Add certifications to gain extra points (+3 pts each)' },
    profile.cgpa < 7                   && { type: 'warn',  text: 'Improve your CGPA to unlock higher score bands' },
    score >= 80                        && { type: 'good',  text: 'Excellent! You are highly placement-ready' },
  ].filter(Boolean)

  return (
    <div className="page-enter">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em' }}>AI Readiness Score</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 4 }}>Your placement readiness breakdown</p>
        </div>
        <button className="btn btn-ghost" onClick={recalculate} disabled={recalcLoading}>
          <RefreshCw size={14} style={recalcLoading ? { animation: 'spin 0.6s linear infinite' } : {}} />
          Recalculate
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20, marginBottom: 20 }}>

        {/* Gauge */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
          <ScoreGauge score={score} />
          <div style={{ width: '100%', textAlign: 'center', paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 10 }}>
              Score Breakdown
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
              {[
                { label: 'CGPA',     val: cgpaScore,   max: 30, color: 'var(--accent)'  },
                { label: 'Skills',   val: Math.round(skillsScore), max: 25, color: 'var(--blue)'   },
                { label: 'Projects', val: Math.round(projScore),   max: 20, color: 'var(--purple)' },
                { label: 'Intern',   val: Math.round(internScore), max: 15, color: 'var(--green)'  },
                { label: 'Certs',    val: Math.round(certScore),   max: 10, color: 'var(--red)'    },
              ].map(({ label, val, max, color }) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', color }}>{val}</div>
                  <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}/{max}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bars + Skill Gaps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 18 }}>Score Components</h3>
            <ScoreBar label="CGPA Performance"      value={cgpaScore}              max={30} color="var(--accent)"  />
            <ScoreBar label="Skills & Languages"    value={Math.round(skillsScore)} max={25} color="var(--blue)"   />
            <ScoreBar label="Projects"              value={Math.round(projScore)}   max={20} color="var(--purple)" />
            <ScoreBar label="Internship Experience" value={Math.round(internScore)} max={15} color="var(--green)"  />
            <ScoreBar label="Certifications"        value={Math.round(certScore)}   max={10} color="var(--red)"    />
          </div>

          {profile.skillGaps?.length > 0 && (
            <div className="card" style={{ borderColor: 'rgba(245,166,35,0.2)' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 6 }}>Skill Gaps Identified</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: 14 }}>Learn these to improve your score and employability</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {profile.skillGaps.map(skill => (
                  <span key={skill} style={{
                    padding: '6px 14px', borderRadius: 'var(--radius-sm)',
                    background: 'var(--accent-glow)', border: '1px solid rgba(245,166,35,0.25)',
                    fontSize: '0.82rem', color: 'var(--accent)',
                    fontFamily: 'var(--font-display)', fontWeight: 600
                  }}>
                    + {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tips */}
      {tips.length > 0 && (
        <div className="card">
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 14 }}>Improvement Tips</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {tips.map((tip, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                padding: '12px 16px', borderRadius: 'var(--radius)',
                background: tip.type === 'good' ? 'var(--green-dim)' : tip.type === 'warn' ? 'var(--accent-glow)' : 'var(--blue-dim)',
                border: `1px solid ${tip.type === 'good' ? 'rgba(62,207,110,0.2)' : tip.type === 'warn' ? 'rgba(245,166,35,0.2)' : 'rgba(91,156,240,0.2)'}`
              }}>
                {tip.type === 'good'
                  ? <CheckCircle size={15} color="var(--green)" style={{ marginTop: 1, flexShrink: 0 }} />
                  : tip.type === 'warn'
                  ? <AlertTriangle size={15} color="var(--accent)" style={{ marginTop: 1, flexShrink: 0 }} />
                  : <Info size={15} color="var(--blue)" style={{ marginTop: 1, flexShrink: 0 }} />
                }
                <span style={{
                  fontSize: '0.85rem',
                  color: tip.type === 'good' ? 'var(--green)' : tip.type === 'warn' ? 'var(--accent)' : 'var(--blue)'
                }}>{tip.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}