
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import './styles.css'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import NewRequest from './pages/NewRequest'
import ApprovalFeed from './pages/ApprovalFeed'
import { getAuth, logout } from './api'

function NavBar() {
  const auth = getAuth()
  return (
    <div className="nav container">
      <NavLink to="/" end className={({isActive})=> isActive ? 'active' : ''}>Public Dashboard</NavLink>
      {auth?.role === 'requester' && <NavLink to="/new" className={({isActive})=> isActive ? 'active' : ''}>New Request</NavLink>}
      {auth?.role === 'approver' && <NavLink to="/approvals" className={({isActive})=> isActive ? 'active' : ''}>Approvals</NavLink>}
      {!auth && <NavLink to="/login" className={({isActive})=> isActive ? 'active' : ''}>Login</NavLink>}
      {auth && <a href="#" onClick={(e)=>{e.preventDefault(); logout(); location.href='/';}}>Logout ({auth.username})</a>}
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/new" element={<NewRequest />} />
        <Route path="/approvals" element={<ApprovalFeed />} />
      </Routes>
    </BrowserRouter>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
