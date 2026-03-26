import React from 'react'
import { useState } from 'react'
import { API } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import StudentCard from '../../components/StudentCard'
import { Filter, Search, X } from 'lucide-react'

export default function FilterStudents() {
  const [results,  setResults]  = useState([])
  const [loading,  setLoading]  = useState(false)
  const [searched, setSearched] = useState(false)
  const [filters,  setFilters]  = useState({ cgpa:'', skill:'', status:'', division:'', search:'' })

  const handleSearch = async (e) => {
    e.preventDefault(); setLoading(true); setSearched(true)
    try {
      const params = new URLSearchParams({ limit:100 })
      if (filters.cgpa)     params.set('cgpa', filters.cgpa)
      if (filters.skill)    params.set('skill', filters.skill)
      if (filters.status)   params.set('status', filters.status)
      if (filters.division) params.set('division', filters.division)
      if (filters.search)   params.set('search', filters.search)
      const { data } = await API.get(`/students?${params}`)
      setResults(data.data)
    } catch { toast.error('Search failed') }
    finally { setLoading(false) }
  }

  const reset = () => { setFilters({ cgpa:'', skill:'', status:'', division:'', search:'' }); setResults([]); setSearched(false) }

  return (
    <div className="page-enter">
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:'1.5rem', fontWeight:800, letterSpacing:'-0.03em' }}>Filter Students</h1>
        <p style={{ color:'var(--text-muted)', fontSize:'0.875rem', marginTop:4 }}>Find students by CGPA, skills, status, and more</p>
      </div>

      <div className="card" style={{ marginBottom:24 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
          <Filter size={16} color="var(--accent)" />
          <h3 style={{ fontSize:'0.9rem', fontWeight:700 }}>Filter Criteria</h3>
        </div>
        <form onSubmit={handleSearch}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:14, marginBottom:16 }}>
            <div className="form-group"><label className="form-label">Search</label><input className="form-input" placeholder="Name or Enrollment…" value={filters.search} onChange={e => setFilters({...filters, search:e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Min CGPA</label><input type="number" step="0.1" min="0" max="10" className="form-input" placeholder="e.g. 7.0" value={filters.cgpa} onChange={e => setFilters({...filters, cgpa:e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Has Skill</label><input className="form-input" placeholder="e.g. React, Python" value={filters.skill} onChange={e => setFilters({...filters, skill:e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Status</label>
              <select className="form-input" value={filters.status} onChange={e => setFilters({...filters, status:e.target.value})}>
                <option value="">All</option><option value="not_started">Not Started</option><option value="in_process">In Process</option><option value="placed">Placed</option><option value="opted_out">Opted Out</option><option value="higher_studies">Higher Studies</option>
              </select>
            </div>
            <div className="form-group"><label className="form-label">Division</label>
              <select className="form-input" value={filters.division} onChange={e => setFilters({...filters, division:e.target.value})}>
                <option value="">All Divisions</option>{['A','B','C','D'].map(d => <option key={d} value={d}>Division {d}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button type="submit" className="btn btn-primary"><Search size={14} /> Search Students</button>
            <button type="button" className="btn btn-ghost" onClick={reset}><X size={14} /> Reset</button>
          </div>
        </form>
      </div>

      {loading ? (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:200, gap:12 }}><div className="spinner" /><span style={{ color:'var(--text-muted)' }}>Searching…</span></div>
      ) : searched && (
        <>
          <div style={{ marginBottom:16 }}>
            <span style={{ color:'var(--text-muted)', fontSize:'0.875rem' }}>Found <strong style={{ color:'var(--text-primary)' }}>{results.length}</strong> students</span>
          </div>
          {results.length === 0 ? (
            <div className="card" style={{ textAlign:'center', padding:48, color:'var(--text-muted)' }}>No students match your filters. Try broadening the criteria.</div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:16 }}>
              {results.map(s => <StudentCard key={s._id} student={s} />)}
            </div>
          )}
        </>
      )}

      {!searched && (
        <div className="card" style={{ textAlign:'center', padding:64, color:'var(--text-muted)' }}>
          <Filter size={32} style={{ marginBottom:12, opacity:0.3 }} />
          <p>Use the filters above to find specific students</p>
        </div>
      )}
    </div>
  )
}