
import { useState } from 'react'
import { api } from '../api'

export default function NewRequest() {
  const [form, setForm] = useState({
    category: "Gas",
    title: "",
    amount: 0,
    approvalDeadline: "",
    description: "",
    suggestedMethod: "Gift Card",
    customMethod: "",
    recurring: false,
    assignedValue: 5
  })
  const [msg, setMsg] = useState("")

  const set = (k,v)=> setForm(f=>({...f,[k]:v}))

  async function submit() {
    try {
      const res = await api.post('/requests', form)
      setMsg("Request submitted! ID: " + res.data._id)
      setForm({ ...form, amount: 0, description: "", title:"" })
    } catch (e) {
      setMsg(e.response?.data?.error || 'Failed to submit')
    }
  }

  return (
    <div className="container">
      <div className="card">
        <h2>Create New Request</h2>
        <div className="row">
          <div>
            <label>Category</label>
            <select value={form.category} onChange={e=>set('category', e.target.value)}>
              <option>Gas</option>
              <option>Groceries</option>
              <option>Gym Membership</option>
              <option>Food & Dining</option>
              <option>Car Maintenance</option>
              <option>Wild Card</option>
            </select>
          </div>
          <div>
            <label>Assigned Value (1-10)</label>
            <input type="range" min="1" max="10" value={form.assignedValue} onChange={e=>set('assignedValue', parseInt(e.target.value))} />
            <div className="small">Importance: {form.assignedValue}</div>
          </div>
        </div>

        {form.category === 'Wild Card' && (
          <div>
            <label>Title for Wild Card</label>
            <input placeholder="e.g., Last-minute bus ticket" value={form.title} onChange={e=>set('title', e.target.value)} />
          </div>
        )}

        <div className="row">
          <div>
            <label>Amount Needed</label>
            <input type="number" value={form.amount} onChange={e=>set('amount', parseFloat(e.target.value))} />
          </div>
          <div>
            <label>Approval Deadline</label>
            <input type="date" value={form.approvalDeadline} onChange={e=>set('approvalDeadline', e.target.value)} />
          </div>
        </div>

        <div>
          <label>Description</label>
          <textarea value={form.description} onChange={e=>set('description', e.target.value)} placeholder="Describe what you need and why..." />
        </div>

        <div className="row">
          <div>
            <label>Suggested Fulfillment Method</label>
            <select value={form.suggestedMethod} onChange={e=>set('suggestedMethod', e.target.value)}>
              <option>Gift Card</option>
              <option>Prepaid Card</option>
              <option>Vendor Payment</option>
              <option>Other</option>
            </select>
          </div>
          {form.suggestedMethod === 'Other' && (
            <div>
              <label>Custom Method</label>
              <input placeholder="Describe the custom method..." value={form.customMethod} onChange={e=>set('customMethod', e.target.value)} />
            </div>
          )}
        </div>

        <div>
          <label><input type="checkbox" checked={form.recurring} onChange={e=>set('recurring', e.target.checked)} /> Recurring Request</label>
          <div className="small">Recurring requests auto-resubmit when you mark them as used.</div>
        </div>

        <button className="primary" onClick={submit}>Submit Request</button>
        {msg && <div className="small">{msg}</div>}
      </div>
    </div>
  )
}
