import React, { useState } from "react";

export default function AdminLogin({ onLogin }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (user === "admin" && pass === "Admin@123") {
      onLogin();
    } else {
      setError("Invalid credentials");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{
      maxWidth: 340,
      margin: '4em auto',
      background: '#fff',
      borderRadius: 14,
      boxShadow: '0 4px 24px #0002',
      padding: 32,
      border: '1.5px solid #e0e6ed',
      fontFamily: 'system-ui, sans-serif',
      boxSizing: 'border-box',
      width: '100%',
      minWidth: 0,
    }}>
      <h2 style={{ color: '#1976d2', marginBottom: 24 }}>Admin Login</h2>
      <label style={{ color: '#222b45', fontWeight: 600, fontSize: 15, display: 'block', marginBottom: 8 }}>
        User ID
        <input
          value={user}
          onChange={e => setUser(e.target.value)}
          style={{ width: '100%', padding: '0.7em 1em', borderRadius: 8, border: '1.5px solid #e0e6ed', background: '#f3f6fa', color: '#222b45', fontSize: 16, marginTop: 4, marginBottom: 16 }}
          placeholder="Enter User ID"
          autoComplete="off"
        />
      </label>
      <label style={{ color: '#222b45', fontWeight: 600, fontSize: 15, display: 'block', marginBottom: 8 }}>
        Password
        <input
          type="password"
          value={pass}
          onChange={e => setPass(e.target.value)}
          style={{ width: '100%', padding: '0.7em 1em', borderRadius: 8, border: '1.5px solid #e0e6ed', background: '#f3f6fa', color: '#222b45', fontSize: 16, marginTop: 4, marginBottom: 16 }}
          placeholder="Enter Password"
          autoComplete="new-password"
        />
      </label>
      {error && <div style={{ color: '#e53935', marginBottom: 12 }}>{error}</div>}
      <button type="submit" style={{ width: '100%', padding: '0.9em', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 19, letterSpacing: 0.5, boxShadow: '0 2px 8px #1976d222', transition: 'background 0.2s' }}>
        Login
      </button>
    </form>
  );
}
