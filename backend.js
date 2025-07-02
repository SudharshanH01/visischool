import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- CONFIG STORAGE ---
const CONFIG_PATH = path.join(__dirname, 'admin-config.json');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

// Dummy WhatsApp send function (replace with real API integration)
function sendWhatsApp(numbers, message) {
  console.log('WhatsApp to', numbers, ':', message);
}

// Email send function
async function sendEmail(emails, subject, text, imageData, gmail, gmailAppPassword) {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmail,
      pass: gmailAppPassword,
    },
  });
  let mailOptions = {
    from: gmail,
    to: emails.filter(Boolean).join(','),
    subject,
    text,
    attachments: imageData
      ? [{ filename: 'selfie.png', content: Buffer.from(imageData.split(',')[1], 'base64') }]
      : [],
  };
  await transporter.sendMail(mailOptions);
}

// --- CONFIG STORAGE ---
function loadConfig() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  } catch {
    return null;
  }
}
function saveConfig(config) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
}

// --- API to get/set config ---
app.get('/api/config', (req, res) => {
  const config = loadConfig();
  if (config) return res.json(config);
  res.status(404).json({ error: 'No config found' });
});
app.post('/api/config', (req, res) => {
  saveConfig(req.body);
  res.json({ ok: true });
});

app.post('/api/submit', async (req, res) => {
  // Use backend config if not provided in request
  let config = req.body.config;
  if (!config) config = loadConfig();
  const { whomToMeet, appointment, purpose, selfie, childName, grade, contact, parentName, activeTab } = req.body;
  const msg = `Meeting: Whom to meet: ${whomToMeet}, Appointment: ${appointment}, Purpose: ${purpose}\nParent Pickup: Child: ${childName}, Grade: ${grade}, Contact: ${contact}, Name: ${parentName}`;
  try {
    sendWhatsApp(config.whatsappNumbers, msg);
    let emailRecipients = config.emails;
    if (activeTab === 'pickup' && config.parentPickupEmails) {
      // For parent pickup, send to both default and parent pickup emails
      emailRecipients = [...(config.emails || []), ...(config.parentPickupEmails || [])];
    }
    await sendEmail(
      emailRecipients,
      'Visitor/Parent Form Submission',
      msg,
      selfie,
      config.gmail,
      config.gmailAppPassword
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to send' });
  }
});

// Serve frontend (dist) for Render deployment
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
