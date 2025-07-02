import { useState, useEffect } from 'react'
import VisitorParentForm from './components/VisitorParentForm';
import AdminPanel from './components/AdminPanel';
import AdminLogin from './components/AdminLogin';
import { QRCodeCanvas } from 'qrcode.react';
import './App.css';

const defaultConfig = {
  whatsappNumbers: ["+911234567890", "+919876543210"],
  emails: ["admin@example.com", ""],
  parentPickupEmails: ["", ""], // NEW: for parent pickup only
  wifi: { ssid: "", password: "", encryption: "WPA" },
  gmail: '',
  gmailAppPassword: '',
  logoUrl: '', // logo image url (admin set)
};

function getWifiQR({ ssid, password, encryption }, pageUrl) {
  // WiFi QR code with page URL (custom format for demo)
  return `WIFI:T:${encryption};S:${ssid};P:${password};;URL:${pageUrl}`;
}

function App() {
  const [showAdmin, setShowAdmin] = useState(false);
  const [config, setConfig] = useState(() => {
    // Try to load config from localStorage
    const saved = localStorage.getItem('adminConfig');
    return saved ? JSON.parse(saved) : defaultConfig;
  });
  const [activeTab, setActiveTab] = useState('meeting');
  const [adminAuthed, setAdminAuthed] = useState(false);
  const wifiReady = config.wifi.ssid && config.wifi.password;
  const pageUrl = window.location.href;

  // Save config to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('adminConfig', JSON.stringify(config));
  }, [config]);

  return (
    <div style={{
      maxWidth: 520,
      margin: '2em auto',
      fontFamily: 'system-ui, sans-serif',
      position: 'relative',
      background: '#fff',
      borderRadius: 18,
      boxShadow: '0 6px 32px #1976d222',
      padding: 0,
      overflow: 'hidden',
    }}>
      {/* Header with logo on left */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'linear-gradient(90deg, #e3f0ff 60%, #fff 100%)',
        padding: '18px 28px 18px 18px',
        borderBottom: '1.5px solid #e0e6ed',
        minHeight: 80,
      }}>
        {config.logoUrl && !showAdmin && (
          <img
            src={config.logoUrl}
            alt="Logo"
            style={{ height: 96, width: 96, objectFit: 'contain', borderRadius: 12, background: 'transparent', boxShadow: '0 2px 12px #1976d111' }}
          />
        )}
        <div style={{ flex: 1 }} />
        <button
          onClick={() => setShowAdmin((v) => !v)}
          style={{
            background: '#1976d2',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 16,
            padding: '0.7em 1.5em',
            boxShadow: '0 2px 8px #1976d222',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseOver={e => e.currentTarget.style.background = '#1251a3'}
          onMouseOut={e => e.currentTarget.style.background = '#1976d2'}
        >
          {showAdmin ? 'Back to App' : 'Admin Panel'}
        </button>
      </div>
      <div style={{ padding: 32 }}>
        {showAdmin ? (
          !adminAuthed ? (
            <AdminLogin onLogin={() => setAdminAuthed(true)} />
          ) : (
            <AdminPanel
              config={config}
              setConfig={c => {
                setConfig(c);
                localStorage.setItem('adminConfig', JSON.stringify(c));
              }}
              pageUrl={pageUrl}
            />
          )
        ) : (
          <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 8px #0001', padding: 24 }}>
            <div style={{ display: 'flex', marginBottom: 24, gap: 0 }}>
              <button
                style={{
                  flex: 1,
                  background: activeTab === 'meeting' ? '#1976d2' : '#f3f3f3',
                  color: activeTab === 'meeting' ? '#fff' : '#333',
                  border: 'none',
                  borderRadius: '8px 0 0 8px',
                  fontWeight: 'bold',
                  fontSize: 16,
                  padding: '0.75em',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onClick={() => setActiveTab('meeting')}
              >
                Meeting
              </button>
              <button
                style={{
                  flex: 1,
                  background: activeTab === 'pickup' ? '#1976d2' : '#f3f3f3',
                  color: activeTab === 'pickup' ? '#fff' : '#333',
                  border: 'none',
                  borderRadius: '0 8px 8px 0',
                  fontWeight: 'bold',
                  fontSize: 16,
                  padding: '0.75em',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onClick={() => setActiveTab('pickup')}
              >
                Parent Pickup
              </button>
            </div>
            <VisitorParentForm config={config} activeTab={activeTab} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
