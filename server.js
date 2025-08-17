import express from 'express';
import nodemailer from 'nodemailer';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

// ===== Paths absolutos (ESM) =====
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ===== Segurança + parsers =====
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== Rate limit só na rota de contato =====
const limiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 5 });
app.use('/contact', limiter);

// ===== SMTP (Render lê das Environment Variables) =====
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: String(process.env.SMTP_SECURE).toLowerCase() === 'true',
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

// Healthcheck
app.get('/health', (_req, res) => res.send('ok'));

// Arquivos estáticos da pasta public (HTML/CSS/JS/Imagens/PDFs)
app.use(express.static(path.join(__dirname, 'public')));

// Rota para forçar download do PDF
app.get('/download/cv', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'Lebenslauf.pdf'); // <— aqui!
  res.download(filePath, 'Diogo-Alves-CV.pdf', (err) => {
    if (err) {
      console.error('Fehler beim Senden der PDF:', err);
      res.status(404).send('Datei wurde nicht gefunden.');
    }
  });
});

// Contato
app.post('/contact', async (req, res) => {
  try {
    const { name, email, phone, subject, message, _hp } = req.body || {};
    if (_hp) return res.sendStatus(200); // honeypot

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Pflichtangaben fehlen.' });
    }

    const html = `
      <h2>Neue Kontaktanfrage erhalten</h2>
      <p><b>Name:</b> ${name}</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Telefon:</b> ${phone || '-'}</p>
      <p><b>Betreff:</b> ${subject}</p>
      <p><b>Nachricht:</b></p>
      <pre style="white-space:pre-wrap;">${message}</pre>
      <hr><small>Enviado pelo site</small>
    `;

    await transporter.sendMail({
      from: `"Portfolio Site" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: process.env.NOTIFY_TO,
      replyTo: email,
      subject: `📬 Formular: ${subject}`,
      html,
    });

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('ERRO /contact:', err);
    res.status(500).json({ error: 'E-Mail konnte nicht gesendet werden'});
  }
});

// ===== Start =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));