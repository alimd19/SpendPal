
import { useEffect, useState } from 'react'
import { api, getAuth } from '../api'

function msToHuman(ms) {
  if (!ms && ms !== 0) return 'N/A'
  const s = Math.round(ms/1000)
  const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), ss = s%60
  const parts = []
  if (h) parts.push(h+'h')
  if (m) parts.push(m+'m')
  parts.push(ss+'s')
  return parts.join(' ')
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [requests, setRequests] = useState([])
  const auth = getAuth()

  useEffect(()=>{
    fetch((import.meta.env.VITE_API_BASE || 'http://localhost:5000')+'/api/public/summary')
      .then(r=>r.json()).then(setSummary)
    fetch((import.meta.env.VITE_API_BASE || 'http://localhost:5000')+'/api/public/requests')
      .then(r=>r.json()).then(setRequests)
  }, [])

  return (
    <div className="container">
      <div className="card">
        <h2>Public Dashboard</h2>
        {!summary ? <div>Loading...</div> :
          <div className="row">
            <div>
              <p><strong>Total Requests:</strong> {summary.totalRequests}</p>
              <p><strong>Pending:</strong> {summary.pending} | <strong>Acknowledged:</strong> {summary.acknowledged}</p>
              <p><strong>Fulfilled:</strong> {summary.fulfilled} | <strong>Denied:</strong> {summary.denied}</p>
            </div>
            <div>
              <p><strong>Avg Ack Time:</strong> {msToHuman(summary.avgAckMs)}</p>
              <p><strong>Avg Fulfill Time:</strong> {msToHuman(summary.avgFulfillMs)}</p>
              <p><strong>Avg Denial Time:</strong> {msToHuman(summary.avgDenyMs)}</p>
              <p><strong>Total Value Added (Assigned):</strong> {summary.totalValueAddedByAssignedValue}</p>
            </div>
          </div>
        }
      </div>

      <div className="card">
        <h3>Request History (Public)</h3>
        {requests.map(r => (
          <div key={r._id} className="card" style={{margin: '10px 0'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div><strong>{r.category}</strong> {r.title ? `– ${r.title}` : ''}</div>
              <span className={'badge ' + r.status}>{r.status}</span>
            </div>
            <div className="small">Amount: ${r.amount} • Importance: {r.assignedValue} • Due: {new Date(r.approvalDeadline).toLocaleDateString()}</div>
            {r.description && <div className="small">{r.description}</div>}
          </div>
        ))}
      </div>

      {auth?.role === 'approver' && (
        <div className="small">Tip: As approver, go to the Approvals tab to process requests.</div>
      )}
    </div>
  )
}
