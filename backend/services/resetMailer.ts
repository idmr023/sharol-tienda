import { Resend } from 'resend'

const API_KEY = process.env.RESEND_API_KEY
const FROM = process.env.MAIL_FROM || 'Sharol Tienda <onboarding@resend.dev>'

function buildResetHtml(code: string): string {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;background:#f7f7f7;padding:24px;border-radius:12px;">
    <div style="background:#0d0d0d;color:#fff;padding:20px 24px;border-radius:12px 12px 0 0;text-align:center;">
      <h1 style="margin:0;font-size:20px;letter-spacing:2px;">SHAROL TIENDA</h1>
      <p style="margin:4px 0 0;font-size:12px;color:#fda4af;">Recuperación de contraseña</p>
    </div>
    <div style="background:#fff;padding:24px;border-radius:0 0 12px 12px;color:#333;text-align:center;">
      <h2 style="margin:0 0 12px;font-size:18px;color:#111;">¿Solicitaste restablecer tu contraseña?</h2>
      <p style="margin:0 0 20px;font-size:14px;color:#666;">
        Usa el siguiente código de verificación de 6 dígitos para continuar con el proceso. Este código expira en 30 minutos.
      </p>

      <div style="margin:24px 0;padding:16px;background:#fff1f2;border:1px solid #fecdd3;border-radius:12px;display:inline-block;">
        <span style="font-family:monospace;font-size:32px;font-weight:bold;letter-spacing:0.3em;color:#e11d48;">
          ${code}
        </span>
      </div>

      <p style="margin:24px 0 0;font-size:12px;color:#888;">
        Si no solicitaste este cambio, puedes ignorar este correo de forma segura.
      </p>
    </div>
  </div>`
}

export async function sendResetPasswordEmail(email: string, code: string): Promise<void> {
  if (!API_KEY) {
    console.warn(
      `[resetMailer] RESEND_API_KEY no configurada; no se envió el correo de recuperación a ${email}. Código: ${code}`
    )
    return
  }

  const resend = new Resend(API_KEY)
  const { error } = await resend.emails.send({
    from: FROM,
    to: [email],
    subject: '🔐 Código de recuperación de contraseña — Sharol Tienda',
    html: buildResetHtml(code),
  })

  if (error) {
    throw new Error(`Resend: ${error.message}`)
  }
}
