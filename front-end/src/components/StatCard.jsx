import React from 'react'

export default function StatCard({ label, value, sub, icon: Icon, color = 'var(--accent)', trend }) {
  return (
    <div className="stat-card">
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:12 }}>
        <div style={{ width:40, height:40, borderRadius:'var(--radius)', background:`${color}18`, border:`1px solid ${color}30`, display:'flex', alignItems:'center', justifyContent:'center' }}>
          {Icon && <Icon size={18} color={color} strokeWidth={2} />}
        </div>
        {trend !== undefined && (
          <span style={{ fontSize:'0.72rem', fontWeight:700, fontFamily:'var(--font-display)', color: trend >= 0 ? 'var(--green)' : 'var(--red)', background: trend >= 0 ? 'var(--green-dim)' : 'var(--red-dim)', padding:'2px 8px', borderRadius:99 }}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div style={{ fontFamily:'var(--font-display)', fontSize:'1.8rem', fontWeight:800, color:'var(--text-primary)', lineHeight:1 }}>{value}</div>
      <div style={{ marginTop:6, fontSize:'0.8rem', fontFamily:'var(--font-display)', fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>{label}</div>
      {sub && <div style={{ marginTop:4, fontSize:'0.75rem', color:'var(--text-muted)' }}>{sub}</div>}
    </div>
  )
}