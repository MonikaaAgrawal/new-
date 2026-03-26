import React from 'react'
import { useState, useRef } from 'react'
import { API } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { Upload, FileText, CheckCircle, AlertCircle, Download, X } from 'lucide-react'

export default function UploadData() {
  const [file,      setFile]      = useState(null)
  const [uploading, setUploading] = useState(false)
  const [result,    setResult]    = useState(null)
  const [dragging,  setDragging]  = useState(false)
  const inputRef = useRef()

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f?.name.endsWith('.csv')) setFile(f)
    else toast.error('Please upload a .csv file')
  }

  const handleUpload = async () => {
    if (!file) return toast.error('Select a file first')
    setUploading(true); setResult(null)
    try {
      const fd = new FormData(); fd.append('file', file)
      const { data } = await API.post('/admin/upload-students', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setResult(data); toast.success(data.message)
    } catch (err) { toast.error(err?.response?.data?.message || 'Upload failed') }
    finally { setUploading(false) }
  }

  const downloadSample = () => {
    const csv = ['enrollmentNumber,name,email,phone,division,batch,cgpa,technicalSkills,programmingLanguages','IT21001,Rahul Sharma,rahul@it.edu,9876543210,A,2021-2025,8.5,React|Node.js|MongoDB,JavaScript|Python','IT21002,Priya Patel,priya@it.edu,9876543211,B,2021-2025,7.8,Python|ML|Django,Python|Java'].join('\n')
    const blob = new Blob([csv], { type:'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href=url; a.download='sample_students.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="page-enter">
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:'1.5rem', fontWeight:800, letterSpacing:'-0.03em' }}>Upload Student Data</h1>
        <p style={{ color:'var(--text-muted)', fontSize:'0.875rem', marginTop:4 }}>Bulk import students via CSV file</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:20 }}>
        <div>
          <div className="card" onDragOver={e => { e.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={handleDrop} onClick={() => !file && inputRef.current?.click()}
            style={{ border:`2px dashed ${dragging ? 'var(--accent)' : file ? 'var(--green)' : 'var(--border-light)'}`, background: dragging ? 'var(--accent-glow-lg)' : 'var(--bg-surface)', cursor: file ? 'default' : 'pointer', textAlign:'center', padding:'48px 24px', transition:'all 0.2s', marginBottom:16 }}>
            <input ref={inputRef} type="file" accept=".csv" style={{ display:'none' }} onChange={e => setFile(e.target.files[0])} />
            {file ? (
              <div>
                <FileText size={40} color="var(--green)" style={{ marginBottom:12 }} />
                <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'1rem', marginBottom:4 }}>{file.name}</div>
                <div style={{ color:'var(--text-muted)', fontSize:'0.8rem', marginBottom:16 }}>{(file.size/1024).toFixed(1)} KB</div>
                <button className="btn btn-ghost" style={{ fontSize:'0.8rem' }} onClick={e => { e.stopPropagation(); setFile(null); setResult(null) }}><X size={13} /> Remove</button>
              </div>
            ) : (
              <div>
                <Upload size={40} color="var(--text-muted)" style={{ marginBottom:12 }} />
                <div style={{ fontFamily:'var(--font-display)', fontWeight:700, marginBottom:6 }}>Drop CSV file here or click to browse</div>
                <div style={{ color:'var(--text-muted)', fontSize:'0.8rem' }}>Supports .csv files only</div>
              </div>
            )}
          </div>

          <button className="btn btn-primary" onClick={handleUpload} disabled={!file || uploading} style={{ width:'100%', justifyContent:'center', padding:14, fontSize:'0.95rem' }}>
            {uploading ? <><div className="spinner" style={{ width:16, height:16 }} /> Uploading…</> : <><Upload size={16} /> Upload & Import Students</>}
          </button>

          {result && (
            <div className="card" style={{ marginTop:16, borderColor: result.errors?.length ? 'var(--red)' : 'var(--green)' }}>
              <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom: result.errors?.length ? 12 : 0 }}>
                <CheckCircle size={18} color="var(--green)" />
                <span style={{ color:'var(--text-primary)', fontFamily:'var(--font-display)', fontWeight:700 }}>{result.message}</span>
              </div>
              {result.errors?.length > 0 && (
                <div style={{ marginTop:12 }}>
                  <div style={{ fontSize:'0.75rem', color:'var(--red)', marginBottom:6, fontFamily:'var(--font-display)', fontWeight:700 }}>{result.errors.length} ERRORS</div>
                  {result.errors.slice(0,5).map((e,i) => (
                    <div key={i} style={{ display:'flex', gap:8, alignItems:'center', marginBottom:4 }}>
                      <AlertCircle size={12} color="var(--red)" />
                      <span style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>{e.row}: {e.error}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div className="card">
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
              <h3 style={{ fontSize:'0.9rem', fontWeight:700 }}>CSV Format</h3>
              <button className="btn btn-ghost" style={{ padding:'5px 10px', fontSize:'0.75rem' }} onClick={downloadSample}><Download size={12} /> Sample</button>
            </div>
            {[{col:'enrollmentNumber',req:true,note:'Unique e.g. IT21001'},{col:'name',req:true,note:'Full name'},{col:'email',req:true,note:'Student email'},{col:'phone',req:false,note:'10-digit'},{col:'division',req:false,note:'A/B/C/D'},{col:'batch',req:false,note:'e.g. 2021-2025'},{col:'cgpa',req:true,note:'0.00 to 10.00'},{col:'technicalSkills',req:false,note:'Pipe-separated'},{col:'programmingLanguages',req:false,note:'Pipe-separated'}].map(({ col, req, note }) => (
              <div key={col} style={{ display:'flex', gap:8, alignItems:'flex-start', marginBottom:8 }}>
                <span style={{ color: req ? 'var(--accent)' : 'var(--text-muted)', marginTop:2 }}>•</span>
                <div>
                  <span style={{ fontFamily:'var(--font-display)', fontSize:'0.75rem', fontWeight:700, color:'var(--text-primary)' }}>{col}</span>
                  {req && <span style={{ fontSize:'0.65rem', color:'var(--red)', marginLeft:4 }}>required</span>}
                  <div style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>{note}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="card" style={{ background:'var(--accent-glow-lg)', borderColor:'rgba(245,166,35,0.2)' }}>
            <h4 style={{ fontSize:'0.85rem', color:'var(--accent)', marginBottom:8, fontFamily:'var(--font-display)' }}>💡 Pro Tips</h4>
            {['AI readiness score auto-calculates on import','Duplicate enrollment numbers are skipped','Skills use pipe (|) separator not comma','CGPA must be decimal e.g. 7.85'].map((tip,i) => (
              <div key={i} style={{ fontSize:'0.78rem', color:'var(--text-secondary)', display:'flex', gap:6, marginBottom:6 }}><span style={{ color:'var(--accent)' }}>→</span>{tip}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}