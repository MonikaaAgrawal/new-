import React from 'react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import StatCard from '../../components/StatCard'
import { Users, GraduationCap, TrendingUp, Briefcase, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#f5a623','#3ecf6e','#5b9cf0','#a78bfa','#f05b5b']
const API = axios.create({
  baseURL: '/api',
});

const CT = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'var(--bg-elevated)', border:'1px solid var(--border-light)', borderRadius:8, padding:'10px 14px' }}>
      <p style={{ color:'var(--text-muted)', fontSize:'0.75rem', marginBottom:4 }}>{label}</p>
      {payload.map((p,i) => <p key={i} style={{ color: p.fill || 'var(--accent)', fontFamily:'var(--font-display)', fontWeight:700 }}>{p.value}</p>)}
    </div>
  )
}

export default function AdminDashboard() {
  const [stats,     setStats]     = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [loading,   setLoading]   = useState(true)
  const navigate = useNavigate()

  const fetchData = async () => {
    setLoading(true)
    try {
      const [sRes, aRes] = await Promise.all([API.get('/admin/stats'), API.get('/analytics/department')])
      setStats(sRes.data.data)
      setAnalytics(aRes.data.data)
    } catch { toast.error('Failed to load dashboard') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const recalculate = async () => {
    const t = toast.loading('Recalculating AI scores…')
    try { await API.post('/analytics/recalculate-all'); toast.success('All scores updated!', { id:t }); fetchData() }
    catch { toast.error('Failed', { id:t }) }
  }

  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', gap:12 }}><div className="spinner" /><span style={{ color:'var(--text-muted)' }}>Loading…</span></div>

  const cgpaData      = analytics?.cgpaDistribution?.map(b => ({ name: b._id === 'Other' ? 'Other' : `${b._id}+`, students: b.count })) || []
  const placementData = analytics?.placementStats?.map(p => ({ name: p._id?.replace(/_/g,' ') || 'unknown', value: p.count })) || []
  const skillData     = analytics?.skillPopularity?.slice(0,10).map(s => ({ skill: s._id, count: s.count })) || []

  return (
    <div className="page-enter">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28 }}>
        <div>
          <h1 style={{ fontSize:'1.6rem', fontWeight:800, letterSpacing:'-0.03em' }}>Admin Dashboard</h1>
          <p style={{ color:'var(--text-muted)', fontSize:'0.875rem', marginTop:4 }}>IT Department — Academic & Placement Overview</p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button className="btn btn-ghost" onClick={recalculate}><RefreshCw size={14} /> Recalculate AI Scores</button>
          <button className="btn btn-primary" onClick={() => navigate('/admin/students')}><Users size={14} /> Manage Students</button>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:16, marginBottom:28 }}>
        <StatCard label="Total Students" value={stats?.totalStudents || 0} icon={Users}        color="var(--accent)" />
        <StatCard label="Avg CGPA"       value={stats?.avgCGPA || '—'}    icon={GraduationCap} color="var(--blue)" />
        <StatCard label="Placed"         value={stats?.placed || 0}       icon={Briefcase}     color="var(--green)" sub={`${stats?.placementRate || 0}% rate`} />
        <StatCard label="Total Users"    value={stats?.totalUsers || 0}   icon={TrendingUp}    color="var(--purple)" />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
        <div className="card">
          <h3 style={{ fontSize:'0.95rem', fontWeight:700, marginBottom:4 }}>CGPA Distribution</h3>
          <p style={{ color:'var(--text-muted)', fontSize:'0.78rem', marginBottom:20 }}>Students per CGPA band</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={cgpaData} barSize={28}>
              <XAxis dataKey="name" tick={{ fill:'var(--text-muted)', fontSize:11, fontFamily:'var(--font-display)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CT />} cursor={{ fill:'var(--bg-hover)' }} />
              <Bar dataKey="students" fill="var(--accent)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 style={{ fontSize:'0.95rem', fontWeight:700, marginBottom:4 }}>Placement Status</h3>
          <p style={{ color:'var(--text-muted)', fontSize:'0.78rem', marginBottom:20 }}>Current breakdown</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={placementData} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name" label={({ name, percent }) => `${(percent*100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                {placementData.map((_,i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip content={<CT />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize:'0.95rem', fontWeight:700, marginBottom:4 }}>Top 10 Skills in Department</h3>
        <p style={{ color:'var(--text-muted)', fontSize:'0.78rem', marginBottom:20 }}>Most popular technical skills</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={skillData} layout="vertical" barSize={14}>
            <XAxis type="number" tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickLine={false} />
            <YAxis dataKey="skill" type="category" width={100} tick={{ fill:'var(--text-secondary)', fontSize:11, fontFamily:'var(--font-display)' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CT />} cursor={{ fill:'var(--bg-hover)' }} />
            <Bar dataKey="count" fill="var(--blue)" radius={[0,4,4,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}