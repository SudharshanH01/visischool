import React, { useState, useRef } from "react";
import { QRCodeCanvas } from 'qrcode.react';

const defaultConfig = {
  wifi: { ssid: "", password: "", encryption: "WPA" },
  gmail: '',
  gmailAppPassword: '',
};

export default function AdminPanel({ config, setConfig, pageUrl }) {
  const [localConfig, setLocalConfig] = useState(() => ({ ...config }));
  const [saveMsg, setSaveMsg] = useState("");
  const wifiQRRef = useRef(null);
  const pageQRRef = useRef(null);

  // Sync localConfig with config prop (for showing saved config on login)
  React.useEffect(() => {
    setLocalConfig({ ...config });
  }, [config]);

  // Modern color palette
  const palette = {
    card: '#f9fbfd',
    accent: '#1976d2',
    border: '#e0e6ed',
    label: '#222b45',
    inputBg: '#fff',
    inputText: '#222b45',
    button: 'linear-gradient(90deg, #1976d2 60%, #42a5f5 100%)',
    buttonText: '#fff',
    buttonHover: '#1251a3',
    shadow: '0 8px 32px #1976d222',
    sectionBg: '#f3f8fe',
  };

  const fieldStyle = {
    width: '100%',
    padding: '0.85em 1.1em',
    borderRadius: 12,
    border: `1.5px solid ${palette.border}`,
    background: palette.inputBg,
    color: palette.inputText,
    fontSize: 17,
    outline: 'none',
    boxShadow: '0 2px 8px #1976d211',
    transition: 'border 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    color: palette.label,
    fontWeight: 600,
    fontSize: 16,
    marginBottom: 2,
    display: 'block',
    letterSpacing: 0.1,
  };

  const sectionTitle = {
    color: palette.accent,
    fontWeight: 800,
    fontSize: 22,
    margin: '0 0 18px 0',
    letterSpacing: 0.7,
    textShadow: '0 2px 8px #1976d211',
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (["ssid", "password", "encryption", "gmail", "gmailAppPassword"].includes(name)) {
      if (name === "gmail" || name === "gmailAppPassword") {
        setLocalConfig({ ...localConfig, [name]: value });
      } else {
        setLocalConfig({ ...localConfig, wifi: { ...localConfig.wifi, [name]: value } });
      }
    } else if (name.startsWith('parentPickupEmail')) {
      // Handle parent pickup emails
      const idx = parseInt(name.replace('parentPickupEmail', ''));
      const arr = [...(localConfig.parentPickupEmails || ["", ""])]
      arr[idx] = value;
      setLocalConfig({ ...localConfig, parentPickupEmails: arr });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveMsg("");
    await setConfig(localConfig); // setConfig triggers backend save and reloads config in App
    setSaveMsg("Saved successfully!");
    setTimeout(() => setSaveMsg(""), 2000);
  };

  // QR code values
  const wifiReady = localConfig.wifi.ssid && localConfig.wifi.password;
  // Use the dynamic pageUrl prop
  const wifiQR = `WIFI:T:${localConfig.wifi.encryption};S:${localConfig.wifi.ssid};P:${localConfig.wifi.password};;`;

  // Download QR as JPG
  const downloadQR = (ref, filename) => {
    const canvas = ref.current?.querySelector('canvas');
    if (!canvas) return;
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const link = document.createElement('a');
    link.href = imgData;
    link.download = filename;
    link.click();
  };

  // Add logo upload handler
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setLocalConfig({ ...localConfig, logoUrl: ev.target.result });
    };
    reader.readAsDataURL(file);
  };

  return (
    <form
      onSubmit={handleSave}
      style={{
        maxWidth: 600,
        width: '100%',
        margin: '2vw auto',
        fontFamily: 'system-ui, sans-serif',
        background: palette.card,
        borderRadius: 16,
        boxShadow: palette.shadow,
        padding: 16,
        border: `1.5px solid ${palette.border}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        boxSizing: 'border-box',
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        {/* WiFi Section */}
        <section style={{ flex: 1, minWidth: 220, background: palette.sectionBg, borderRadius: 10, padding: 12, boxShadow: '0 2px 8px #1976d111', marginBottom: 0 }}>
          <div style={sectionTitle}>WiFi Details</div>
          <label style={labelStyle}>
            SSID:
            <input
              name="ssid"
              value={localConfig.wifi.ssid || ''}
              onChange={handleChange}
              style={fieldStyle}
              placeholder="Enter WiFi SSID"
            />
          </label>
          <label style={labelStyle}>
            Password:
            <input
              name="password"
              value={localConfig.wifi.password || ''}
              onChange={handleChange}
              style={fieldStyle}
              placeholder="Enter WiFi password"
            />
          </label>
          <label style={labelStyle}>
            Encryption:
            <select
              name="encryption"
              value={localConfig.wifi.encryption || 'WPA'}
              onChange={handleChange}
              style={{ ...fieldStyle, paddingRight: 30 }}
            >
              <option value="WPA">WPA/WPA2</option>
              <option value="WEP">WEP</option>
              <option value="nopass">None</option>
            </select>
          </label>
        </section>
        {/* Gmail Section */}
        <section style={{ flex: 1, minWidth: 220, background: palette.sectionBg, borderRadius: 10, padding: 12, boxShadow: '0 2px 8px #1976d111', marginBottom: 0 }}>
          <div style={sectionTitle}>Gmail Settings</div>
          <label style={labelStyle}>
            Gmail Address:
            <input
              name="gmail"
              value={localConfig.gmail || ''}
              onChange={handleChange}
              style={fieldStyle}
              placeholder="Enter Gmail address"
              type="email"
            />
          </label>
          <label style={labelStyle}>
            Gmail App Password:
            <input
              name="gmailAppPassword"
              value={localConfig.gmailAppPassword || ''}
              onChange={handleChange}
              style={fieldStyle}
              placeholder="Enter Gmail App Password"
              type="password"
            />
          </label>
        </section>
      </div>
      {/* Parent Pickup Email Section */}
      <div style={{ width: '100%', background: palette.sectionBg, borderRadius: 10, padding: 12, boxShadow: '0 2px 8px #1976d111', marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontWeight: 600, color: palette.accent, fontSize: 16 }}>Parent Pickup Email Recipients</div>
        <label style={labelStyle}>
          Email 1:
          <input
            name="parentPickupEmail0"
            value={localConfig.parentPickupEmails?.[0] || ''}
            onChange={handleChange}
            style={fieldStyle}
            placeholder="Enter email for parent pickup notifications"
            type="email"
            autoComplete="off"
          />
        </label>
        <label style={labelStyle}>
          Email 2:
          <input
            name="parentPickupEmail1"
            value={localConfig.parentPickupEmails?.[1] || ''}
            onChange={handleChange}
            style={fieldStyle}
            placeholder="Enter another email (optional)"
            type="email"
            autoComplete="off"
          />
        </label>
        <div style={{ color: '#888', fontSize: 13, marginTop: 2 }}>
          These addresses will receive emails for Parent Pickup submissions only.
        </div>
      </div>
      {/* Logo upload section (admin only, cannot be changed from home) */}
      <div style={{ width: '100%', background: palette.sectionBg, borderRadius: 10, padding: 12, boxShadow: '0 2px 8px #1976d111', marginTop: 8, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ fontWeight: 600, color: palette.accent, fontSize: 16 }}>Logo:</div>
        {localConfig.logoUrl && (
          <img src={localConfig.logoUrl} alt="Logo" style={{ height: 40, objectFit: 'contain', borderRadius: 6, border: `1px solid ${palette.border}` }} />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleLogoChange}
          style={{ marginLeft: 8 }}
        />
      </div>
      {/* QR code section - always below on mobile, right on desktop */}
      <div style={{ width: '100%', background: palette.sectionBg, borderRadius: 10, padding: 12, boxShadow: '0 2px 8px #1976d111', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: 8 }}>
        {wifiReady && (
          <>
            <div style={{ color: palette.accent, fontWeight: 600, marginBottom: 6, fontSize: 15 }}>
              1. Scan to connect WiFi
            </div>
            <div ref={wifiQRRef} style={{ position: 'relative', marginBottom: 4 }}>
              <QRCodeCanvas value={wifiQR} size={100} />
            </div>
            <button
              type="button"
              style={{ marginBottom: 10, fontSize: 13, padding: '4px 10px', borderRadius: 6, border: 'none', background: palette.button, color: palette.buttonText, cursor: 'pointer' }}
              onClick={() => downloadQR(wifiQRRef, 'wifi-qr.jpg')}
            >
              Download as JPG
            </button>
            <div style={{ color: palette.label, fontSize: 11, margin: '8px 0 16px 0' }}>
              After connecting, scan the next QR to open the visitor page
            </div>
            <div style={{ color: palette.accent, fontWeight: 600, marginBottom: 6, fontSize: 15 }}>
              2. Scan to open visitor page
            </div>
            <div ref={pageQRRef} style={{ position: 'relative', marginBottom: 4 }}>
              <QRCodeCanvas value={pageUrl} size={100} />
            </div>
            <button
              type="button"
              style={{ marginBottom: 10, fontSize: 13, padding: '4px 10px', borderRadius: 6, border: 'none', background: palette.button, color: palette.buttonText, cursor: 'pointer' }}
              onClick={() => downloadQR(pageQRRef, 'visitor-page-qr.jpg')}
            >
              Download as JPG
            </button>
            <div style={{ color: palette.label, fontSize: 11, marginTop: 6 }}>
              Or visit: <b>{pageUrl}</b>
            </div>
          </>
        )}
      </div>
      {saveMsg && <div style={{ color: '#1976d2', fontWeight: 600, marginBottom: 8 }}>{saveMsg}</div>}
      <button
        type="submit"
        style={{
          marginTop: 8,
          width: 120,
          alignSelf: 'flex-end',
          padding: "0.7em 0",
          background: palette.button,
          color: palette.buttonText,
          border: 'none',
          borderRadius: 10,
          fontWeight: 700,
          fontSize: 16,
          letterSpacing: 0.5,
          boxShadow: '0 2px 8px #1976d222',
          transition: 'background 0.2s',
          backgroundImage: palette.button,
        }}
        onMouseOver={e => e.currentTarget.style.background = palette.buttonHover}
        onMouseOut={e => e.currentTarget.style.background = palette.button}
      >
        Save
      </button>
    </form>
  );
}
