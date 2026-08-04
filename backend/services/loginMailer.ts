import { createTransport } from 'nodemailer'
import { prisma } from '@backend/db'

// Initialize transporter with SMTP config
export const transporter = createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendLoginNotification(user: {
  name: string
  email: string
  phone?: string | null
}, ip: string): Promise<void> {
  const toEmail = process.env.SMTP_TO || process.env.SMTP_USER || 'sharol@sharol.tienda'

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;background:#f7f7f7;padding:24px;border-radius:12px;">
    <div style="background:#0d0d0d;color:#fff;padding:20px 24px;border-radius:12px 12px 0 0;text-align:center;">
      <h1 style="margin:0;font-size:20px;letter-spacing:2px;">SHAROL TIENDA</h1>
      <p style="margin:4px 0 0;font-size:12px;color:#fda4af;">Notificación de inicio de sesión</p>
    </div>
    <div style="background:#fff;padding:24px;border-radius:0 0 12px 12px;color:#333;">
      <h2 style="margin:0 0 16px;font-size:18px;">Has iniciado sesión en tu cuenta</h2>

      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr>
          <td style="padding:4px 0;color:#888;">Cliente</td>
          <td style="padding:4px 0;text-align:right;font-weight:600;">${user.name}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#888;">Correo</td>
          <td style="padding:4px 0;text-align:right;">${user.email}</td>
        </tr>
        ${user.phone
    ? `
            <tr>
              <td style="padding:4px 0;color:#888;">Celular / WhatsApp</td>
              <td style="padding:4px 0;text-align:right;">${user.phone}</td>
            </tr>`
    : ''}
        <tr>
          <td style="padding:4px 0;color:#888;">IP de origen</td>
          <td style="padding:4px 0;text-align:right;">${ip}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#888;">Fecha y hora</td>
          <td style="padding:4px 0;text-align:right;">${new Date().toLocaleString('es-PE')}</td>
        </tr>
      </table>

      <p style="margin-top:20px;font-size:12px;color:#888;">
        Si no fuiste tú quien inició sesión, por favor cambia tu contraseña inmediatamente.
      </p>
    </div>
  </div>`

  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'Sharol Tienda <no-reply@sharol.tienda>',
    to: [toEmail],
    subject: `🔔 Nuevo inicio de sesión - ${user.email}`,
    html,
  })
}