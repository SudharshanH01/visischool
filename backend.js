import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- CONFIG STORAGE (MongoDB) ---
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'visiskool';
const COLLECTION = 'adminConfig';
const client = new MongoClient(MONGODB_URI, { useUnifiedTopology: true });

async function getConfig() {
  await client.connect();
  const db = client.db(DB_NAME);
  const config = await db.collection(COLLECTION).findOne({});
  return config || {};
}
async function setConfig(newConfig) {
  await client.connect();
  const db = client.db(DB_NAME);
  await db.collection(COLLECTION).deleteMany({});
  await db.collection(COLLECTION).insertOne(newConfig);
}

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
    attachments: imageData || [],
  };
  console.log('Sending email with options:', mailOptions);
  try {
    let info = await transporter.sendMail(mailOptions);
    console.log('Email sent!', info);
  } catch (e) {
    console.error('Nodemailer error:', e);
    throw e;
  }
}

// --- API to get/set config (MongoDB) ---
app.get('/api/config', async (req, res) => {
  try {
    const config = await getConfig();
    if (config) return res.json(config);
    res.status(404).json({ error: 'No config found' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load config' });
  }
});
app.post('/api/config', async (req, res) => {
  try {
    await setConfig(req.body);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save config' });
  }
});

app.post('/api/submit', async (req, res) => {
  // Use backend config if not provided in request
  let config = req.body.config;
  if (!config) config = await getConfig();
  const { whomToMeet, appointment, purpose, selfie, childName, grade, contact, parentName, relationship, activeTab } = req.body;

  // Compose subject and message body based on form type
  let subject = '';
  let msg = '';
  if (activeTab === 'pickup') {
    subject = 'Parent pickup request';
    msg = `Parent Pickup Request\nChild: ${childName}\nGrade: ${grade}\nRelationship: ${relationship}\nParent Name: ${parentName}\nContact: ${contact}`;
  } else {
    subject = 'Meeting request';
    msg = `Meeting Request\nWhom to meet: ${whomToMeet}\nAppointment: ${appointment}\nPurpose: ${purpose}`;
  }

  try {
    sendWhatsApp(config.whatsappNumbers, msg);
    let emailRecipients = config.emails;
    if (activeTab === 'pickup' && config.parentPickupEmails) {
      // For parent pickup, send to both default and parent pickup emails
      emailRecipients = [...(config.emails || []), ...(config.parentPickupEmails || [])];
    }
    // Fix: send selfie as jpg for better compatibility
    let selfieAttachment = null;
    if (selfie && selfie.startsWith('data:image/')) {
      // Convert to jpg if possible
      const base64 = selfie.split(',')[1];
      selfieAttachment = [{ filename: 'selfie.jpg', content: Buffer.from(base64, 'base64') }];
    }
    await sendEmail(
      emailRecipients,
      subject,
      msg,
      selfieAttachment,
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
