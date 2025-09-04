
import { useEffect, useState } from 'react'
import { api } from '../api'

export default function ApprovalFeed() {
  const [requests, setRequests] = useState([])
  const [error, setError] = useState('')

  async function load() {
    try {
      const res = await api.get('/requests')
      setRequests(res.data)
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to load')
    }
  }

  useEffect(() => { load() }, [])

  async function updateStatus(id, status) {
    const payload = { status }
    if (status === 'Denied') {
      const reason = prompt('Reason for denial?')
      if (!reason) return
      payload.denialReason = reason
    }
    if (status === 'Fulfilled') {
      const proof = prompt('Provide fulfillment proof URL or note')
      payload.fulfillmentProof = proof || ''
    }
    await api.patch('/requests/' + id + '/status', payload)
    await load()
  }

  return (
    <div className="container">
      <div className="card">
        <h2>Approvals (Afee)</h2>
        {error && <div className="small" style={{color:'crimson'}}>{error}</div>}
        {!requests.length && <div>No requests yet.</div>}
        {requests.map(r => (
          <div key={r._id} className="card">
            <div style={{display:'flex', justifyContent:'space-between'}}>
              <div><strong>{r.category}</strong> {r.title ? `– ${r.title}` : ''}</div>
              <span className={'badge ' + r.status}>{r.status}</span>
            </div>
            <div className="small">Amount: ${r.amount} • Importance: {r.assignedValue} • Due: {new Date(r.approvalDeadline).toLocaleDateString()}</div>
            {r.description && <div className="small">{r.description}</div>}
            <div className="row" style={{marginTop:8}}>
              <button onClick={()=>updateStatus(r._id,'Acknowledged')}>Acknowledge</button>
              <button className="secondary" onClick={()=>updateStatus(r._id,'Denied')}>Deny</button>
            </div>
            <div className="row">
              <button className="primary" onClick={()=>updateStatus(r._id,'Fulfilled')}>Mark Fulfilled</button>
              {r.fulfillmentProof && <a href={r.fulfillmentProof} target="_blank" rel="noreferrer">View Proof</a>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
