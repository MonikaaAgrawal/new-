import React from 'react'
import { useEffect, useState } from 'react'
import { API } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { Trophy, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts'

const CT = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return <div style={{ background:'var(--bg-elevated)', border:'1px solid var(--border-light)', borderRadius:8, padding:'10px 14px' }}><p style={{ color:'var(--text-muted)', fontSize:'0.75rem', marginBottom:4 }}>{label}</p>{payload.map((p,i) => <p key={i} style={{ color: p.stroke||p.fill||'var(--accent)', fontFamily:'var(--font-display)', fontWeight:700 }}>{p.name}: {p.value}</p>)}</div>
}

export default function Reports() {
  const [analytics,   setAnalytics]   = useState(null)
  const [topStudents, setTopStudents] = useState(null)
  const [loading,     setLoading]     = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const [aRes, tRes] = await Promise.all([API.get('/analytics/department'), API.get('/analytics/top-performers')])
        setAnalytics(aRes.data.data); setTopStudents(tRes.data.data)
      } catch { toast.error('Failed to load reports') }
      finally { setLoading(false) }
    }
    fetch()
  }, [])

  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh' }}><div className="spinner" /></div>

  const readinessData = analytics?.readinessDistribution?.map(b => ({ range: b._id === 'Other' ? 'Other' : `${b._id}-${b._id+20}`, students: b.count })) || []
  const skillRadarData = analytics?.skillPopularity?.slice(0,8).map(s => ({ skill: s._id.length > 10 ? s._id.slice(0,10)+'…' : s._id, count: s.count })) || []

  return (
    <div className="page-enter">
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:'1.5rem', fontWeight:800, letterSpacing:'-0.03em' }}>Department Reports</h1>
        <p style={{ color:'var(--text-muted)', fontSize:'0.875rem', marginTop:4 }}>Avg CGPA: <strong style={{ color:'var(--accent)' }}>{analytics?.avgCGPA}</strong></p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
        <div className="card">
          <h3 style={{ fontSize:'0.95rem', fontWeight:700, marginBottom:4 }}>Readiness Score Distribution</h3>
          <p style={{ color:'var(--text-muted)', fontSize:'0.78rem', marginBottom:20 }}>How placement-ready is the batch?</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={readinessData} barSize={28}>
              <XAxis dataKey="range" tick={{ fill:'var(--text-muted)', fontSize:10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CT />} cursor={{ fill:'var(--bg-hover)' }} />
              <Bar dataKey="students" fill="var(--green)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 style={{ fontSize:'0.95rem', fontWeight:700, marginBottom:4 }}>Skill Coverage Radar</h3>
          <p style={{ color:'var(--text-muted)', fontSize:'0.78rem', marginBottom:20 }}>Top skills across students</p>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={skillRadarData} cx="50%" cy="50%" outerRadius={70}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis dataKey="skill" tick={{ fill:'var(--text-muted)', fontSize:10 }} />
              <PolarRadiusAxis tick={false} axisLine={false} />
              <Radar name="Students" dataKey="count" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.15} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        <div className="card" style={{ padding:0 }}>
          <div style={{ padding:'18px 20px 14px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:8 }}>
            <Trophy size={16} color="var(--accent)" /><h3 style={{ fontSize:'0.9rem', fontWeight:700 }}>Top 10 by CGPA</h3>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>#</th><th>Name</th><th>Enrollment</th><th>CGPA</th></tr></thead>
              <tbody>
                {topStudents?.topByCGPA?.map((s,i) => (
                  <tr key={s._id}>
                    <td style={{ color: i<3 ? 'var(--accent)' : 'var(--text-muted)', fontFamily:'var(--font-display)', fontWeight:700 }}>#{i+1}</td>
                    <td style={{ color:'var(--text-primary)' }}>{s.name}</td>
                    <td style={{ color:'var(--text-muted)', fontSize:'0.8rem' }}>{s.enrollmentNumber}</td>
                    <td style={{ color:'var(--green)', fontFamily:'var(--font-display)', fontWeight:800 }}>{s.cgpa?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card" style={{ padding:0 }}>
          <div style={{ padding:'18px 20px 14px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:8 }}>
            <TrendingUp size={16} color="var(--blue)" /><h3 style={{ fontSize:'0.9rem', fontWeight:700 }}>Top 10 by Readiness Score</h3>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>#</th><th>Name</th><th>CGPA</th><th>Score</th></tr></thead>
              <tbody>
                {topStudents?.topByReadiness?.map((s,i) => (
                  <tr key={s._id}>
                    <td style={{ color: i<3 ? 'var(--accent)' : 'var(--text-muted)', fontFamily:'var(--font-display)', fontWeight:700 }}>#{i+1}</td>
                    <td style={{ color:'var(--text-primary)' }}>{s.name}</td>
                    <td style={{ color:'var(--text-muted)' }}>{s.cgpa?.toFixed(1)}</td>
                    <td style={{ color:'var(--blue)', fontFamily:'var(--font-display)', fontWeight:800 }}>{s.placementReadinessScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}