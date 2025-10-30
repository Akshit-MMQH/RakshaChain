import { BrowserRouter, Routes, Route } from 'react-router-dom'

import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import DispatchPage from './pages/DispatchPage'
import CheckpointPage from './pages/CheckpointPage'
import AdminPage from './pages/AdminPage'
import ReceivingPage from './pages/ReceivingPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/checkpoint/login" element={<LoginPage />} />
        <Route path="/receiving/login" element={<LoginPage />} />
        <Route path="/dispatch" element={<DispatchPage />} />
        <Route path="/checkpoint" element={<CheckpointPage />} />
        <Route path="/receiving" element={<ReceivingPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App