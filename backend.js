const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const app = express();
const PORT = 3001;

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

app.post('/api/submit', async (req, res) => {
  const { whomToMeet, appointment, purpose, selfie, childName, grade, contact, parentName, config, activeTab } = req.body;
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

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
