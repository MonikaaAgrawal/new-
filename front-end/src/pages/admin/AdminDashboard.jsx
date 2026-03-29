import React from 'react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API } from '../../context/AuthContext'   // ✅ uses token-aware instance
import StatCard from '../../components/StatCard'
import { Users, GraduationCap, TrendingUp, Briefcase, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#7c3aed','#059669','#2563eb','#d97706','#dc2626']

const CT = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'var(--bg-elevated)', border:'1px solid var(--border-light)', borderRadius:8, padding:'10px 14px' }}>
      <p style={{ color:'var(--text-muted)', fontSize:'0.75rem', marginBottom:4 }}>{label}</p>
      {payload.map((p,i) => (
        <p key={i} style={{ color: p.fill || 'var(--accent)', fontFamily:'var(--font-display)', fontWeight:700 }}>
          {p.name ? `${p.name}: ` : ''}{p.value}
        </p>
      ))}
    </div>
  )
}

export default function AdminDashboard() {
  const [stats,     setStats]     = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)
  const navigate = useNavigate()

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [sRes, aRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/analytics/department')
      ])
      setStats(sRes.data.data)
      setAnalytics(aRes.data.data)
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Failed to load dashboard'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const recalculate = async () => {
    const t = toast.loading('Recalculating AI scores…')
    try {
      await API.post('/analytics/recalculate-all')
      toast.success('All scores updated!', { id: t })
      fetchData()
    } catch {
      toast.error('Failed to recalculate', { id: t })
    }
  }

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', gap:12 }}>
      <div className="spinner" />
      <span style={{ color:'var(--text-muted)' }}>Loading dashboard…</span>
    </div>
  )

  if (error) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'60vh', gap:16 }}>
      <div className="card" style={{ maxWidth:420, width:'100%', textAlign:'center', padding:40 }}>
        <div style={{ fontSize:'2rem', marginBottom:12 }}>⚠️</div>
        <h3 style={{ marginBottom:8 }}>Failed to Load Dashboard</h3>
        <p style={{ color:'var(--text-muted)', fontSize:'0.875rem', marginBottom:20 }}>{error}</p>
        <button className="btn btn-primary" onClick={fetchData}>
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    </div>
  )

  // ── Derived chart data ──────────────────────────────────────────
  const cgpaData = (analytics?.cgpaDistribution || []).map(b => ({
    name: b._id === 'Other' ? 'Other' : `${b._id}+`,
    students: b.count
  }))

  const placementData = (analytics?.placementStats || [])
    .filter(p => p._id && p.count > 0)
    .map(p => ({
      name: (p._id || 'unknown').replace(/_/g, ' '),
      value: p.count
    }))

  const skillData = (analytics?.skillPopularity || [])
    .slice(0, 10)
    .map(s => ({ skill: s._id, count: s.count }))

  const readinessData = (analytics?.readinessDistribution || []).map(b => ({
    range: b._id === 'Other' ? 'Other' : `${b._id}–${b._id + 20}`,
    students: b.count
  }))

  return (
    <div className="page-enter">
      {/* ── Header ── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28 }}>
        <div>
          <h1 style={{ fontSize:'1.6rem', fontWeight:800, letterSpacing:'-0.03em' }}>Admin Dashboard</h1>
          <p style={{ color:'var(--text-muted)', fontSize:'0.875rem', marginTop:4 }}>
            IT Department — Academic &amp; Placement Overview
          </p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button className="btn btn-ghost" onClick={recalculate}>
            <RefreshCw size={14} /> Recalculate AI Scores
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/admin/students')}>
            <Users size={14} /> Manage Students
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:16, marginBottom:28 }}>
        <StatCard
          label="Total Students"
          value={stats?.totalStudents ?? 0}
          icon={Users}
          color="var(--accent)"
        />
        <StatCard
          label="Avg CGPA"
          value={stats?.avgCGPA ?? '—'}
          icon={GraduationCap}
          color="var(--blue)"
        />
        <StatCard
          label="Placed"
          value={stats?.placed ?? 0}
          icon={Briefcase}
          color="var(--green)"
          sub={`${stats?.placementRate ?? 0}% rate`}
        />
        <StatCard
          label="Total Users"
          value={stats?.totalUsers ?? 0}
          icon={TrendingUp}
          color="var(--purple)"
        />
      </div>

      {/* ── CGPA + Placement Pie ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
        <div className="card">
          <h3 style={{ fontSize:'0.95rem', fontWeight:700, marginBottom:4 }}>CGPA Distribution</h3>
          <p style={{ color:'var(--text-muted)', fontSize:'0.78rem', marginBottom:20 }}>Students per CGPA band</p>
          {cgpaData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={cgpaData} barSize={28}>
                <XAxis dataKey="name" tick={{ fill:'var(--text-muted)', fontSize:11, fontFamily:'var(--font-display)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CT />} cursor={{ fill:'var(--bg-hover)' }} />
                <Bar dataKey="students" name="Students" fill="var(--accent)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height:220, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-muted)' }}>
              No data available
            </div>
          )}
        </div>

        <div className="card">
          <h3 style={{ fontSize:'0.95rem', fontWeight:700, marginBottom:4 }}>Placement Status</h3>
          <p style={{ color:'var(--text-muted)', fontSize:'0.78rem', marginBottom:20 }}>Current breakdown</p>
          {placementData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={placementData}
                    cx="50%" cy="50%"
                    outerRadius={75}
                    innerRadius={38}
                    dataKey="value"
                    nameKey="name"
                    paddingAngle={3}
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                    fontSize={10}
                  >
                    {placementData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CT />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Legend */}
              <div style={{ display:'flex', flexWrap:'wrap', gap:8, justifyContent:'center', marginTop:8 }}>
                {placementData.map((d, i) => (
                  <div key={d.name} style={{ display:'flex', alignItems:'center', gap:5, fontSize:'0.72rem', color:'var(--text-muted)' }}>
                    <div style={{ width:8, height:8, borderRadius:2, background: COLORS[i % COLORS.length] }} />
                    {d.name} ({d.value})
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ height:220, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-muted)' }}>
              No placement data yet
            </div>
          )}
        </div>
      </div>

      {/* ── Readiness + Skills ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
        <div className="card">
          <h3 style={{ fontSize:'0.95rem', fontWeight:700, marginBottom:4 }}>Readiness Score Distribution</h3>
          <p style={{ color:'var(--text-muted)', fontSize:'0.78rem', marginBottom:20 }}>How placement-ready is the batch?</p>
          {readinessData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={readinessData} barSize={24}>
                <XAxis dataKey="range" tick={{ fill:'var(--text-muted)', fontSize:10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CT />} cursor={{ fill:'var(--bg-hover)' }} />
                <Bar dataKey="students" name="Students" fill="var(--green)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height:200, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-muted)' }}>
              No data available
            </div>
          )}
        </div>

        <div className="card">
          <h3 style={{ fontSize:'0.95rem', fontWeight:700, marginBottom:4 }}>Top 10 Skills in Department</h3>
          <p style={{ color:'var(--text-muted)', fontSize:'0.78rem', marginBottom:20 }}>Most popular technical skills</p>
          {skillData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={skillData} layout="vertical" barSize={12}>
                <XAxis type="number" tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis
                  dataKey="skill"
                  type="category"
                  width={90}
                  tick={{ fill:'var(--text-secondary)', fontSize:11, fontFamily:'var(--font-display)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CT />} cursor={{ fill:'var(--bg-hover)' }} />
                <Bar dataKey="count" name="Students" fill="var(--blue)" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height:200, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-muted)' }}>
              No skill data yet
            </div>
          )}
        </div>
      </div>

      {/* ── Quick Stats Summary ── */}
      <div className="card" style={{ background:'var(--accent-glow-lg)', borderColor:'rgba(124,58,237,0.15)' }}>
        <h3 style={{ fontSize:'0.9rem', fontWeight:700, marginBottom:14, color:'var(--accent)' }}>📊 Quick Summary</h3>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))', gap:12 }}>
          {[
            { label:'Avg CGPA',         value: analytics?.avgCGPA ?? '—',                                        color:'var(--blue)'   },
            { label:'High Readiness',   value: (analytics?.readinessDistribution || []).filter(b => b._id >= 60).reduce((s, b) => s + b.count, 0), color:'var(--green)'  },
            { label:'Top Skill',        value: analytics?.skillPopularity?.[0]?._id ?? '—',                      color:'var(--purple)' },
            { label:'Total Placed',     value: stats?.placed ?? 0,                                                color:'var(--green)'  },
            { label:'Placement Rate',   value: `${stats?.placementRate ?? 0}%`,                                   color:'var(--accent)' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ padding:'12px 16px', background:'var(--bg-surface)', borderRadius:'var(--radius)', border:'1px solid var(--border)' }}>
              <div style={{ fontSize:'0.65rem', color:'var(--text-muted)', fontFamily:'var(--font-display)', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:6 }}>{label}</div>
              <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'1.2rem', color }}>{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}