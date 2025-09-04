
import { useState } from 'react'
import { api, setAuth } from '../api'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleLogin(e) {
    e.preventDefault()
    try {
      const res = await api.post('/auth/login', { username, password })
      setAuth(res.data)
      location.href = '/'
    } catch (e) {
      setError(e.response?.data?.error || 'Login failed')
    }
  }

  return (
    <div className="container">
      <div className="card">
        <h2>Login</h2>
        <form onSubmit={handleLogin} className="flex-col" style={{display:'flex', gap:8}}>
          <input placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} />
          <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
          {error && <div className="small" style={{color:'crimson'}}>{error}</div>}
          <button className="primary">Login</button>
        </form>
        <p className="small">Use the seeded accounts you'll create on the server: Ali (requester) or Afee (approver).</p>
      </div>
    </div>
  )
}
