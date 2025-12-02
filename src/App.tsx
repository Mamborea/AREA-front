import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAppSelector, useGetProfileQuery } from 'shared-redux/web'
import { Navbar } from './components'
import { Login, Register, Dashboard, Profile, GitHub } from './pages'
import './App.css'

function App() {
  const { isAuthenticated, token } = useAppSelector((state) => state.auth)

  const { isLoading } = useGetProfileQuery(undefined, {
    skip: !token,
  })

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            {isAuthenticated ? (
              <>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/github" element={<GitHub />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </>
            ) : (
              <>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </>
            )}
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App;
