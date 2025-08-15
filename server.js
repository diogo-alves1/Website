// server.js
import express from 'express';
import nodemailer from 'nodemailer';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

// segurança + parsers
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// rate limit só na rota de contato
const limiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 5 });
app.use('/contact', limiter);

// transport SMTP (Render lê do painel de Environment Variables)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: String(process.env.SMTP_SECURE).toLowerCase() === 'true',
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});

// rota de contato
app.post('/contact', async (req, res) => {
  try {
    const { name, email, phone, subject, message, _hp } = req.body || {};
    if (_hp) return res.sendStatus(200); // honeypot

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando.' });
    }

    const html = `
      <h2>Novo contato recebido</h2>
      <p><b>Nome:</b> ${name}</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Telefone:</b> ${phone || '-'}</p>
      <p><b>Assunto:</b> ${subject}</p>
      <p><b>Mensagem:</b></p>
      <pre style="white-space:pre-wrap;">${message}</pre>
      <hr><small>Enviado pelo site</small>
    `;

    await transporter.sendMail({
      from: `"Portfolio Site" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: process.env.NOTIFY_TO,
      replyTo: email,
      subject: `📬 Formulário: ${subject}`,
      html
    });

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('ERRO /contact:', err);
    res.status(500).json({ error: 'Erro ao enviar e-mail.' });
  }
});

// healthcheck e arquivos estáticos
app.get('/health', (_req, res) => res.send('ok'));
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor no ar na porta ${PORT}`));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ... seu código (helmet, static, etc.)

// rota que força download
app.get('/download/cv', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'CV1', 'Lebenslauf.pdf');
  res.download(filePath, 'Diogo-Alves-CV.pdf'); // Content-Disposition: attachment
});