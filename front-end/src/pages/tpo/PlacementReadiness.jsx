import React from 'react'
import { useEffect, useState } from 'react'
import { API } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function PlacementReadiness() {
  const [students, setStudents] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [minScore, setMinScore] = useState(60)
  const [minCGPA,  setMinCGPA]  = useState(6.0)

  const fetch = async () => {
    setLoading(true)
    try {
      const { data } = await API.get(`/tpo/placement-ready?minScore=${minScore}&minCGPA=${minCGPA}&limit=100`)
      setStudents(data.data)
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [minScore, minCGPA])

  const scoreColor = (s) => s >= 80 ? 'var(--green)' : s >= 60 ? 'var(--accent)' : 'var(--red)'

  return (
    <div className="page-enter">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:'1.5rem', fontWeight:800, letterSpacing:'-0.03em' }}>Placement Readiness</h1>
          <p style={{ color:'var(--text-muted)', fontSize:'0.875rem', marginTop:4 }}><span style={{ color:'var(--green)', fontWeight:700 }}>{students.length}</span> students match current filters</p>
        </div>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          <div className="form-group" style={{ flexDirection:'row', alignItems:'center', gap:8 }}>
            <label className="form-label" style={{ whiteSpace:'nowrap' }}>Min Score</label>
            <select className="form-input" value={minScore} onChange={e => setMinScore(+e.target.value)} style={{ width:80 }}>
              {[40,50,60,70,80,90].map(v => <option key={v} value={v}>{v}+</option>)}
            </select>
          </div>
          <div className="form-group" style={{ flexDirection:'row', alignItems:'center', gap:8 }}>
            <label className="form-label" style={{ whiteSpace:'nowrap' }}>Min CGPA</label>
            <select className="form-input" value={minCGPA} onChange={e => setMinCGPA(+e.target.value)} style={{ width:80 }}>
              {[5,5.5,6,6.5,7,7.5,8].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding:0 }}>
        <div className="table-wrap">
          <table>
            <thead><tr><th>#</th><th>Enrollment</th><th>Name</th><th>CGPA</th><th>Score</th><th>Score Bar</th><th>Internship</th><th>Status</th><th>Top Skills</th></tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} style={{ textAlign:'center', padding:40, color:'var(--text-muted)' }}><div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}><div className="spinner" /> Loading…</div></td></tr>
              ) : students.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign:'center', padding:40, color:'var(--text-muted)' }}>No students match — try lowering the filters</td></tr>
              ) : students.map((s,i) => (
                <tr key={s._id}>
                  <td style={{ color:'var(--text-muted)', fontFamily:'var(--font-display)', fontWeight:700 }}>{i+1}</td>
                  <td style={{ color:'var(--accent)', fontFamily:'var(--font-display)', fontWeight:700, fontSize:'0.8rem' }}>{s.enrollmentNumber}</td>
                  <td style={{ color:'var(--text-primary)', fontWeight:600 }}>{s.name}</td>
                  <td style={{ fontFamily:'var(--font-display)', fontWeight:700 }}>{s.cgpa?.toFixed(1)}</td>
                  <td><span style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'1rem', color:scoreColor(s.placementReadinessScore) }}>{s.placementReadinessScore}</span><span style={{ color:'var(--text-muted)', fontSize:'0.75rem' }}>/100</span></td>
                  <td style={{ minWidth:120 }}><div className="progress-bar"><div className="progress-fill" style={{ width:`${s.placementReadinessScore}%`, background:`linear-gradient(90deg, ${scoreColor(s.placementReadinessScore)}88, ${scoreColor(s.placementReadinessScore)})` }} /></div></td>
                  <td>{s.internships?.filter(i => i.isCompleted).length > 0 ? <span className="badge badge-green">✓ {s.internships.filter(i => i.isCompleted).length}</span> : <span className="badge badge-muted">None</span>}</td>
                  <td><span className={`badge ${s.placementStatus==='placed' ? 'badge-green' : s.placementStatus==='in_process' ? 'badge-amber' : 'badge-muted'}`}>{s.placementStatus?.replace(/_/g,' ')}</span></td>
                  <td><div style={{ display:'flex', gap:4 }}>{s.technicalSkills?.slice(0,3).map(sk => <span key={sk} className="chip">{sk}</span>)}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}