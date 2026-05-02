import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Expenses from './pages/Expenses'
import Income from './pages/Income'
import Udhar from './pages/Udhar'
import AllEntries from './pages/AllEntries'
import Reports from './pages/Reports'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUserDetail from './pages/admin/AdminUserDetail'
import AdminReports from './pages/admin/AdminReports'
import Layout from './components/Layout'

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',color:'var(--muted)'}}>Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#0d1220',
              color: '#e2e8f0',
              border: '1px solid #1e2d45',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '0.875rem',
            },
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="income" element={<Income />} />
            <Route path="udhar" element={<Udhar />} />
            <Route path="all-entries" element={<AllEntries />} />
            <Route path="reports" element={<Reports />} />
            <Route path="admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
            <Route path="admin/users/:userId" element={<ProtectedRoute adminOnly><AdminUserDetail /></ProtectedRoute>} />
            <Route path="admin/users/:userId/reports" element={<ProtectedRoute adminOnly><AdminReports /></ProtectedRoute>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}