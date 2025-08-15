// server.js
import express from 'express';
import nodemailer from 'nodemailer';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// limitar spam: máx 5 submits/10min por IP
const limiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 5 });
app.use('/contact', limiter);

// transporte de e-mail (use seu SMTP)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,          // ex: "smtp.gmail.com"
  port: Number(process.env.SMTP_PORT),  // ex: 465
  secure: process.env.SMTP_SECURE === 'true', // true p/ 465, false p/ 587
  auth: {
    user: process.env.SMTP_USER,       // seu e-mail SMTP
    pass: process.env.SMTP_PASS         // senha/app password
  }
});

// rota de contato
app.post('/contact', async (req, res) => {
  try {
    console.log('REQ BODY:', req.body);
    const { name, email, phone, subject, message, _hp } = req.body || {};
    if (_hp) return res.status(200).end(); // honeypot

    if (!name || !email || !subject || !message) {
      console.log('Faltando campos:', { name, email, subject, message });
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
      <hr>
      <small>Enviado pelo site</small>
    `;

    await transporter.sendMail({
        from: `"Portfolio Site" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: process.env.NOTIFY_TO,
        replyTo: email,                        // <= vem do formulário, dinâmico
        subject: `📬 Formulário: ${subject}`,
        html
    });

    return res.status(200).json({ ok: true });
    } catch (err) {
    console.error('ERRO /contact:', err);
    return res.status(500).json({ error: 'Erro ao enviar e-mail.' });
  }
});

// arquivos estáticos (HTML/CSS/JS) em /public
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor no ar em http://localhost:${PORT}`));