import React from 'react'

const statusConfig = {
  placed:         { label:'Placed',          cls:'badge-green'  },
  in_process:     { label:'In Process',      cls:'badge-amber'  },
  not_started:    { label:'Not Started',     cls:'badge-muted'  },
  opted_out:      { label:'Opted Out',       cls:'badge-red'    },
  higher_studies: { label:'Higher Studies',  cls:'badge-blue'   },
}

export default function StudentCard({ student, onClick }) {
  const status     = statusConfig[student.placementStatus] || statusConfig.not_started
  const score      = student.placementReadinessScore || 0
  const scoreClass = score >= 70 ? 'score-high' : score >= 40 ? 'score-medium' : 'score-low'

  return (
    <div className="card" onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default', transition:'all 0.2s', userSelect:'none' }}
      onMouseEnter={e => { if (onClick) { e.currentTarget.style.borderColor='var(--border-light)'; e.currentTarget.style.transform='translateY(-2px)' }}}
      onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='none' }}
    >
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:14 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:42, height:42, borderRadius:'50%', background:'var(--bg-hover)', border:'1px solid var(--border-light)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-display)', fontWeight:800, color:'var(--accent)', fontSize:'1rem' }}>
            {student.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'0.95rem', color:'var(--text-primary)' }}>{student.name}</div>
            <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', fontFamily:'var(--font-display)', letterSpacing:'0.04em' }}>{student.enrollmentNumber}</div>
          </div>
        </div>
        <span className={`badge ${status.cls}`}>{status.label}</span>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:14 }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:'1.1rem', fontFamily:'var(--font-display)', fontWeight:800, color:'var(--text-primary)' }}>{student.cgpa?.toFixed(1) || '—'}</div>
          <div style={{ fontSize:'0.65rem', color:'var(--text-muted)', letterSpacing:'0.06em', textTransform:'uppercase' }}>CGPA</div>
        </div>
        <div style={{ textAlign:'center', borderLeft:'1px solid var(--border)', borderRight:'1px solid var(--border)' }}>
          <div style={{ fontSize:'1.1rem', fontFamily:'var(--font-display)', fontWeight:800, color:'var(--text-primary)' }}>{student.projects?.length || 0}</div>
          <div style={{ fontSize:'0.65rem', color:'var(--text-muted)', letterSpacing:'0.06em', textTransform:'uppercase' }}>Projects</div>
        </div>
        <div style={{ textAlign:'center' }}>
          <div className={scoreClass} style={{ fontSize:'1.1rem', fontFamily:'var(--font-display)', fontWeight:800 }}>{score}</div>
          <div style={{ fontSize:'0.65rem', color:'var(--text-muted)', letterSpacing:'0.06em', textTransform:'uppercase' }}>Score</div>
        </div>
      </div>

      {student.technicalSkills?.length > 0 && (
        <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
          {student.technicalSkills.slice(0,4).map(s => <span key={s} className="chip">{s}</span>)}
          {student.technicalSkills.length > 4 && <span className="chip" style={{ color:'var(--text-muted)' }}>+{student.technicalSkills.length-4}</span>}
        </div>
      )}
    </div>
  )
}