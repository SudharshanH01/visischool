import React, { useRef, useState } from "react";

const initialState = {
  whomToMeet: "",
  appointment: "No",
  purpose: "",
  selfie: "",
  childName: "",
  grade: "",
  contact: "",
  parentName: "",
  relationship: "",
};

export default function VisitorParentForm({ config, activeTab }) {
  const [form, setForm] = useState(initialState);
  const [selfiePreview, setSelfiePreview] = useState("");
  const videoRef = useRef(null);

  const startCamera = async () => {
    if (navigator.mediaDevices && videoRef.current) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
        videoRef.current.srcObject = stream;
      } catch (err) {
        alert("Unable to access camera. Please ensure a camera is connected and allowed by your browser.");
      }
    }
  };

  const takeSelfie = () => {
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/png");
    setForm({ ...form, selfie: dataUrl });
    setSelfiePreview(dataUrl);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Backend integration: send form data to backend API
    try {
      await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, config, activeTab }),
      });
      alert('Form submitted!');
    } catch (err) {
      alert('Submission failed.');
    }
    setForm(initialState);
    setSelfiePreview("");
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  // Modern color palette
  const palette = {
    bg: '#f6f8fa',
    card: '#fff',
    accent: '#1976d2',
    accentLight: '#e3f0ff',
    border: '#e0e6ed',
    label: '#222b45',
    inputBg: '#f3f6fa',
    inputText: '#222b45',
    placeholder: '#a0aec0',
    error: '#e53935',
    button: '#1976d2',
    buttonText: '#fff',
    buttonHover: '#1251a3',
  };

  const fieldStyle = {
    width: '100%',
    padding: '0.7em 1em',
    borderRadius: 8,
    border: `1.5px solid ${palette.border}`,
    background: palette.inputBg,
    color: palette.inputText,
    fontSize: 16,
    outline: 'none',
    transition: 'border 0.2s',
    boxSizing: 'border-box', // Ensure consistent sizing
  };

  const labelStyle = {
    color: palette.label,
    fontWeight: 600,
    fontSize: 15,
    display: 'block',
  };

  const sectionTitle = {
    color: palette.accent,
    fontWeight: 700,
    fontSize: 22,
    margin: '0 0 18px 0',
    letterSpacing: 0.5,
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: 420,
        margin: '0 auto',
        fontFamily: 'system-ui, sans-serif',
        background: palette.card,
        borderRadius: 18,
        boxShadow: '0 4px 24px #0002',
        padding: 32,
        border: `1.5px solid ${palette.border}`,
      }}
    >
      {activeTab === 'meeting' && (
        <section>
          <div style={sectionTitle}>Meeting</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={labelStyle}>
              Whom to meet:
              <input
                name="whomToMeet"
                value={form.whomToMeet}
                onChange={handleChange}
                required
                style={fieldStyle}
                placeholder="Enter name of person to meet"
              />
            </label>
            <label style={labelStyle}>
              Appointment:
              <select
                name="appointment"
                value={form.appointment}
                onChange={handleChange}
                style={{ ...fieldStyle, paddingRight: 30 }}
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </label>
            <label style={labelStyle}>
              Purpose of meeting:
              <textarea
                name="purpose"
                value={form.purpose}
                onChange={handleChange}
                required
                style={{ ...fieldStyle, minHeight: 60, resize: 'vertical' }}
                placeholder="Describe the purpose"
              />
            </label>
            <label style={labelStyle}>
              Selfie Photo:
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 8 }}>
                <video
                  ref={videoRef}
                  width={80}
                  height={60}
                  autoPlay
                  style={{ borderRadius: 12, background: palette.inputBg, border: `1.5px solid ${palette.border}` }}
                  onCanPlay={startCamera}
                />
                <button
                  type="button"
                  onClick={() => { startCamera(); setTimeout(takeSelfie, 500); }}
                  style={{
                    padding: '0.5em 1.2em',
                    background: palette.button,
                    color: palette.buttonText,
                    border: 'none',
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: 15,
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                  onMouseOver={e => e.currentTarget.style.background = palette.buttonHover}
                  onMouseOut={e => e.currentTarget.style.background = palette.button}
                >
                  Capture
                </button>
                {selfiePreview && (
                  <img
                    src={selfiePreview}
                    alt="Selfie"
                    width={60}
                    height={60}
                    style={{ borderRadius: "50%", border: `2px solid ${palette.accent}` }}
                  />
                )}
              </div>
            </label>
          </div>
        </section>
      )}
      {activeTab === 'pickup' && (
        <section>
          <div style={sectionTitle}>Parent Pickup</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={labelStyle}>
              Child name:
              <input
                name="childName"
                value={form.childName}
                onChange={handleChange}
                required
                style={fieldStyle}
                placeholder="Enter child's name"
              />
            </label>
            <label style={labelStyle}>
              Grade:
              <input
                name="grade"
                value={form.grade}
                onChange={handleChange}
                required
                style={fieldStyle}
                placeholder="Enter grade"
              />
            </label>
            <label style={labelStyle}>
              Name:
              <input
                name="parentName"
                value={form.parentName}
                onChange={handleChange}
                required
                style={fieldStyle}
                placeholder="Enter your name"
              />
            </label>
            <label style={labelStyle}>
              Contact number:
              <input
                name="contact"
                value={form.contact}
                onChange={handleChange}
                required
                style={fieldStyle}
                placeholder="Enter contact number"
              />
            </label>
            <label style={labelStyle}>
              Relationship to child:
              <input
                name="relationship"
                value={form.relationship}
                onChange={handleChange}
                required
                style={fieldStyle}
                placeholder="e.g. Father, Mother, Guardian"
              />
            </label>
            <label style={labelStyle}>
              Selfie Photo:
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 8 }}>
                <video
                  ref={videoRef}
                  width={80}
                  height={60}
                  autoPlay
                  style={{ borderRadius: 12, background: palette.inputBg, border: `1.5px solid ${palette.border}` }}
                  onCanPlay={startCamera}
                />
                <button
                  type="button"
                  onClick={() => { startCamera(); setTimeout(takeSelfie, 500); }}
                  style={{
                    padding: '0.5em 1.2em',
                    background: palette.button,
                    color: palette.buttonText,
                    border: 'none',
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: 15,
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                  onMouseOver={e => e.currentTarget.style.background = palette.buttonHover}
                  onMouseOut={e => e.currentTarget.style.background = palette.button}
                >
                  Capture
                </button>
                {selfiePreview && (
                  <img
                    src={selfiePreview}
                    alt="Selfie"
                    width={60}
                    height={60}
                    style={{ borderRadius: "50%", border: `2px solid ${palette.accent}` }}
                  />
                )}
              </div>
            </label>
          </div>
        </section>
      )}
      <button
        type="submit"
        style={{
          marginTop: 24,
          width: "100%",
          padding: "0.9em",
          background: palette.button,
          color: palette.buttonText,
          border: 'none',
          borderRadius: 10,
          fontWeight: 700,
          fontSize: 19,
          letterSpacing: 0.5,
          boxShadow: '0 2px 8px #1976d222',
          transition: 'background 0.2s',
        }}
        onMouseOver={e => e.currentTarget.style.background = palette.buttonHover}
        onMouseOut={e => e.currentTarget.style.background = palette.button}
      >
        Submit
      </button>
    </form>
  );
}
