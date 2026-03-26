import React from 'react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API } from '../../context/AuthContext'
import StatCard from '../../components/StatCard'
import toast from 'react-hot-toast'
import { Briefcase, Users, TrendingUp, Award, Plus, X } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts'

const COLORS = ['#3ecf6e','#f5a623','#5b9cf0','#f05b5b','#a78bfa']
const CT = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return <div style={{ background:'var(--bg-elevated)', border:'1px solid var(--border-light)', borderRadius:8, padding:'10px 14px' }}><p style={{ color:'var(--text-muted)', fontSize:'0.75rem', marginBottom:4 }}>{label}</p>{payload.map((p,i) => <p key={i} style={{ color:p.fill, fontFamily:'var(--font-display)', fontWeight:700 }}>{p.name}: {p.value}</p>)}</div>
}

export default function TPODashboard() {
  const [stats,  setStats]  = useState(null)
  const [drives, setDrives] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [driveForm, setDriveForm] = useState({ companyName:'', jobRole:'', package:'', eligibilityCGPA:'6.0', requiredSkills:'', jobType:'full_time', location:'', description:'' })
  const navigate = useNavigate()

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [sRes, dRes] = await Promise.all([API.get('/tpo/stats'), API.get('/tpo/drives')])
      setStats(sRes.data.data); setDrives(dRes.data.data || [])
    } catch { toast.error('Failed to load TPO data') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAll() }, [])

  const createDrive = async (e) => {
    e.preventDefault()
    try {
      await API.post('/tpo/drives', { ...driveForm, package: parseFloat(driveForm.package), eligibilityCGPA: parseFloat(driveForm.eligibilityCGPA), requiredSkills: driveForm.requiredSkills.split(',').map(s => s.trim()).filter(Boolean) })
      toast.success('Placement drive created!')
      setShowModal(false); fetchAll()
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed') }
  }

  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', gap:12 }}><div className="spinner" /></div>

  const pieData = stats ? [
    { name:'Placed',         value: stats.placed        },
    { name:'In Process',     value: stats.inProcess     },
    { name:'Not Started',    value: stats.notStarted    },
    { name:'Opted Out',      value: stats.optedOut      },
    { name:'Higher Studies', value: stats.higherStudies },
  ].filter(d => d.value > 0) : []

  const companyData = stats?.topCompanies?.map(c => ({ company: c._id?.length > 12 ? c._id.slice(0,12)+'…' : c._id, placed: c.count })) || []

  return (
    <div className="page-enter">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28 }}>
        <div>
          <h1 style={{ fontSize:'1.5rem', fontWeight:800, letterSpacing:'-0.03em' }}>TPO Dashboard</h1>
          <p style={{ color:'var(--text-muted)', fontSize:'0.875rem', marginTop:4 }}>Training & Placement Officer — Batch Overview</p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button className="btn btn-ghost" onClick={() => navigate('/tpo/readiness')}><TrendingUp size={14} /> Readiness List</button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={14} /> New Drive</button>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(170px, 1fr))', gap:14, marginBottom:24 }}>
        <StatCard label="Total Students"    value={stats?.total || 0}         icon={Users}     color="var(--accent)" />
        <StatCard label="Placed"            value={stats?.placed || 0}        icon={Briefcase} color="var(--green)"  sub={`${stats?.placementPercentage}%`} />
        <StatCard label="In Process"        value={stats?.inProcess || 0}     icon={TrendingUp} color="var(--blue)" />
        <StatCard label="Avg Package (LPA)" value={stats?.avgPackage || '—'}  icon={Award}     color="var(--purple)" />
        <StatCard label="Max Package (LPA)" value={stats?.maxPackage || '—'}  icon={Award}     color="var(--accent)" />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
        <div className="card">
          <h3 style={{ fontSize:'0.95rem', fontWeight:700, marginBottom:4 }}>Placement Status</h3>
          <p style={{ color:'var(--text-muted)', fontSize:'0.78rem', marginBottom:16 }}>{stats?.placementPercentage}% batch placed</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={85} innerRadius={45} dataKey="value" paddingAngle={3} label={({ percent }) => `${(percent*100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                {pieData.map((_,i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip content={<CT />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8, justifyContent:'center', marginTop:8 }}>
            {pieData.map((d,i) => <div key={d.name} style={{ display:'flex', alignItems:'center', gap:5, fontSize:'0.72rem', color:'var(--text-muted)' }}><div style={{ width:8, height:8, borderRadius:2, background:COLORS[i] }} />{d.name} ({d.value})</div>)}
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize:'0.95rem', fontWeight:700, marginBottom:4 }}>Top Hiring Companies</h3>
          <p style={{ color:'var(--text-muted)', fontSize:'0.78rem', marginBottom:16 }}>By number of placements</p>
          {companyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={companyData} barSize={18}>
                <XAxis dataKey="company" tick={{ fill:'var(--text-muted)', fontSize:10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:'var(--text-muted)', fontSize:10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CT />} cursor={{ fill:'var(--bg-hover)' }} />
                <Bar dataKey="placed" name="Placed" fill="var(--green)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div style={{ height:220, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-muted)', fontSize:'0.875rem' }}>No placement data yet</div>}
        </div>
      </div>

      <div className="card" style={{ padding:0 }}>
        <div style={{ padding:'18px 20px 14px', borderBottom:'1px solid var(--border)' }}>
          <h3 style={{ fontSize:'0.95rem', fontWeight:700 }}>Placement Drives</h3>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Company</th><th>Role</th><th>Type</th><th>Package</th><th>Min CGPA</th><th>Applicants</th><th>Status</th></tr></thead>
            <tbody>
              {drives.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign:'center', padding:32, color:'var(--text-muted)' }}>No drives yet. <button onClick={() => setShowModal(true)} style={{ color:'var(--accent)', background:'none', border:'none', cursor:'pointer', fontFamily:'var(--font-display)', fontWeight:700 }}>Create one →</button></td></tr>
              ) : drives.map(d => (
                <tr key={d._id}>
                  <td style={{ color:'var(--text-primary)', fontWeight:600 }}>{d.companyName}</td>
                  <td>{d.jobRole}</td>
                  <td><span className={`badge ${d.jobType === 'full_time' ? 'badge-green' : 'badge-blue'}`}>{d.jobType?.replace(/_/g,' ')}</span></td>
                  <td style={{ color:'var(--accent)', fontFamily:'var(--font-display)', fontWeight:700 }}>{d.package} LPA</td>
                  <td>{d.eligibilityCGPA}</td>
                  <td>{d.applicants?.length || 0}</td>
                  <td><span className={`badge ${d.isCompleted ? 'badge-muted' : 'badge-green'}`}>{d.isCompleted ? 'Completed' : 'Active'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div style={{ position:'fixed', inset:0, zIndex:100, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
          <div className="card" style={{ width:'100%', maxWidth:520, maxHeight:'90vh', overflow:'auto' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
              <h3 style={{ fontFamily:'var(--font-display)', fontWeight:800 }}>New Placement Drive</h3>
              <button onClick={() => setShowModal(false)} style={{ color:'var(--text-muted)', cursor:'pointer' }}><X size={18} /></button>
            </div>
            <form onSubmit={createDrive} style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                <div className="form-group"><label className="form-label">Company *</label><input required className="form-input" placeholder="e.g. Infosys" value={driveForm.companyName} onChange={e => setDriveForm({...driveForm, companyName:e.target.value})} /></div>
                <div className="form-group"><label className="form-label">Job Role *</label><input required className="form-input" placeholder="e.g. Software Engineer" value={driveForm.jobRole} onChange={e => setDriveForm({...driveForm, jobRole:e.target.value})} /></div>
                <div className="form-group"><label className="form-label">Package (LPA)</label><input type="number" step="0.1" className="form-input" placeholder="e.g. 8.5" value={driveForm.package} onChange={e => setDriveForm({...driveForm, package:e.target.value})} /></div>
                <div className="form-group"><label className="form-label">Min CGPA</label><input type="number" step="0.1" min="0" max="10" className="form-input" placeholder="6.0" value={driveForm.eligibilityCGPA} onChange={e => setDriveForm({...driveForm, eligibilityCGPA:e.target.value})} /></div>
                <div className="form-group"><label className="form-label">Job Type</label><select className="form-input" value={driveForm.jobType} onChange={e => setDriveForm({...driveForm, jobType:e.target.value})}><option value="full_time">Full Time</option><option value="internship">Internship</option><option value="ppo">PPO</option></select></div>
                <div className="form-group"><label className="form-label">Location</label><input className="form-input" placeholder="e.g. Bangalore" value={driveForm.location} onChange={e => setDriveForm({...driveForm, location:e.target.value})} /></div>
              </div>
              <div className="form-group"><label className="form-label">Required Skills (comma separated)</label><input className="form-input" placeholder="React, Node.js, SQL" value={driveForm.requiredSkills} onChange={e => setDriveForm({...driveForm, requiredSkills:e.target.value})} /></div>
              <div style={{ display:'flex', gap:10 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)} style={{ flex:1, justifyContent:'center' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex:1, justifyContent:'center' }}>Create Drive</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}