
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { isAdminAuthenticated, setAdminAuthenticated } from '../lib/adminAuth';

// Shipment type
type Shipment = {
  name: string;
  id: string;
  supply: string;
  initLoc: string;
  finalLoc: string;
  date: string;
  status?: string;
};

type CheckpointScan = {
  data: string;
  date: string;
};

const ADMIN_USERNAME = 'ADMIN';
const ADMIN_PASSWORD = 'ADMIN123';

const AdminPage: React.FC = () => {
  const [authed, setAuthed] = useState(isAdminAuthenticated());
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loadingShipments, setLoadingShipments] = useState(true);
  const [checkpointScans, setCheckpointScans] = useState<CheckpointScan[]>([]);

  const navigate = useNavigate();

  // Fetch shipments from backend
  useEffect(() => {
    if (!authed) return;
    const fetchShipments = async () => {
      setLoadingShipments(true);
      try {
        const res = await fetch('http://localhost:5000/api/shipments');
        if (!res.ok) throw new Error('Failed to fetch shipments');
        const data = await res.json();
        setShipments(data);
      } catch (e) {
        setShipments([]);
      } finally {
        setLoadingShipments(false);
      }
    };
    fetchShipments();
  }, [authed]);

  // Load checkpoint scans from localStorage
  useEffect(() => {
    if (!authed) return;
    const scans = localStorage.getItem('checkpoint-scans');
    if (scans) {
      setCheckpointScans(JSON.parse(scans));
    } else {
      setCheckpointScans([]);
    }
  }, [authed]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setAdminAuthenticated(true);
      setAuthed(true);
      setError('');
    } else {
      setError('Invalid admin credentials');
    }
  };

  const handleLogout = () => {
    setAdminAuthenticated(false);
    setAuthed(false);
    setUsername('');
    setPassword('');
    // Navigate back to landing page after logout
    navigate('/');
  };

  if (!authed) {
    return (
      <div className="min-h-screen w-full bg-[#0f0f0f] relative text-white flex items-center justify-center">
        {/* Small Grid Pattern */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, #262626 1px, transparent 1px),
              linear-gradient(to bottom, #262626 1px, transparent 1px)
            `,
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative z-10 w-full max-w-md mx-auto" style={{ padding: 'clamp(24px, 6vw, 48px)', borderRadius: 24, background: 'rgba(0,0,0,0.7)', boxShadow: '0 4px 32px 0 rgba(0,0,0,0.25)', border: '2.5px solid rgba(255,255,255,0.08)' }}>
          <h1 style={{ fontFamily: 'Orbitron, sans-serif', fontWeight: 700, fontSize: 'clamp(1.5rem, 2.8vw, 2rem)', color: 'rgb(242,242,242)', textAlign: 'center', marginBottom: 24 }}>Admin Login</h1>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 18 }}>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  marginBottom: 12,
                  borderRadius: 12,
                  border: '2px solid rgba(255,255,255,0.15)',
                  background: 'rgba(0,0,0,0.5)',
                  color: '#fff',
                  fontFamily: 'Source Code Pro, monospace',
                  fontSize: 'clamp(15px, 2vw, 18px)',
                  outline: 'none',
                  letterSpacing: '0.02em',
                }}
                autoFocus
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 12,
                  border: '2px solid rgba(255,255,255,0.15)',
                  background: 'rgba(0,0,0,0.5)',
                  color: '#fff',
                  fontFamily: 'Source Code Pro, monospace',
                  fontSize: 'clamp(15px, 2vw, 18px)',
                  outline: 'none',
                  letterSpacing: '0.02em',
                }}
              />
            </div>
            {error && <div style={{ color: '#ff4d4f', marginBottom: 12, textAlign: 'center', fontFamily: 'Source Code Pro, monospace' }}>{error}</div>}
            <button
              type="submit"
              style={{
                width: '100%',
                padding: 'clamp(12px, 2.5vh, 16px)',
                borderRadius: 16,
                border: '2.5px solid rgba(255,255,255,0.15)',
                background: 'rgba(0,0,0,0.8)',
                color: '#fff',
                fontFamily: 'doto, sans-serif',
                fontWeight: 600,
                fontSize: 'clamp(15px, 2vw, 18px)',
                letterSpacing: '0.02em',
                cursor: 'pointer',
                textTransform: 'uppercase',
                transition: 'all 0.3s ease',
                marginTop: 8,
                boxShadow: '0 2px 12px 0 rgba(0,0,0,0.10)'
              }}
            >Login</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#0f0f0f] relative text-white" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Small Grid Pattern */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, #262626 1px, transparent 1px),
            linear-gradient(to bottom, #262626 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
        }}
      />
      <div className="relative z-10 max-w-[1200px] px-4" style={{ 
          marginLeft: 'auto', 
          marginRight: 'auto', 
          width: '85%',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          paddingTop: 'clamp(80px, 10vh, 120px)',
          paddingBottom: '40px'
        }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', padding: '0 20px' }}>
          <h1 style={{ fontFamily: 'Orbitron, sans-serif', fontWeight: 700, fontSize: 'clamp(1.5rem, 2.8vw, 2rem)', color: 'rgb(242,242,242)' }}>Admin Page</h1>
          <button
            onClick={handleLogout}
            style={{
              fontFamily: 'doto, sans-serif',
              fontSize: 'clamp(12px, 1.5vw, 14px)',
              fontWeight: 600,
              padding: '8px 18px',
              border: '2px solid rgba(255,255,255,0.3)',
              borderRadius: '20px',
              backgroundColor: 'rgba(0,0,0,0.8)',
              color: '#fff',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          >Logout</button>
        </div>

        {/* Shipments Section */}
        <section style={{ 
          marginTop: 40, 
          marginBottom: 40,
          padding: '24px',
          background: 'rgba(0,0,0,0.4)',
          border: '2.5px solid rgba(255,255,255,0.1)',
          borderRadius: '24px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.2)'
        }}>
          <h2 style={{ 
            fontSize: 22, 
            marginBottom: 20, 
            fontFamily: 'Orbitron, sans-serif', 
            color: '#fff',
            paddingBottom: '12px',
            borderBottom: '2px solid rgba(255,255,255,0.1)'
          }}>Shipments</h2>
          {loadingShipments ? (
            <div style={{ fontFamily: 'Source Code Pro, monospace', color: 'rgba(255,255,255,0.7)' }}>Loading shipments...</div>
          ) : shipments.length === 0 ? (
            <div style={{ fontFamily: 'Source Code Pro, monospace', color: 'rgba(255,255,255,0.7)' }}>No shipments found.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', background: 'rgba(0,0,0,0.3)', borderRadius: 16, textAlign: 'center' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <th style={{ padding: 12, fontFamily: 'Source Code Pro, monospace', fontSize: 14, color: '#fff', textAlign: 'center' }}>Name</th>
                    <th style={{ padding: 12, fontFamily: 'Source Code Pro, monospace', fontSize: 14, color: '#fff', textAlign: 'center' }}>ID</th>
                    <th style={{ padding: 12, fontFamily: 'Source Code Pro, monospace', fontSize: 14, color: '#fff', textAlign: 'center' }}>Supply</th>
                    <th style={{ padding: 12, fontFamily: 'Source Code Pro, monospace', fontSize: 14, color: '#fff', textAlign: 'center' }}>Initial Location</th>
                    <th style={{ padding: 12, fontFamily: 'Source Code Pro, monospace', fontSize: 14, color: '#fff', textAlign: 'center' }}>Final Location</th>
                    <th style={{ padding: 12, fontFamily: 'Source Code Pro, monospace', fontSize: 14, color: '#fff', textAlign: 'center' }}>Date</th>
                    <th style={{ padding: 12, fontFamily: 'Source Code Pro, monospace', fontSize: 14, color: '#fff', textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {shipments.map((s) => (
                    <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      <td style={{ padding: 12, fontFamily: 'Source Code Pro, monospace', fontSize: 15, color: '#fff', textAlign: 'center' }}>{s.name}</td>
                      <td style={{ padding: 12, fontFamily: 'Source Code Pro, monospace', fontSize: 15, color: '#fff', textAlign: 'center' }}>{s.id}</td>
                      <td style={{ padding: 12, fontFamily: 'Source Code Pro, monospace', fontSize: 15, color: '#fff', textAlign: 'center' }}>{s.supply}</td>
                      <td style={{ padding: 12, fontFamily: 'Source Code Pro, monospace', fontSize: 15, color: '#fff', textAlign: 'center' }}>{s.initLoc}</td>
                      <td style={{ padding: 12, fontFamily: 'Source Code Pro, monospace', fontSize: 15, color: '#fff', textAlign: 'center' }}>{s.finalLoc}</td>
                      <td style={{ padding: 12, fontFamily: 'Source Code Pro, monospace', fontSize: 15, color: '#fff', textAlign: 'center' }}>{s.date}</td>
                      <td style={{ padding: 12, fontFamily: 'Source Code Pro, monospace', fontSize: 15, textAlign: 'center' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '12px',
                          backgroundColor: s.status === 'received' ? 'rgba(0, 255, 0, 0.2)' : 'rgba(255, 255, 0, 0.2)',
                          color: s.status === 'received' ? '#00ff00' : '#ffff00'
                        }}>
                          {s.status === 'received' ? 'Received' : 'Not Received'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Checkpoint Scans Section */}
        <section style={{ 
          marginTop: 40, 
          marginBottom: 40,
          padding: '24px',
          background: 'rgba(0,0,0,0.4)',
          border: '2.5px solid rgba(255,255,255,0.1)',
          borderRadius: '24px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.2)'
        }}>
          <h2 style={{ 
            fontSize: 22, 
            marginBottom: 20, 
            fontFamily: 'Orbitron, sans-serif', 
            color: '#fff',
            paddingBottom: '12px',
            borderBottom: '2px solid rgba(255,255,255,0.1)'
          }}>Checkpoint Scans</h2>
          {checkpointScans.length === 0 ? (
            <div style={{ fontFamily: 'Source Code Pro, monospace', color: 'rgba(255,255,255,0.7)' }}>No checkpoint scans found.</div>
          ) : (
            <ul style={{ paddingLeft: 0, listStyle: 'none', margin: 0 }}>
              {checkpointScans.map((scan, idx) => (
                <li key={idx} style={{ 
                  marginBottom: 16, 
                  background: 'rgba(0,0,0,0.3)', 
                  padding: 16, 
                  borderRadius: 12, 
                  fontFamily: 'Source Code Pro, monospace', 
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.1)',
                  transition: 'all 0.3s ease'
                }}>
                  <div><b style={{ color: 'rgba(255,255,255,0.7)' }}>Data:</b> <span style={{ wordBreak: 'break-all', color: '#fff' }}>{scan.data}</span></div>
                  <div><b style={{ color: 'rgba(255,255,255,0.7)' }}>Date:</b> <span style={{ color: '#fff' }}>{scan.date}</span></div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Receiving Officer section placeholder */}
        <section style={{ 
          marginTop: 40, 
          marginBottom: 40,
          padding: '24px',
          background: 'rgba(0,0,0,0.4)',
          border: '2.5px solid rgba(255,255,255,0.1)',
          borderRadius: '24px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.2)'
        }}>
          <h2 style={{ 
            fontSize: 22, 
            marginBottom: 20, 
            fontFamily: 'Orbitron, sans-serif', 
            color: '#fff',
            paddingBottom: '12px',
            borderBottom: '2px solid rgba(255,255,255,0.1)'
          }}>Receiving Officer</h2>
          <div style={{ fontFamily: 'Source Code Pro, monospace', color: 'rgba(255,255,255,0.7)' }}>Info will be added here later.</div>
        </section>
      </div>
    </div>
  );
};

export default AdminPage;
